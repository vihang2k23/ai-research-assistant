import { getGeminiApiKeys } from "../lib/config.js";

const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta";

/** See https://ai.google.dev/gemini-api/docs/models — 1.5-flash is no longer available */
const CHAT_MODEL_FALLBACKS = [
  process.env.GEMINI_CHAT_MODEL?.trim(),
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
].filter((m): m is string => Boolean(m));

/** text-embedding-004 was shut down Jan 2026 — use gemini-embedding-001 */
const EMBED_MODEL_FALLBACKS = [
  process.env.GEMINI_EMBED_MODEL?.trim(),
  "gemini-embedding-001",
].filter((m): m is string => Boolean(m));

function geminiHeaders(apiKey: string): HeadersInit {
  return {
    "Content-Type": "application/json",
    "x-goog-api-key": apiKey,
  };
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function shouldTryNext(status: number): boolean {
  return status === 429 || status === 403 || status === 404;
}

export async function embedTextGemini(text: string): Promise<number[]> {
  const keys = getGeminiApiKeys();
  let lastError = "";

  for (const model of EMBED_MODEL_FALLBACKS) {
    const url = `${GEMINI_BASE}/models/${model}:embedContent`;

    for (let i = 0; i < keys.length; i++) {
      const apiKey = keys[i]!;

      const response = await fetch(url, {
        method: "POST",
        headers: geminiHeaders(apiKey),
        body: JSON.stringify({
          model: `models/${model}`,
          content: { parts: [{ text: text.slice(0, 8000) }] },
          taskType: "RETRIEVAL_DOCUMENT",
          outputDimensionality: 768,
        }),
      });

      if (response.ok) {
        const data = (await response.json()) as {
          embedding?: { values?: number[] };
        };
        const values = data.embedding?.values;
        if (!values?.length) {
          throw new Error("Gemini returned an empty embedding");
        }
        console.log(`Gemini embeddings: ${model}, key #${i + 1}`);
        return values;
      }

      const body = await response.text();
      lastError = body;

      if (shouldTryNext(response.status) && i < keys.length - 1) {
        console.warn(
          `Gemini embed ${response.status} on key #${i + 1}, trying key #${i + 2}…`,
        );
        continue;
      }

      if (shouldTryNext(response.status)) {
        console.warn(`Gemini embed failed for ${model}, trying next model…`);
        break;
      }

      throw new Error(`Gemini embeddings failed (${response.status}): ${body}`);
    }
  }

  throw new Error(`Gemini embeddings failed: ${lastError}`);
}

async function streamGeminiWithModel(
  model: string,
  apiKey: string,
  userPrompt: string,
  systemPrompt: string,
  signal?: AbortSignal,
): Promise<Response> {
  const url = `${GEMINI_BASE}/models/${model}:streamGenerateContent?alt=sse`;

  return fetch(url, {
    method: "POST",
    headers: geminiHeaders(apiKey),
    signal,
    body: JSON.stringify({
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents: [{ role: "user", parts: [{ text: userPrompt }] }],
      generationConfig: { maxOutputTokens: 4096 },
    }),
  });
}

export async function* streamGeminiText(
  userPrompt: string,
  systemPrompt: string,
  signal?: AbortSignal,
): AsyncGenerator<string> {
  const keys = getGeminiApiKeys();
  let response: Response | null = null;
  let lastError = "";
  let usedKey = 0;
  let usedModel = "";

  for (const model of CHAT_MODEL_FALLBACKS) {
    for (let i = 0; i < keys.length; i++) {
      response = await streamGeminiWithModel(
        model,
        keys[i]!,
        userPrompt,
        systemPrompt,
        signal,
      );

      if (response.ok) {
        usedKey = i;
        usedModel = model;
        break;
      }

      const body = await response.text();
      lastError = body;

      if (shouldTryNext(response.status)) {
        const reason =
          response.status === 404
            ? `model ${model} not found`
            : "quota/rate limit";
        if (i < keys.length - 1) {
          console.warn(
            `Gemini ${reason} on key #${i + 1}, trying key #${i + 2}…`,
          );
          const retrySec = body.match(/retry in ([\d.]+)s/i)?.[1];
          if (retrySec) await sleep(Number(retrySec) * 1000);
          continue;
        }
        console.warn(`Gemini ${reason} on all keys, trying next model…`);
        const retrySec = body.match(/retry in ([\d.]+)s/i)?.[1];
        if (retrySec) await sleep(Number(retrySec) * 1000);
        break;
      }

      throw new Error(`Gemini chat failed (${response.status}): ${body}`);
    }

    if (response?.ok) break;
  }

  if (!response?.ok) {
    throw new Error(
      `Gemini quota exceeded on all keys and models. Wait and retry, or add GEMINI_API_KEY_2 — last error: ${lastError}`,
    );
  }

  console.log(
    `Gemini chat using key #${usedKey + 1}, model: ${usedModel}`,
  );

  const reader = response.body?.getReader();
  if (!reader) throw new Error("Gemini returned no response body");

  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (!line.startsWith("data:")) continue;
      const json = line.slice(5).trim();
      if (!json || json === "[DONE]") continue;

      try {
        const chunk = JSON.parse(json) as {
          candidates?: Array<{
            content?: { parts?: Array<{ text?: string }> };
          }>;
        };
        const text = chunk.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) yield text;
      } catch {
        // skip malformed SSE chunks
      }
    }
  }
}
