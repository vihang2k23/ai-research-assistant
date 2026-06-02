import { hasLiveAgentKeys } from "../lib/config.js";
import type { SseEvent } from "@research/shared-types";
import { runLiveAgent } from "./runLiveAgent.js";
import { runStubAgentStream } from "./runStubAgentStream.js";

export type AgentStreamEmitter = (event: SseEvent) => void;

/**
 * Agent entry point — runs live pipeline when API keys are set,
 * otherwise falls back to the local stub stream.
 */
export async function runResearchAgent(
  question: string,
  emit: AgentStreamEmitter,
  signal?: AbortSignal,
): Promise<void> {
  if (!hasLiveAgentKeys()) {
    console.warn(
      "API keys missing (TAVILY, GEMINI) — using stub agent stream",
    );
    await runStubAgentStream(question, emit, signal);
    return;
  }

  await runLiveAgent(question, emit, signal);
}
