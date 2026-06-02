import { useCallback, useRef } from "react";
import { API_BASE } from "@/lib/utils";
import { runMockResearchStream, USE_MOCK } from "@/mocks/researchMock";
import { useResearchStore } from "@/store/researchStore";
import type { SseEvent } from "@/types/research";

function parseSseChunk(buffer: string): { events: SseEvent[]; rest: string } {
  const events: SseEvent[] = [];
  const parts = buffer.split("\n\n");
  const rest = parts.pop() ?? "";

  for (const part of parts) {
    const dataLine = part
      .split("\n")
      .find((line) => line.startsWith("data:"));
    if (!dataLine) continue;
    try {
      const payload = JSON.parse(dataLine.slice(5).trim()) as SseEvent;
      events.push(payload);
    } catch {
      // skip malformed chunks
    }
  }

  return { events, rest };
}

function handleSseEvent(event: SseEvent) {
  const store = useResearchStore.getState();
  switch (event.type) {
    case "step":
      store.setStep(event.data.step);
      break;
    case "token":
      store.appendToken(event.data.text);
      if (store.currentStep !== "synthesis") {
        store.setStep("synthesis");
      }
      break;
    case "sources":
      store.setSources(event.data.web, event.data.vector);
      break;
    case "complete":
      store.setReport(event.data.report);
      store.setStreamStatus("complete");
      store.setStep("complete");
      break;
    case "error":
      store.setError(new Error(event.data.message), event.data.retryable);
      store.setStep("error");
      break;
  }
}

export function useResearchStream() {
  const abortRef = useRef<AbortController | null>(null);

  const abort = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
  }, []);

  const startResearch = useCallback(
    async (question: string, options?: { forceMock?: boolean }) => {
      const store = useResearchStore.getState();
      abort();
      store.reset();
      store.setQuestion(question);

      const controller = new AbortController();
      abortRef.current = controller;

      store.setStreamStatus("connecting");
      store.setStep("web_search");

      const useMock = options?.forceMock ?? USE_MOCK;

      try {
        if (useMock) {
          store.setStreamStatus("streaming");
          await runMockResearchStream(
            question,
            handleSseEvent,
            controller.signal,
          );
        } else {
          const url = `${API_BASE}/api/research`;
          const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ question }),
            signal: controller.signal,
          });

          if (!response.ok) {
            throw new Error(`Request failed (${response.status})`);
          }

          const reader = response.body?.getReader();
          if (!reader) {
            throw new Error("No response body");
          }

          store.setStreamStatus("streaming");
          const decoder = new TextDecoder();
          let buffer = "";

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const { events, rest } = parseSseChunk(buffer);
            buffer = rest;

            for (const event of events) {
              handleSseEvent(event);
            }
          }
        }

        const final = useResearchStore.getState();
        if (final.streamStatus !== "error") {
          final.setStreamStatus("complete");
          final.setStep("complete");
        }
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        const error =
          err instanceof Error ? err : new Error("Research stream failed");
        useResearchStore.getState().setError(error, true);
        useResearchStore.getState().setStep("error");
      } finally {
        abortRef.current = null;
      }
    },
    [abort],
  );

  return { startResearch, abort, useMock: USE_MOCK };
}
