import type { SseEvent, VectorResult, WebResult } from "@/types/research";

const MOCK_WEB_SOURCES: WebResult[] = [
  {
    title: "Retrieval-Augmented Generation for Knowledge-Intensive NLP",
    url: "https://arxiv.org/abs/2005.11401",
    snippet:
      "RAG combines parametric and non-parametric memory for improved generation on knowledge-intensive tasks.",
    publishedDate: "2020-05-22",
  },
  {
    title: "LangGraph: Building Stateful Multi-Agent Applications",
    url: "https://langchain-ai.github.io/langgraph/",
    snippet:
      "LangGraph extends LangChain with cycles, persistence, and human-in-the-loop for agent workflows.",
  },
  {
    title: "pgvector: Open-Source Vector Similarity Search for Postgres",
    url: "https://github.com/pgvector/pgvector",
    snippet:
      "Store embeddings in PostgreSQL and run efficient similarity search with cosine, L2, and inner product.",
  },
  {
    title: "Observability for LLM Applications with Langfuse",
    url: "https://langfuse.com/docs",
    snippet:
      "Trace prompts, monitor costs, score outputs, and debug multi-step agent pipelines in production.",
  },
];

const MOCK_VECTOR_SOURCES: VectorResult[] = [
  {
    id: "mem-1",
    question: "How does semantic memory work in research agents?",
    snippet:
      "Past report: embeddings stored in pgvector enable cosine similarity retrieval above 0.75 threshold.",
    score: 0.89,
  },
  {
    id: "mem-2",
    question: "SSE streaming patterns for React frontends",
    snippet:
      "Prior notes: use ReadableStream parsing with token batching via requestAnimationFrame.",
    score: 0.81,
  },
];

function buildMockReport(question: string): string {
  return `# Research Report

## Executive Summary

This is **mock data** for UI testing. Your question was:

> ${question}

The agent simulated web search, vector retrieval, reranking, and synthesis.

## Key Findings

1. **RAG** improves factual grounding by retrieving relevant documents before generation.
2. **LangGraph** models agent workflows as graphs with explicit state and step transitions.
3. **pgvector** provides durable semantic memory without a separate vector database.
4. **Langfuse** traces each node for latency, tokens, and cost visibility.

## Sources

- Web results from Tavily (simulated)
- ${MOCK_WEB_SOURCES.length} documents retrieved
- ${MOCK_VECTOR_SOURCES.length} items from semantic memory

## Gaps & Next Steps

- Connect the real backend at \`POST /api/research\`
- Set \`VITE_USE_MOCK=false\` to use live agent data
- Add API keys for Anthropic, Tavily, and OpenAI embeddings
`;
}

/** Only when explicitly enabled — default is real API */
export const USE_MOCK =
  import.meta.env.VITE_USE_MOCK === "true" ||
  import.meta.env.VITE_USE_MOCK === "1";

function delay(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException("Aborted", "AbortError"));
      return;
    }
    const id = setTimeout(resolve, ms);
    signal?.addEventListener(
      "abort",
      () => {
        clearTimeout(id);
        reject(new DOMException("Aborted", "AbortError"));
      },
      { once: true },
    );
  });
}

export async function runMockResearchStream(
  question: string,
  onEvent: (event: SseEvent) => void,
  signal?: AbortSignal,
): Promise<void> {
  const report = buildMockReport(question);
  const tokens = report.split(/(?=\s)/);

  const stepDelay = 1000;

  // First step (web_search) is already active when the stream starts
  const steps: Array<{ step: SseEvent; wait: number }> = [
    {
      wait: 800,
      step: {
        type: "sources",
        data: { web: MOCK_WEB_SOURCES, vector: [] },
      },
    },
    {
      wait: stepDelay,
      step: { type: "step", data: { step: "vector_retrieval" } },
    },
    {
      wait: 500,
      step: {
        type: "sources",
        data: { web: MOCK_WEB_SOURCES, vector: MOCK_VECTOR_SOURCES },
      },
    },
    {
      wait: stepDelay,
      step: { type: "step", data: { step: "reranking" } },
    },
    {
      wait: stepDelay,
      step: { type: "step", data: { step: "synthesis" } },
    },
  ];

  for (const { step, wait } of steps) {
    await delay(wait, signal);
    onEvent(step);
  }

  for (const token of tokens) {
    await delay(28, signal);
    onEvent({ type: "token", data: { text: token } });
  }

  await delay(300, signal);
  onEvent({
    type: "complete",
    data: { report },
  });
}
