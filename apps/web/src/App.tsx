import { useCallback, useEffect } from "react";
import { AgentProgress } from "@/components/AgentProgress";
import { Header } from "@/components/Header";
import { ReportViewer } from "@/components/ReportViewer";
import { ResearchForm } from "@/components/ResearchForm";
import { SourcesSection } from "@/components/SourcesList";
import { Button } from "@/components/ui/Button";
import { AiLoading, AiRetry } from "@/directives";
import { useResearchStream } from "@/hooks/useResearchStream";
import { useRetry } from "@/hooks/useRetry";
import { useResearchStore } from "@/store/researchStore";

export default function App() {
  const {
    question,
    currentStep,
    streamStatus,
    streamedText,
    webSources,
    vectorSources,
    error,
    retryable,
    reset,
  } = useResearchStore();

  const { startResearch, abort, useMock } = useResearchStream();

  const isLoading =
    streamStatus === "connecting" || streamStatus === "streaming";

  const hasStarted = streamStatus !== "idle";

  const displayText =
    streamStatus === "complete"
      ? useResearchStore.getState().report || streamedText
      : streamedText;

  const runResearch = useCallback(
    (q: string, forceMock?: boolean) => startResearch(q, { forceMock }),
    [startResearch],
  );

  const runDemo = useCallback(
    (q: string) => runResearch(q, true),
    [runResearch],
  );

  const {
    retry,
    retryState,
    attempt,
    showError,
    markSuccess,
    reset: resetRetry,
  } = useRetry({
    onRetry: () => {
      if (question) return runResearch(question);
    },
  });

  const handleSubmit = useCallback(
    async (q: string) => {
      resetRetry();
      try {
        await runResearch(q);
        markSuccess();
      } catch {
        showError();
      }
    },
    [runResearch, resetRetry, markSuccess, showError],
  );

  const handleRetry = useCallback(() => {
    if (!retryable) return;
    retry();
  }, [retry, retryable]);

  useEffect(() => {
    if (error && retryState === "none") {
      showError();
    }
  }, [error, retryState, showError]);

  return (
    <div className="mesh-bg min-h-screen text-foreground">
      <Header streamStatus={streamStatus} mockMode={useMock} />

      <main className="mx-auto max-w-6xl space-y-8 px-4 pb-16 pt-8 sm:px-6">
        <ResearchForm
          onSubmit={handleSubmit}
          onDemo={runDemo}
          disabled={isLoading}
          initialQuestion={question}
          mockMode={useMock}
          onClear={reset}
        />

        {isLoading && (
          <div className="flex justify-center">
            <Button variant="ghost" size="sm" onClick={abort}>
              Cancel research
            </Button>
          </div>
        )}

        <AiRetry
          error={error}
          onRetry={handleRetry}
          attempt={attempt}
          retryState={retryState}
        >
          {hasStarted && (
            <div className="grid animate-fade-up gap-8 lg:grid-cols-[300px_1fr]">
              <aside className="lg:order-1">
                <AgentProgress
                  currentStep={currentStep}
                  isRunning={isLoading}
                />
              </aside>

              <div className="space-y-6 lg:order-2">
                <AiLoading
                  loading={isLoading && webSources.length === 0}
                  skeleton="sources"
                >
                  <SourcesSection
                    webSources={webSources}
                    vectorSources={vectorSources}
                  />
                </AiLoading>

                <AiLoading
                  loading={isLoading && !displayText}
                  skeleton="report"
                >
                  <ReportViewer text={displayText} status={streamStatus} />
                </AiLoading>
              </div>
            </div>
          )}

          {!hasStarted && !error && (
            <div className="grid gap-6 lg:grid-cols-2">
              <AgentProgress currentStep="init" />
              <ReportViewer text="" status="idle" />
            </div>
          )}
        </AiRetry>
      </main>

      <footer className="border-t border-white/[0.04] py-6 text-center text-xs text-muted-foreground">
        LangGraph · Tavily · pgvector
      </footer>
    </div>
  );
}
