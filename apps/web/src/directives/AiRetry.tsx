import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import type { RetryState } from "@/hooks/useRetry";

export interface AiRetryProps {
  error: Error | null;
  onRetry: () => void;
  maxAttempts?: number;
  attempt?: number;
  retryState?: RetryState;
  children: ReactNode;
  className?: string;
}

export function AiRetry({
  error,
  onRetry,
  maxAttempts = 3,
  attempt = 0,
  retryState = "none",
  children,
  className,
}: AiRetryProps) {
  if (!error) {
    return <>{children}</>;
  }

  const maxReached = retryState === "max_attempts_reached";
  const isRetrying = retryState === "retrying";

  return (
    <div className={cn("space-y-6", className)} data-testid="ai-retry">
      <Card
        className="border-destructive/30 bg-destructive/5 p-5"
        data-testid="ai-retry-error"
      >
        <p className="text-sm font-semibold text-destructive">
          Research failed
        </p>
        <p className="mt-1.5 text-sm text-muted-foreground">{error.message}</p>

        {maxReached ? (
          <p
            className="mt-4 text-sm text-muted-foreground"
            data-testid="ai-retry-give-up"
          >
            Maximum retry attempts reached. Please try again later.
          </p>
        ) : (
          <Button
            type="button"
            variant="danger"
            size="sm"
            onClick={onRetry}
            disabled={isRetrying}
            className="mt-4"
            data-testid="ai-retry-button"
          >
            {isRetrying
              ? "Retrying…"
              : `Try again (${attempt}/${maxAttempts})`}
          </Button>
        )}
      </Card>
      {!maxReached && !isRetrying && children}
    </div>
  );
}
