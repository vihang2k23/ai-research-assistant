import { Router } from "express";
import { getGeminiApiKeys, hasLiveAgentKeys } from "../lib/config.js";
import { pingPg } from "../db/client.js";

export const healthRouter = Router();

healthRouter.get("/health", async (_req, res) => {
  const pg = await pingPg();

  res.json({
    status: "ok",
    service: "ai-research-assistant",
    timestamp: new Date().toISOString(),
    postgres: pg ? "connected" : "unavailable",
    agent: hasLiveAgentKeys() ? "live" : "stub",
    keys: {
      tavily: Boolean(process.env.TAVILY_API_KEY?.trim()),
      gemini: getGeminiApiKeys().length,
    },
  });
});
