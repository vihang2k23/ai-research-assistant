import type { WebResult } from "@research/shared-types";
import { requireEnv } from "../lib/config.js";

interface TavilyResult {
  title: string;
  url: string;
  content?: string;
  published_date?: string;
}

interface TavilyResponse {
  results?: TavilyResult[];
}

export async function tavilySearch(query: string): Promise<WebResult[]> {
  const apiKey = requireEnv("TAVILY_API_KEY");

  const response = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: apiKey,
      query,
      search_depth: "advanced",
      max_results: 8,
      include_answer: false,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Tavily search failed (${response.status}): ${text}`);
  }

  const data = (await response.json()) as TavilyResponse;

  return (data.results ?? []).map((r) => ({
    title: r.title,
    url: r.url,
    snippet: (r.content ?? "").slice(0, 400),
    publishedDate: r.published_date,
  }));
}
