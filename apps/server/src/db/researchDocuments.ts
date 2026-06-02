import type { VectorResult } from "@research/shared-types";
import { pool } from "./client.js";
import type { ResearchDocument } from "./schema.js";

const MIN_SCORE = 0.75;
const DEFAULT_LIMIT = 5;

export async function saveResearchDocument(
  doc: Omit<ResearchDocument, "id" | "createdAt">,
): Promise<string> {
  const query = `
    INSERT INTO research_documents (question, report, sources, embedding)
    VALUES ($1, $2, $3, $4)
    RETURNING id;
  `;
  const embeddingString = doc.embedding ? `[${doc.embedding.join(",")}]` : null;
  const values = [
    doc.question,
    doc.report,
    JSON.stringify(doc.sources),
    embeddingString
  ];

  const result = await pool.query(query, values);
  return result.rows[0].id.toString();
}

export async function searchSimilarDocuments(
  queryEmbedding: number[],
  options?: { limit?: number; minScore?: number },
): Promise<VectorResult[]> {
  const limit = options?.limit ?? DEFAULT_LIMIT;
  const minScore = options?.minScore ?? MIN_SCORE;

  // pgvector uses <=> for cosine distance. Cosine similarity = 1 - cosine distance.
  const query = `
    SELECT 
      id, 
      question, 
      report, 
      1 - (embedding <=> $1) AS score
    FROM research_documents
    WHERE 1 - (embedding <=> $1) >= $2
    ORDER BY score DESC
    LIMIT $3;
  `;

  const values = [`[${queryEmbedding.join(",")}]`, minScore, limit];
  const result = await pool.query(query, values);

  return result.rows.map((row) => ({
    id: row.id.toString(),
    question: row.question,
    snippet: row.report.slice(0, 280) + (row.report.length > 280 ? "…" : ""),
    score: row.score,
  }));
}
