export type AgentStep =
  | "init"
  | "web_search"
  | "vector_retrieval"
  | "reranking"
  | "synthesis"
  | "complete"
  | "error";

export interface WebResult {
  title: string;
  url: string;
  snippet: string;
  publishedDate?: string;
}

export interface VectorResult {
  id: string;
  question: string;
  snippet: string;
  score: number;
}

export interface Source {
  title: string;
  url: string;
  snippet: string;
  type: "web" | "vector";
}

/** Server → Client over POST /api/research (SSE stream) */
export type SseEvent =
  | { type: "step"; data: { step: AgentStep; meta?: unknown } }
  | { type: "token"; data: { text: string } }
  | {
      type: "sources";
      data: { web: WebResult[]; vector: VectorResult[] };
    }
  | { type: "complete"; data: { report: string } }
  | { type: "error"; data: { message: string; retryable: boolean } };

export interface ResearchRequestBody {
  question: string;
}
