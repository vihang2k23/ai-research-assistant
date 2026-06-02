import type { AgentState } from "@research/shared-types";

export type { AgentState };

export function createInitialState(question: string): AgentState {
  return {
    question,
    webResults: [],
    vectorResults: [],
    rerankedSources: [],
    report: "",
    currentStep: "init",
  };
}
