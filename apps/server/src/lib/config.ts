export function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

/** Primary + backup Gemini keys (GEMINI_API_KEY_2, GEMINI_API_KEY_3, …) */
export function getGeminiApiKeys(): string[] {
  const keys: string[] = [];

  if (process.env.GEMINI_API_KEYS?.trim()) {
    keys.push(
      ...process.env.GEMINI_API_KEYS.split(",").map((k) => k.trim()).filter(Boolean),
    );
  }

  for (let i = 1; i <= 5; i++) {
    const name = i === 1 ? "GEMINI_API_KEY" : `GEMINI_API_KEY_${i}`;
    const value = process.env[name]?.trim();
    if (value) keys.push(value);
  }

  return [...new Set(keys)];
}

export function hasLiveAgentKeys(): boolean {
  return Boolean(
    process.env.TAVILY_API_KEY?.trim() && getGeminiApiKeys().length > 0,
  );
}
