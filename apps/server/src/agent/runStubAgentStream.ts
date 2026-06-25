import type { SseEvent, VectorResult, WebResult } from "@research/shared-types";

function abortError(): Error {
  const err = new Error("Aborted");
  err.name = "AbortError";
  return err;
}

const STUB_WEB: WebResult[] = [
  {
    title: "Retrieval-Augmented Generation for Knowledge-Intensive NLP",
    url: "https://arxiv.org/abs/2005.11401",
    snippet: "RAG combines parametric and non-parametric memory for knowledge-intensive tasks.",
  },
];

const STUB_VECTOR: VectorResult[] = [
  {
    id: "stub-1",
    question: "Semantic memory in research agents",
    snippet: "Embeddings in Postgres enable semantic similarity retrieval.",
    score: 0.87,
  },
];

function delay(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(abortError());
      return;
    }
    const id = setTimeout(resolve, ms);
    signal?.addEventListener(
      "abort",
      () => {
        clearTimeout(id);
        reject(abortError());
      },
      { once: true },
    );
  });
}

function buildReport(question: string): string {
  return `# Research Report

## Executive Summary

Backend stub response for: **${question}**

Replace \`runStubAgentStream\` with the LangGraph agent in \`graph.ts\`.

## Key Findings

1. SSE contract matches \`@research/shared-types\`
2. Frontend is ready — set \`VITE_USE_MOCK=false\`
3. Implement nodes in \`src/agent/nodes/\`

## Gaps

- Tavily, Gemini API key, Postgres
`;
}

/** Temporary stream until LangGraph nodes are implemented */
export async function runStubAgentStream(
  question: string,
  emit: (event: SseEvent) => void,
  signal?: AbortSignal,
): Promise<void> {
  const stepMs = 1000;
  const report = buildReport(question);
  const tokens = report.split(/(?=\s)/);

  emit({ type: "step", data: { step: "web_search" } });
  await delay(stepMs, signal);
  emit({ type: "sources", data: { web: STUB_WEB, vector: [] } });

  emit({ type: "step", data: { step: "vector_retrieval" } });
  await delay(stepMs, signal);
  emit({ type: "sources", data: { web: STUB_WEB, vector: STUB_VECTOR } });

  emit({ type: "step", data: { step: "reranking" } });
  await delay(stepMs, signal);

  emit({ type: "step", data: { step: "synthesis" } });
  await delay(400, signal);

  for (const text of tokens) {
    await delay(20, signal);
    emit({ type: "token", data: { text } });
  }

  emit({
    type: "complete",
    data: { report },
  });
}
