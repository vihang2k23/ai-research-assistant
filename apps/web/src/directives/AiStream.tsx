import {
  useEffect,
  useRef,
  useState,
  startTransition,
  type ReactNode,
} from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import type { StreamStatus } from "@/types/research";

export interface AiStreamProps {
  text: string;
  status: StreamStatus;
  onComplete?: (text: string) => void;
  renderAs?: "markdown" | "plain";
  className?: string;
  scrollContainerRef?: React.RefObject<HTMLElement | null>;
}

export function AiStream({
  text,
  status,
  onComplete,
  renderAs = "markdown",
  className,
  scrollContainerRef,
}: AiStreamProps) {
  const [displayText, setDisplayText] = useState("");
  const bufferRef = useRef("");
  const rafRef = useRef<number>();
  const containerRef = useRef<HTMLDivElement>(null);
  const completedRef = useRef(false);

  const isStreaming = status === "streaming" || status === "connecting";
  const isComplete = status === "complete";

  useEffect(() => {
    if (status === "idle") {
      bufferRef.current = "";
      setDisplayText("");
      completedRef.current = false;
      return;
    }

    bufferRef.current = text;

    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    rafRef.current = requestAnimationFrame(() => {
      startTransition(() => {
        setDisplayText(bufferRef.current);
      });
    });

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [text, status]);

  useEffect(() => {
    const scrollEl = scrollContainerRef?.current ?? containerRef.current;
    if (!scrollEl) return;
    scrollEl.scrollTop = scrollEl.scrollHeight;
  }, [displayText, scrollContainerRef]);

  useEffect(() => {
    if (isComplete && !completedRef.current && displayText) {
      completedRef.current = true;
      onComplete?.(displayText);
    }
  }, [isComplete, displayText, onComplete]);

  const content: ReactNode =
    renderAs === "markdown" ? (
      <ReactMarkdown remarkPlugins={[remarkGfm]} className="prose-report max-w-none">
        {displayText || " "}
      </ReactMarkdown>
    ) : (
      <pre className="whitespace-pre-wrap font-sans text-sm">{displayText}</pre>
    );

  return (
    <div
      ref={containerRef}
      className={cn("relative", className)}
      data-testid="ai-stream"
      data-status={status}
    >
      <div data-testid="ai-stream-content">{content}</div>
      {isStreaming && (
        <span
          className="ml-0.5 inline-block h-[1.1em] w-0.5 animate-blink rounded-full bg-gradient-to-b from-primary to-cyan-400 align-middle shadow-glow"
          data-testid="ai-stream-cursor"
          aria-hidden
        />
      )}
    </div>
  );
}
