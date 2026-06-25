import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "danger";
  size?: "default" | "sm" | "lg";
}

export function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg font-medium transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "disabled:pointer-events-none disabled:opacity-50",
        variant === "default" &&
          "bg-primary text-white shadow-sm hover:brightness-110 active:scale-[0.98]",
        variant === "outline" &&
          "border border-border bg-white/[0.02] hover:border-primary/40 hover:bg-white/[0.04]",
        variant === "ghost" && "hover:bg-white/[0.05]",
        variant === "danger" &&
          "bg-destructive/90 text-destructive-foreground hover:bg-destructive",
        size === "default" && "h-10 px-5 text-sm",
        size === "sm" && "h-8 px-3.5 text-xs",
        size === "lg" && "h-12 px-7 text-base",
        className,
      )}
      {...props}
    />
  );
}
