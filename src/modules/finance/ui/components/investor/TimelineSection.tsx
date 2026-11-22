import { formatIsoDate } from "@/shared/lib/format-date";
import { EmptyState, ProjectionLabel, StatusBadge, type StatusTone } from "@/shared/ui/brand";
import { Section, Surface } from "@/shared/ui/layout";
import { dateAfterPurchase } from "../../hooks/project-figures";
import type { ProjectDetailData } from "../../hooks/use-project-detail";
import { PROJECT_DETAIL_COPY } from "./copy";
import type { MilestoneStatus } from "./examples";

const C = PROJECT_DETAIL_COPY;
const TONE: Record<MilestoneStatus, StatusTone> = { done: "positive", current: "in-progress", upcoming: "neutral" };

/** Cronograma (hitos) y actualizaciones fechadas. Sin indicadores de velocidad de venta (ADR-004). */
export function TimelineSection({ data }: { data: ProjectDetailData }) {
  const { example, listing } = data;
  const updates = example.updates;
  return (
    <Section tone="light" spacing="md" ruled labelledBy="titulo-cronograma" innerClassName="grid gap-10 lg:grid-cols-2" data-testid="seccion-cronograma">
      <div className="flex flex-col gap-5">
        <h2 id="titulo-cronograma" className="font-heading text-3xl font-medium">
          {C.timeline.title}
        </h2>
        <ol className="flex flex-col gap-4" data-testid="cronograma-hitos">
          {example.milestones.map((m) => (
            <li key={m.label} className="flex flex-col gap-1 border-l-2 border-line pl-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium">{m.label}</span>
                <StatusBadge tone={TONE[m.status]} label={C.timeline.status[m.status]} />
              </div>
              {m.status === "done" && m.offsetDays !== null ? (
                <span className="font-mono text-sm text-muted-foreground">
                  {formatIsoDate(dateAfterPurchase(listing.acquiredOn, m.offsetDays), "numeric")}
                </span>
              ) : null}
              {m.status === "upcoming" && m.targetMonth !== null ? (
                <ProjectionLabel placement="inline">
                  <span className="text-sm text-muted-foreground">{C.timeline.targetMonth(m.targetMonth)}</span>
                </ProjectionLabel>
              ) : null}
            </li>
          ))}
        </ol>
      </div>
      <div className="flex flex-col gap-5" data-testid="actualizaciones">
        <h2 id="titulo-actualizaciones" className="font-heading text-3xl font-medium">
          {C.updates.title}
        </h2>
        {updates.length === 0 ? (
          <EmptyState title={C.updates.empty.title} description={C.updates.empty.description} />
        ) : (
          <ul className="flex flex-col gap-4">
            {updates.map((u) => (
              <Surface as="li" key={u.title} padding="sm" data-testid="actualizacion">
                <span className="font-mono text-sm text-muted-foreground">
                  {formatIsoDate(dateAfterPurchase(listing.acquiredOn, u.offsetDays), "numeric")}
                </span>
                <h3 className="font-medium">{u.title}</h3>
                <p className="text-sm text-muted-foreground">{u.text}</p>
              </Surface>
            ))}
          </ul>
        )}
      </div>
    </Section>
  );
}
