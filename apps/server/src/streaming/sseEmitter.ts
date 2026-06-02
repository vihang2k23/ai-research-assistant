import type { Response } from "express";
import type { SseEvent } from "@research/shared-types";

export function initSse(res: Response): void {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();
}

export function sendSseEvent(res: Response, event: SseEvent): void {
  res.write(`data: ${JSON.stringify(event)}\n\n`);
  const flush = (res as Response & { flush?: () => void }).flush;
  flush?.call(res);
}

export function endSse(res: Response): void {
  res.end();
}
