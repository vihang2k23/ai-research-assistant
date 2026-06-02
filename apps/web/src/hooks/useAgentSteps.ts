import { useMemo } from "react";
import type { AgentStep } from "@/types/research";

const STEP_ORDER: AgentStep[] = [
  "init",
  "web_search",
  "vector_retrieval",
  "reranking",
  "synthesis",
  "complete",
];

const STEP_LABELS: Record<AgentStep, string> = {
  init: "Ready",
  web_search: "Searching the web",
  vector_retrieval: "Retrieving past research",
  reranking: "Ranking sources",
  synthesis: "Synthesising report",
  complete: "Complete",
  error: "Error",
};

export function useAgentSteps(currentStep: AgentStep) {
  const steps = useMemo(
    () =>
      STEP_ORDER.filter((s) => s !== "init").map((id) => ({
        id,
        label: STEP_LABELS[id],
        status: getStepStatus(id, currentStep),
      })),
    [currentStep],
  );

  return { steps, currentLabel: STEP_LABELS[currentStep] };
}

function getStepStatus(
  step: AgentStep,
  current: AgentStep,
): "pending" | "active" | "done" | "error" {
  if (current === "error") {
    const idx = STEP_ORDER.indexOf(step);
    const curIdx = STEP_ORDER.indexOf("synthesis");
    if (idx <= curIdx) return idx < curIdx ? "done" : "error";
    return "pending";
  }

  const stepIdx = STEP_ORDER.indexOf(step);
  const currentIdx = STEP_ORDER.indexOf(current);

  if (current === "complete") return "done";
  if (currentIdx < 0) return "pending";
  if (stepIdx < currentIdx) return "done";
  if (stepIdx === currentIdx) return "active";
  return "pending";
}
