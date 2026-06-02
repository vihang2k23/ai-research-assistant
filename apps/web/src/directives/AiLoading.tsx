import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export type SkeletonVariant = "report" | "sources" | "steps" | "generic";

export interface AiLoadingProps {
  loading: boolean;
  skeleton?: SkeletonVariant;
  minDuration?: number;
  children: ReactNode;
  className?: string;
}

function SkeletonBar({ className }: { className?: string }) {
  return <div className={cn("shimmer rounded-md h-3", className)} />;
}

function ReportSkeleton() {
  return (
    <div className="space-y-4 rounded-xl border border-white/[0.06] bg-card/50 p-6" data-testid="skeleton-report">
      <SkeletonBar className="h-6 w-2/3" />
      <SkeletonBar className="h-5 w-1/2" />
      <SkeletonBar className="h-4 w-1/3" />
      <div className="space-y-2 pt-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonBar
            key={i}
            className={i % 3 === 0 ? "w-[70%]" : i % 3 === 1 ? "w-[80%]" : "w-[90%]"}
          />
        ))}
      </div>
    </div>
  );
}

function SourcesSkeleton() {
  return (
    <div className="grid gap-3 sm:grid-cols-2" data-testid="skeleton-sources">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-white/[0.06] bg-card/50 p-4 space-y-3">
          <div className="flex justify-between">
            <div className="shimmer h-8 w-8 rounded-lg" />
            <div className="shimmer h-5 w-16 rounded-full" />
          </div>
          <SkeletonBar className="h-4 w-3/4" />
          <SkeletonBar className="h-3 w-full" />
          <SkeletonBar className="h-3 w-2/3" />
        </div>
      ))}
    </div>
  );
}

function StepsSkeleton() {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-card/50 p-5 space-y-4" data-testid="skeleton-steps">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="shimmer h-8 w-8 shrink-0 rounded-full" />
          <SkeletonBar className="h-4 flex-1" />
        </div>
      ))}
    </div>
  );
}

function GenericSkeleton() {
  return (
    <div className="space-y-2" data-testid="skeleton-generic">
      <SkeletonBar className="w-full" />
      <SkeletonBar className="w-4/5" />
    </div>
  );
}

function Skeleton({ variant }: { variant: SkeletonVariant }) {
  switch (variant) {
    case "report":
      return <ReportSkeleton />;
    case "sources":
      return <SourcesSkeleton />;
    case "steps":
      return <StepsSkeleton />;
    default:
      return <GenericSkeleton />;
  }
}

export function AiLoading({
  loading,
  skeleton = "generic",
  minDuration = 800,
  children,
  className,
}: AiLoadingProps) {
  const [showContent, setShowContent] = useState(!loading);
  const [startedAt] = useState(() => Date.now());

  useEffect(() => {
    if (loading) {
      setShowContent(false);
      return;
    }

    const elapsed = Date.now() - startedAt;
    const remaining = Math.max(0, minDuration - elapsed);

    const timer = setTimeout(() => setShowContent(true), remaining);
    return () => clearTimeout(timer);
  }, [loading, minDuration, startedAt]);

  return (
    <div className={cn(className)} data-testid="ai-loading">
      {loading || !showContent ? (
        <Skeleton variant={skeleton} />
      ) : (
        children
      )}
    </div>
  );
}
