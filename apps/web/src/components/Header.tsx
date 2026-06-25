import { Badge } from "@/components/ui/Badge";
import { SparklesIcon } from "@/lib/icons";
import type { StreamStatus } from "@/types/research";
import { cn } from "@/lib/utils";

interface HeaderProps {
  streamStatus: StreamStatus;
  mockMode?: boolean;
}

const STATUS_LABEL: Record<StreamStatus, string> = {
  idle: "Ready",
  connecting: "Connecting",
  streaming: "Streaming",
  complete: "Complete",
  error: "Error",
};

export function Header({ streamStatus, mockMode = false }: HeaderProps) {
  const isActive = streamStatus === "connecting" || streamStatus === "streaming";

  return (
    <header className="relative border-b border-white/[0.06]">
      <div className="absolute inset-0 bg-primary/[0.04] pointer-events-none" />
      <div className="relative mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10 md:flex-row md:items-end md:justify-between">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
              <SparklesIcon className="h-5 w-5" />
            </div>
            <Badge variant="primary">LangGraph Agent</Badge>
            {mockMode && <Badge variant="muted">Mock data</Badge>}
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            AI Research Assistant
          </h1>
          <p className="max-w-xl text-base text-muted-foreground">
            Submit a question — the agent searches the web, recalls past research,
            and streams a structured report in real time.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Badge
            variant={
              streamStatus === "complete"
                ? "success"
                : streamStatus === "error"
                  ? "default"
                  : "primary"
            }
            className={cn(isActive && "animate-pulse-soft")}
          >
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                streamStatus === "idle" && "bg-muted-foreground",
                isActive && "bg-primary animate-pulse",
                streamStatus === "complete" && "bg-emerald-400",
                streamStatus === "error" && "bg-destructive",
              )}
            />
            {STATUS_LABEL[streamStatus]}
          </Badge>
        </div>
      </div>
    </header>
  );
}
