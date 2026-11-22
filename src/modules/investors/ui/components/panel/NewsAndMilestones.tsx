import { formatIsoDate } from "@/shared/lib/format-date";
import { EmptyState, ProjectionLabel } from "@/shared/ui/brand";
import { Eyebrow, IndexLabel } from "@/shared/ui/layout";
import { EXAMPLE_MILESTONES, EXAMPLE_NEWS } from "./examples";
import { PANEL_COPY } from "./copy";

const N = PANEL_COPY.news;
const M = PANEL_COPY.milestones;

export function NewsList() {
  return (
    <div className="flex flex-col gap-6" data-testid="panel-novedades">
      <div className="flex flex-col gap-2">
        <Eyebrow>{N.eyebrow}</Eyebrow>
        <h2 id="panel-novedades-titulo" className="font-heading text-2xl font-medium md:text-3xl">
          {N.title}
        </h2>
      </div>
      {EXAMPLE_NEWS.length === 0 ? (
        <EmptyState title={N.empty.title} description={N.empty.description} />
      ) : (
        <ol className="flex flex-col">
          {EXAMPLE_NEWS.map((n) => (
            <li key={`${n.date}-${n.code}`} className="border-line flex flex-col gap-1 border-t py-4">
              <p className="text-muted-foreground font-mono text-xs">
                <time dateTime={n.date}>{formatIsoDate(n.date, "short")}</time>
                {` · ${n.code}`}
              </p>
              <p className="leading-relaxed">{n.text}</p>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

export function MilestonesList() {
  return (
    <div className="flex flex-col gap-6" data-testid="panel-hitos">
      <div className="flex flex-col gap-2">
        <Eyebrow>{M.eyebrow}</Eyebrow>
        <h2 id="panel-hitos-titulo" className="font-heading text-2xl font-medium md:text-3xl">
          {M.title}
        </h2>
        <p className="text-muted-foreground text-sm">{M.note}</p>
      </div>
      <ol className="flex flex-col">
        {EXAMPLE_MILESTONES.map((h, i) => (
          <li key={`${h.code}-${h.text}`} className="border-line flex gap-4 border-t py-4">
            <IndexLabel n={i + 1} />
            <div className="flex flex-col gap-1">
              <p className="font-medium">{h.text}</p>
              <p className="text-muted-foreground font-mono text-xs">{h.code}</p>
              <ProjectionLabel>
                <span className="text-sm">{M.estimated(h.dateLabel)}</span>
              </ProjectionLabel>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
