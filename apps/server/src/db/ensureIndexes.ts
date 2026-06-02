import "dotenv/config";
import { pool } from "./client.js";

async function main() {
  const client = await pool.connect();
  try {
    await client.query(`CREATE EXTENSION IF NOT EXISTS vector;`);
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS research_documents (
        id SERIAL PRIMARY KEY,
        question TEXT NOT NULL,
        report TEXT NOT NULL,
        sources JSONB NOT NULL,
        embedding vector(768),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create an index for vector similarity using HNSW
    await client.query(`
      CREATE INDEX IF NOT EXISTS research_embedding_idx 
      ON research_documents 
      USING hnsw (embedding vector_cosine_ops);
    `);

    console.log(`Table and indexes ensured on pgvector`);
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
