import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });

import cors from "cors";
import express from "express";
import { hasLiveAgentKeys } from "./lib/config.js";
import { connectPg, closePg } from "./db/client.js";
import { healthRouter } from "./routes/health.js";
import { researchRouter } from "./routes/research.js";

const app = express();
const port = Number(process.env.PORT) || 3001;

app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(",") ?? [
      "http://localhost:5173",
      "http://127.0.0.1:5173",
    ],
    methods: ["GET", "POST", "OPTIONS"],
  }),
);
app.use(express.json());

app.use("/api", healthRouter);
app.use("/api", researchRouter);

async function start() {
  const agentMode = hasLiveAgentKeys() ? "LIVE (Tavily + Gemini)" : "STUB (add API keys)";

  try {
    await connectPg();
    console.log("Postgres connected");
  } catch (err) {
    console.warn(
      "Postgres not available — check POSTGRES_URL in apps/server/.env",
    );
    console.warn(err instanceof Error ? err.message : err);
  }

  const server = app.listen(port, () => {
    console.log(`API listening on http://localhost:${port}`);
    console.log(`  Agent mode: ${agentMode}`);
    console.log(`  POST /api/research  — SSE research stream`);
    console.log(`  GET  /api/health    — health check`);
  });

  const shutdown = async () => {
    server.close();
    await closePg();
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

start();
