import type { SseEvent } from "@research/shared-types";
import { rerankNode } from "./nodes/rerank.js";
import { synthesisNode } from "./nodes/synthesis.js";
import { vectorRetrievalNode } from "./nodes/vectorRetrieval.js";
import { webSearchNode } from "./nodes/webSearch.js";
import { createInitialState, type AgentState } from "./state.js";
import { Langfuse } from "langfuse";

const langfuse = new Langfuse({
  publicKey: process.env.LANGFUSE_PUBLIC_KEY,
  secretKey: process.env.LANGFUSE_SECRET_KEY,
  baseUrl: process.env.LANGFUSE_HOST ?? "https://cloud.langfuse.com"
});

export type AgentStreamEmitter = (event: SseEvent) => void;

function mergeState(state: AgentState, patch: Partial<AgentState>): AgentState {
  return { ...state, ...patch };
}

export async function runLiveAgent(
  question: string,
  emit: AgentStreamEmitter,
  signal?: AbortSignal,
): Promise<void> {
  let state = createInitialState(question);

  const trace = langfuse.trace({
    name: "research-agent-run",
    input: { question },
    tags: ["research-agent"]
  });

  emit({ type: "step", data: { step: "web_search" } });
  const webSpan = trace.span({ name: "web_search", input: { question: state.question } });
  state = mergeState(state, await webSearchNode(state));
  webSpan.end({ output: state.webResults });
  emit({
    type: "sources",
    data: { web: state.webResults, vector: [] },
  });

  emit({ type: "step", data: { step: "vector_retrieval" } });
  const vectorSpan = trace.span({ name: "vector_retrieval", input: { question: state.question } });
  try {
    state = mergeState(state, await vectorRetrievalNode(state));
    vectorSpan.end({ output: state.vectorResults });
  } catch (err) {
    console.warn("Vector retrieval skipped:", err);
    state.vectorResults = [];
    vectorSpan.end({ level: "ERROR", statusMessage: String(err) });
  }
  emit({
    type: "sources",
    data: { web: state.webResults, vector: state.vectorResults },
  });

  emit({ type: "step", data: { step: "reranking" } });
  const rerankSpan = trace.span({ name: "reranking", input: { web: state.webResults, vector: state.vectorResults } });
  state = mergeState(state, await rerankNode(state));
  rerankSpan.end({ output: state.rerankedSources });

  emit({ type: "step", data: { step: "synthesis" } });
  const synthSpan = trace.span({ name: "synthesis", input: { sources: state.rerankedSources } });
  state = mergeState(
    state,
    await synthesisNode(
      state,
      (text) => emit({ type: "token", data: { text } }),
      signal,
    ),
  );
  synthSpan.end({ output: { report: state.report } });

  state.currentStep = "complete";

  emit({
    type: "complete",
    data: { report: state.report },
  });

  trace.update({ output: { report: state.report } });
  await langfuse.flushAsync();
}
