import { create } from "zustand";
import type { AgentStep, StreamStatus, VectorResult, WebResult } from "@/types/research";

interface ResearchStore {
  question: string;
  currentStep: AgentStep;
  streamStatus: StreamStatus;
  streamedText: string;
  report: string;
  webSources: WebResult[];
  vectorSources: VectorResult[];
  error: Error | null;
  retryable: boolean;

  setQuestion: (question: string) => void;
  setStep: (step: AgentStep) => void;
  setStreamStatus: (status: StreamStatus) => void;
  appendToken: (text: string) => void;
  setReport: (report: string) => void;
  setSources: (web: WebResult[], vector: VectorResult[]) => void;
  setError: (error: Error | null, retryable?: boolean) => void;
  reset: () => void;
}

const initialState = {
  question: "",
  currentStep: "init" as AgentStep,
  streamStatus: "idle" as StreamStatus,
  streamedText: "",
  report: "",
  webSources: [] as WebResult[],
  vectorSources: [] as VectorResult[],
  error: null as Error | null,
  retryable: true,
};

export const useResearchStore = create<ResearchStore>((set) => ({
  ...initialState,

  setQuestion: (question) => set({ question }),
  setStep: (currentStep) => set({ currentStep }),
  setStreamStatus: (streamStatus) => set({ streamStatus }),
  appendToken: (text) =>
    set((s) => ({ streamedText: s.streamedText + text })),
  setReport: (report) => set({ report, streamedText: report }),
  setSources: (webSources, vectorSources) => set({ webSources, vectorSources }),
  setError: (error, retryable = true) =>
    set({ error, retryable, streamStatus: error ? "error" : "idle" }),
  reset: () => set({ ...initialState }),
}));
