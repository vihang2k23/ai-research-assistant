export type {
  AgentStep,
  Source,
  SseEvent,
  VectorResult,
  WebResult,
} from "@research/shared-types";

/** Frontend-only stream UI state */
export type StreamStatus =
  | "idle"
  | "connecting"
  | "streaming"
  | "complete"
  | "error";
