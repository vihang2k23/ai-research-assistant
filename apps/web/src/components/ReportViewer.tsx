import { useState, useRef } from "react";
import { AiStream } from "@/directives";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FileTextIcon, DownloadIcon, LoaderIcon } from "@/lib/icons";
import type { StreamStatus } from "@/types/research";
import { cn } from "@/lib/utils";

interface ReportViewerProps {
  text: string;
  status: StreamStatus;
  className?: string;
}

export function ReportViewer({ text, status, className }: ReportViewerProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const hasContent = text.length > 0 || status !== "idle";

  if (!hasContent) {
    return (
      <Card variant="outline" className={cn("p-12 text-center", className)}>
        <div
          className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary"
          data-testid="report-viewer-empty"
        >
          <FileTextIcon className="h-7 w-7" />
        </div>
        <p className="text-base font-medium text-foreground">
          Your report will appear here
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Submit a research question to start the agent pipeline
        </p>
      </Card>
    );
  }

  const isStreaming = status === "streaming" || status === "connecting";

  const handleDownload = async () => {
    if (!text || !contentRef.current) return;
    setIsDownloading(true);
    
    try {
      // @ts-ignore - html2pdf doesn't have types out of the box without additional package
      const html2pdf = (await import("html2pdf.js")).default;
      
      const element = document.createElement("div");
      element.innerHTML = `
        <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1a1a1a;">
          <div style="background-color: #2563eb; padding: 35px 30px; border-radius: 12px; color: white; margin-bottom: 40px; box-shadow: 0 10px 25px rgba(37, 99, 235, 0.2);">
            <h1 style="margin: 0 0 12px 0; font-size: 34px; font-weight: 800; letter-spacing: -0.02em;">Research Report</h1>
            <p style="margin: 0; color: rgba(255,255,255,0.9); font-size: 16px; font-weight: 500;">
              Generated on ${new Date().toLocaleDateString()} • ${new Date().toLocaleTimeString()}
            </p>
          </div>
          <div class="pdf-body" style="font-size: 16px; line-height: 1.8; color: #334155;">
            <style>
              .pdf-body h1, .pdf-body h2, .pdf-body h3 { color: #0f172a; font-weight: 700; margin-top: 1.8em; margin-bottom: 0.8em; page-break-after: avoid; page-break-inside: avoid; }
              .pdf-body h2 { font-size: 1.5em; border-bottom: 2px solid #e2e8f0; padding-bottom: 0.4em; }
              .pdf-body p { margin-bottom: 1.5em; page-break-inside: avoid; }
              .pdf-body strong { color: #0f172a; background-color: #e0f2fe; padding: 2px 4px; border-radius: 4px; font-weight: 700; }
              .pdf-body ul, .pdf-body ol { margin-top: 0.5em; margin-bottom: 1.5em; padding-left: 2em; }
              .pdf-body li { margin-bottom: 0.8em; padding-left: 0.2em; page-break-inside: avoid; }
              .pdf-body code { background: #f1f5f9; padding: 0.2em 0.4em; border-radius: 4px; font-size: 0.9em; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; color: #db2777; }
              .pdf-body pre { background: #0f172a; color: #f8fafc; padding: 1.2em; border-radius: 8px; overflow-x: auto; margin-bottom: 1.5em; page-break-inside: avoid; }
              .pdf-body pre code { background: transparent; color: inherit; padding: 0; }
              .pdf-body blockquote { border-left: 4px solid #3b82f6; background: #eff6ff; padding: 1em; margin: 0 0 1.5em 0; border-radius: 0 8px 8px 0; font-style: italic; color: #1e3a8a; page-break-inside: avoid; }
              .pdf-body a { color: #2563eb; text-decoration: none; }
              .pdf-body table { width: 100%; border-collapse: collapse; margin-bottom: 1.5em; page-break-inside: avoid; }
              .pdf-body th, .pdf-body td { border: 1px solid #e2e8f0; padding: 0.75em; text-align: left; }
              .pdf-body th { background-color: #f8fafc; color: #0f172a; font-weight: 600; }
            </style>
            ${contentRef.current.innerHTML}
          </div>
        </div>
      `;

      const opt = {
        margin:       0.75,
        filename:     `research-report-${new Date().toISOString().split('T')[0]}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' },
        pagebreak:    { mode: ['css', 'legacy'] }
      };

      await html2pdf().set(opt).from(element).save();
    } catch (err) {
      console.error("Failed to generate PDF:", err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Card className={cn("overflow-hidden", className)} data-testid="report-viewer">
      <CardHeader className="border-b border-white/[0.06] px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <FileTextIcon className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>Research report</CardTitle>
              {isStreaming && (
                <p className="text-xs text-primary">Streaming live…</p>
              )}
            </div>
          </div>
          {!isStreaming && status === "complete" && text && (
            <Button variant="outline" size="sm" onClick={handleDownload} disabled={isDownloading} className="gap-2">
              {isDownloading ? <LoaderIcon className="h-4 w-4" /> : <DownloadIcon className="h-4 w-4" />}
              {isDownloading ? "Downloading..." : "Download PDF"}
            </Button>
          )}
        </div>
      </CardHeader>

      <div className="report-body max-h-[min(60vh,520px)] overflow-y-auto px-6 py-5 scrollbar-thin">
        <div ref={contentRef}>
          <AiStream
            text={text}
            status={status}
            renderAs="markdown"
          />
        </div>
      </div>
    </Card>
  );
}
