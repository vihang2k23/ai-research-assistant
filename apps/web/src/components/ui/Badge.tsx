import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "primary" | "success" | "muted";
}

export function Badge({
  className,
  variant = "default",
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium",
        variant === "default" && "bg-muted text-muted-foreground",
        variant === "primary" &&
          "bg-primary/15 text-primary ring-1 ring-primary/25",
        variant === "success" &&
          "bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/25",
        variant === "muted" && "bg-white/5 text-muted-foreground",
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
