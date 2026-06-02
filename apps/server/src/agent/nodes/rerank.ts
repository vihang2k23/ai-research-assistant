import type { Source } from "@research/shared-types";
import type { AgentState } from "../state.js";

function recencyScore(publishedDate?: string): number {
  if (!publishedDate) return 0.5;
  const ageMs = Date.now() - new Date(publishedDate).getTime();
  const days = ageMs / (1000 * 60 * 60 * 24);
  if (days <= 30) return 1;
  if (days <= 180) return 0.8;
  if (days <= 365) return 0.6;
  return 0.4;
}

export async function rerankNode(state: AgentState): Promise<Partial<AgentState>> {
  const candidates: Array<Source & { score: number }> = [];

  for (const w of state.webResults) {
    candidates.push({
      title: w.title,
      url: w.url,
      snippet: w.snippet,
      type: "web",
      score: recencyScore(w.publishedDate) * 1,
    });
  }

  for (const v of state.vectorResults) {
    candidates.push({
      title: v.question,
      url: `memory://${v.id}`,
      snippet: v.snippet,
      type: "vector",
      score: v.score,
    });
  }

  const seen = new Set<string>();
  const rerankedSources = candidates
    .sort((a, b) => b.score - a.score)
    .filter((s) => {
      const key = s.type === "web" ? s.url : s.title;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .map(({ score: _score, ...source }) => source);

  return {
    rerankedSources,
    currentStep: "reranking",
  };
}
