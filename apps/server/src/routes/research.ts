import { Router } from "express";
import type { ResearchRequestBody } from "@research/shared-types";
import { runResearchAgent } from "../agent/graph.js";
import { endSse, initSse, sendSseEvent } from "../streaming/sseEmitter.js";

export const researchRouter = Router();

researchRouter.post("/research", async (req, res) => {
  const body = req.body as ResearchRequestBody;
  const question = body?.question?.trim();

  if (!question) {
    res.status(400).json({ error: "question is required" });
    return;
  }

  initSse(res);

  // Keep the SSE connection open (req "close" can fire too early with some clients)
  req.socket.setTimeout(0);
  req.socket.setNoDelay(true);
  req.socket.setKeepAlive(true);

  const abortController = new AbortController();
  res.on("close", () => {
    if (!res.writableEnded) {
      abortController.abort();
    }
  });

  try {
    await runResearchAgent(
      question,
      (event) => sendSseEvent(res, event),
      abortController.signal,
    );
  } catch (err) {
    if ((err as Error).name === "AbortError") {
      endSse(res);
      return;
    }
    sendSseEvent(res, {
      type: "error",
      data: {
        message: err instanceof Error ? err.message : "Research failed",
        retryable: true,
      },
    });
  } finally {
    endSse(res);
  }
});
