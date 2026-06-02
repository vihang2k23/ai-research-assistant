import type { AgentStep, Source, VectorResult, WebResult } from "./events.js";

export interface AgentState {
  question: string;
  webResults: WebResult[];
  vectorResults: VectorResult[];
  rerankedSources: Source[];
  report: string;
  currentStep: AgentStep;
  error?: string;
}
