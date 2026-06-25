import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { useAgentSteps } from "@/hooks/useAgentSteps";
import { ActivityIcon } from "@/lib/icons";
import type { AgentStep } from "@/types/research";
import { cn } from "@/lib/utils";

interface AgentProgressProps {
  currentStep: AgentStep;
  isRunning?: boolean;
  className?: string;
}

export function AgentProgress({
  currentStep,
  isRunning = false,
  className,
}: AgentProgressProps) {
  const { steps, currentLabel } = useAgentSteps(currentStep);
  const isActive =
    isRunning || (currentStep !== "init" && currentStep !== "complete");

  return (
    <Card className={cn("sticky top-6 p-5", className)} data-testid="agent-progress">
      <CardHeader className="mb-5">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <ActivityIcon className="h-4 w-4" />
          </div>
          <div>
            <CardTitle>Agent pipeline</CardTitle>
            {isActive && (
              <p className="mt-0.5 text-xs text-primary animate-pulse-soft">
                {currentLabel}
              </p>
            )}
          </div>
        </div>
      </CardHeader>

      <ol className="relative space-y-0">
        {steps.map((step, index) => {
          const isLast = index === steps.length - 1;
          return (
            <li
              key={step.id}
              className="relative flex gap-4 pb-6 last:pb-0"
              data-testid={`agent-step-${step.id}`}
              data-status={step.status}
            >
              {!isLast && (
                <span
                  className={cn(
                    "absolute left-[15px] top-8 h-[calc(100%-8px)] w-px transition-colors duration-500",
                    step.status === "done" ? "bg-primary/50" : "bg-border",
                  )}
                  aria-hidden
                />
              )}

              <span
                className={cn(
                  "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ring-4 ring-background transition-all duration-500",
                  step.status === "done" &&
                    "bg-primary text-primary-foreground shadow-glow",
                  step.status === "active" &&
                    "bg-primary text-primary-foreground shadow-sm ring-primary/30",
                  step.status === "pending" &&
                    "bg-muted/80 text-muted-foreground",
                  step.status === "error" &&
                    "bg-destructive/20 text-destructive ring-destructive/20",
                )}
              >
                {step.status === "done" ? (
                  <span className="animate-fade-up">✓</span>
                ) : step.status === "error" ? (
                  "!"
                ) : step.status === "active" ? (
                  <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-current" />
                ) : (
                  <span className="text-[10px]">{index + 1}</span>
                )}
              </span>

              <div className="min-w-0 pt-0.5">
                <p
                  className={cn(
                    "text-sm font-medium leading-tight transition-colors duration-300",
                    step.status === "active" && "text-foreground",
                    step.status === "pending" && "text-muted-foreground/70",
                    step.status === "done" && "text-muted-foreground",
                    step.status === "error" && "text-destructive",
                  )}
                >
                  {step.label}
                </p>
                {step.status === "active" && (
                  <p className="mt-1 text-xs text-primary animate-pulse-soft">
                    In progress…
                  </p>
                )}
                {step.status === "done" && (
                  <p className="mt-1 text-xs text-primary/60">Done</p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </Card>
  );
}
