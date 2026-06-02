import { useCallback, useRef, useState } from "react";

export type RetryState =
  | "none"
  | "error_shown"
  | "retrying"
  | "success"
  | "max_attempts_reached";

interface UseRetryOptions {
  maxAttempts?: number;
  backoffMs?: number[];
  onRetry: () => void | Promise<void>;
}

export function useRetry({
  maxAttempts = 3,
  backoffMs = [1000, 2000, 4000],
  onRetry,
}: UseRetryOptions) {
  const [retryState, setRetryState] = useState<RetryState>("none");
  const [attempt, setAttempt] = useState(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const clearPending = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }
  }, []);

  const showError = useCallback(() => {
    setRetryState("error_shown");
  }, []);

  const reset = useCallback(() => {
    clearPending();
    setAttempt(0);
    setRetryState("none");
  }, [clearPending]);

  const markSuccess = useCallback(() => {
    clearPending();
    setAttempt(0);
    setRetryState("success");
  }, [clearPending]);

  const retry = useCallback(() => {
    if (attempt >= maxAttempts) {
      setRetryState("max_attempts_reached");
      return;
    }

    const delay = backoffMs[Math.min(attempt, backoffMs.length - 1)] ?? 1000;
    setRetryState("retrying");

    clearPending();
    timeoutRef.current = setTimeout(async () => {
      setAttempt((a) => a + 1);
      try {
        await onRetry();
      } catch {
        setRetryState("error_shown");
      }
    }, delay);
  }, [attempt, maxAttempts, backoffMs, onRetry, clearPending]);

  return {
    retryState,
    attempt,
    maxAttempts,
    showError,
    retry,
    reset,
    markSuccess,
    clearPending,
  };
}
