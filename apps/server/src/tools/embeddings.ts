import { embedTextGemini } from "./gemini.js";

/** Embeddings via Google Gemini (free tier on AI Studio) */
export async function embedText(text: string): Promise<number[]> {
  return embedTextGemini(text);
}
