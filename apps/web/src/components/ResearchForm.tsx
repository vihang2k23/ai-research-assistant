import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { LoaderIcon, SearchIcon, XIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";

interface ResearchFormProps {
  onSubmit: (question: string) => void;
  onDemo?: (question: string) => void;
  onClear?: () => void;
  disabled?: boolean;
  initialQuestion?: string;
  mockMode?: boolean;
}

const EXAMPLE_QUESTIONS = [
  "Latest advances in retrieval-augmented generation",
  "LangGraph vs other agent frameworks",
  "Observability best practices for LLM apps",
];

const DEMO_QUESTION =
  "How is pgvector used for semantic memory in research agents?";

export function ResearchForm({
  onSubmit,
  onDemo,
  disabled = false,
  initialQuestion = "",
  mockMode = false,
  onClear,
}: ResearchFormProps) {
  const [question, setQuestion] = useState(initialQuestion);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = question.trim();
    if (!trimmed || disabled) return;
    onSubmit(trimmed);
  };

  return (
    <Card className="p-6 sm:p-8" data-testid="research-form">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="relative">
          <label
            htmlFor="research-question"
            className="section-label mb-3 block"
          >
            Research question
          </label>
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute left-4 top-4 h-5 w-5 text-muted-foreground" />
            <textarea
              id="research-question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g. How is pgvector used for semantic memory in agent systems?"
              disabled={disabled}
              rows={3}
              className={cn(
                "w-full resize-none rounded-xl border border-white/[0.08] bg-background/60 py-4 pl-12 pr-4 text-[15px] text-foreground shadow-inner",
                "placeholder:text-muted-foreground/70",
                "transition focus:border-primary/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20",
                "disabled:cursor-not-allowed disabled:opacity-50",
              )}
              data-testid="research-question-input"
            />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="submit"
              size="lg"
              disabled={disabled || !question.trim()}
              className="min-w-[10.5rem]"
              data-testid="research-submit"
            >
              {disabled ? (
                <>
                  <LoaderIcon className="h-4 w-4 shrink-0" />
                  <span>Researching…</span>
                </>
              ) : (
                <>
                  <SearchIcon className="h-4 w-4 shrink-0" />
                  <span>Start research</span>
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              size="lg"
              disabled={disabled || (!question.trim() && !onClear)}
              onClick={() => {
                setQuestion("");
                if (onClear) onClear();
              }}
              data-testid="research-clear"
            >
              <XIcon className="h-4 w-4 shrink-0" />
              <span>Clear</span>
            </Button>

            {onDemo && (
              <Button
                type="button"
                variant="outline"
                size="lg"
                disabled={disabled}
                onClick={() => {
                  const q = question.trim() || DEMO_QUESTION;
                  setQuestion(q);
                  onDemo(q);
                }}
                data-testid="research-demo"
              >
                <span>Run demo</span>
              </Button>
            )}
          </div>

          {mockMode && (
            <p className="text-xs text-primary/80">
              Mock mode — simulated agent data (no backend required)
            </p>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <span className="shrink-0 text-xs text-muted-foreground">Try:</span>
            {EXAMPLE_QUESTIONS.map((q) => (
              <button
                key={q}
                type="button"
                disabled={disabled}
                onClick={() => setQuestion(q)}
                className={cn(
                  "rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-1.5 text-xs text-muted-foreground",
                  "transition hover:border-primary/30 hover:bg-primary/5 hover:text-foreground",
                  "disabled:opacity-50",
                )}
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </form>
    </Card>
  );
}
