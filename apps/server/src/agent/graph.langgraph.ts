import {
  Annotation,
  END,
  START,
  StateGraph,
  type CompiledStateGraph,
} from "@langchain/langgraph";
import type {
  AgentStep,
  Source,
  VectorResult,
  WebResult,
} from "@research/shared-types";
import { rerankNode } from "./nodes/rerank.js";
import { vectorRetrievalNode } from "./nodes/vectorRetrieval.js";
import { webSearchNode } from "./nodes/webSearch.js";
import { createInitialState, type AgentState } from "./state.js";

const ResearchState = Annotation.Root({
  question: Annotation<string>,
  webResults: Annotation<WebResult[]>,
  vectorResults: Annotation<VectorResult[]>,
  rerankedSources: Annotation<Source[]>,
  report: Annotation<string>,
  currentStep: Annotation<AgentStep>,
  error: Annotation<string | undefined>,
});

type GraphState = typeof ResearchState.State;

function asAgentState(state: GraphState): AgentState {
  return state as AgentState;
}

/** LangGraph batch pipeline (web → vector → rerank). SSE + synthesis: runLiveAgent.ts */
export function buildResearchGraph(): CompiledStateGraph<
  GraphState,
  Partial<GraphState>,
  string
> {
  return new StateGraph(ResearchState)
    .addNode("webSearch", async (state) =>
      webSearchNode(asAgentState(state)),
    )
    .addNode("vectorRetrieval", async (state) =>
      vectorRetrievalNode(asAgentState(state)),
    )
    .addNode("rerank", async (state) => rerankNode(asAgentState(state)))
    .addEdge(START, "webSearch")
    .addEdge("webSearch", "vectorRetrieval")
    .addEdge("vectorRetrieval", "rerank")
    .addEdge("rerank", END)
    .compile();
}

export async function invokeResearchGraph(question: string): Promise<GraphState> {
  const app = buildResearchGraph();
  const result = await app.invoke(createInitialState(question));
  return result as GraphState;
}
