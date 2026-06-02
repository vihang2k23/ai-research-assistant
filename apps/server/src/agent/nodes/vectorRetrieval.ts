import { searchSimilarDocuments } from "../../db/researchDocuments.js";
import { embedText } from "../../tools/embeddings.js";
import type { AgentState } from "../state.js";

export async function vectorRetrievalNode(
  state: AgentState,
): Promise<Partial<AgentState>> {
  const embedding = await embedText(state.question);
  const vectorResults = await searchSimilarDocuments(embedding, {
    limit: 5,
    minScore: 0.75,
  });

  return {
    vectorResults,
    currentStep: "vector_retrieval",
  };
}
