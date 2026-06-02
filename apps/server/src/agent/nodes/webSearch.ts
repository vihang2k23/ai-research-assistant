import type { AgentState } from "../state.js";
import { tavilySearch } from "../../tools/tavilySearch.js";

export async function webSearchNode(
  state: AgentState,
): Promise<Partial<AgentState>> {
  const webResults = await tavilySearch(state.question);
  return {
    webResults,
    currentStep: "web_search",
  };
}
