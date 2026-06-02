export interface ResearchDocument {
  id?: string;
  question: string;
  report: string;
  sources: ResearchDocumentSource[];
  embedding?: number[];
  createdAt?: Date;
}

export interface ResearchDocumentSource {
  title: string;
  url?: string;
  snippet: string;
  type: "web" | "vector";
}

export const RESEARCH_TABLE = "research_documents";
