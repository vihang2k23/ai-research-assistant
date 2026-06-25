import { saveResearchDocument } from "../../db/researchDocuments.js";
import { embedText } from "../../tools/embeddings.js";
import { streamGeminiText } from "../../tools/gemini.js";
import type { AgentState } from "../state.js";

const SYSTEM_PROMPT = `You are a research assistant. Write a structured markdown report with these sections:
## Executive Summary
## Key Findings
## Sources
## Gaps & Next Steps
Use bullet points where appropriate. Be factual and cite source titles from the context.`;

function buildUserPrompt(state: AgentState): string {
  const sources = state.rerankedSources
    .map(
      (s, i) =>
        `[${i + 1}] (${s.type}) ${s.title}\n${s.snippet}${s.url.startsWith("memory://") ? "" : `\nURL: ${s.url}`}`,
    )
    .join("\n\n");

  return `Research question: ${state.question}

Sources:
${sources || "No sources available."}

Write the report now.`;
}

export async function* streamSynthesis(
  state: AgentState,
  signal?: AbortSignal,
): AsyncGenerator<string> {
  yield* streamGeminiText(buildUserPrompt(state), SYSTEM_PROMPT, signal);
}

export async function synthesisNode(
  state: AgentState,
  onToken: (text: string) => void,
  signal?: AbortSignal,
): Promise<Partial<AgentState>> {
  let report = "";

  for await (const token of streamSynthesis(state, signal)) {
    if (signal?.aborted) {
      const err = new Error("Aborted");
      err.name = "AbortError";
      throw err;
    }
    report += token;
    onToken(token);
  }

  let embedding: number[] | undefined;
  try {
    embedding = await embedText(report);
  } catch (err) {
    console.warn("Could not embed report for Postgres — saving without embedding:", err);
  }

  await saveResearchDocument({
    question: state.question,
    report,
    sources: state.rerankedSources.map((s) => ({
      title: s.title,
      url: s.url.startsWith("memory://") ? undefined : s.url,
      snippet: s.snippet,
      type: s.type,
    })),
    embedding,
  });

  return {
    report,
    currentStep: "synthesis",
  };
}
