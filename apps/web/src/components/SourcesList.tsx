import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { DatabaseIcon, ExternalLinkIcon, LinkIcon } from "@/lib/icons";
import type { VectorResult, WebResult } from "@/types/research";
import { cn } from "@/lib/utils";

interface SourcesListProps {
  webSources: WebResult[];
  vectorSources: VectorResult[];
  className?: string;
}

function SourceCard({
  title,
  url,
  snippet,
  badge,
  icon,
}: {
  title: string;
  url?: string;
  snippet: string;
  badge: string;
  icon: "web" | "memory";
}) {
  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-xl border border-white/[0.06] bg-background/40 p-4",
        "transition duration-200 hover:border-primary/30 hover:bg-white/[0.03] hover:shadow-glow",
      )}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
            icon === "web" ? "bg-sky-500/10 text-sky-400" : "bg-violet-500/10 text-violet-400",
          )}
        >
          {icon === "web" ? (
            <LinkIcon className="h-4 w-4" />
          ) : (
            <DatabaseIcon className="h-4 w-4" />
          )}
        </div>
        <Badge variant="muted">{badge}</Badge>
      </div>

      <h3 className="mb-2 text-sm font-semibold leading-snug text-foreground line-clamp-2">
        {url ? (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-start gap-1 hover:text-primary"
          >
            <span className="hover:underline">{title}</span>
            <ExternalLinkIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 opacity-0 transition group-hover:opacity-60" />
          </a>
        ) : (
          title
        )}
      </h3>
      <p className="text-xs leading-relaxed text-muted-foreground line-clamp-3">
        {snippet}
      </p>
    </article>
  );
}

export function SourcesList({
  webSources,
  vectorSources,
  className,
}: SourcesListProps) {
  const total = webSources.length + vectorSources.length;

  if (total === 0) {
    return null;
  }

  return (
    <section className={cn("space-y-4 animate-fade-up", className)} data-testid="sources-list">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-foreground">
          Sources
        </h2>
        <Badge variant="primary">{total} found</Badge>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {webSources.map((s) => (
          <SourceCard
            key={s.url}
            title={s.title}
            url={s.url}
            snippet={s.snippet}
            badge="Web"
            icon="web"
          />
        ))}
        {vectorSources.map((s) => (
          <SourceCard
            key={s.id}
            title={s.question}
            snippet={s.snippet}
            badge={`Memory · ${(s.score * 100).toFixed(0)}%`}
            icon="memory"
          />
        ))}
      </div>
    </section>
  );
}

export function SourcesSection({
  webSources,
  vectorSources,
  className,
}: SourcesListProps) {
  const total = webSources.length + vectorSources.length;

  return (
    <Card className={cn("p-6", className)}>
      <SourcesList webSources={webSources} vectorSources={vectorSources} />
      {total === 0 && (
        <p className="text-center text-sm text-muted-foreground py-4">
          Sources will appear as the agent searches
        </p>
      )}
    </Card>
  );
}
