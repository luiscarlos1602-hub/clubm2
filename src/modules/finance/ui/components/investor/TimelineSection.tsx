import { formatIsoDate } from "@/shared/lib/format-date";
import { EmptyState, ProcessBoard } from "@/shared/ui/brand";
import { Section, Surface } from "@/shared/ui/layout";
import { dateAfterPurchase } from "../../hooks/project-figures";
import { toProcessStages } from "../../hooks/process-stages";
import type { ProjectDetailData } from "../../hooks/use-project-detail";
import { PROJECT_DETAIL_COPY } from "./copy";

const C = PROJECT_DETAIL_COPY;

/** Tablero de proceso (fechas estimadas = proyección) y actualizaciones fechadas. Sin indicadores de velocidad de venta (ADR-004). */
export function TimelineSection({ data }: { data: ProjectDetailData }) {
  const { example, listing } = data;
  const updates = example.updates;
  return (
    <Section tone="light" spacing="md" ruled labelledBy="titulo-cronograma" innerClassName="flex flex-col gap-10" data-testid="seccion-cronograma">
      <div className="flex max-w-[60ch] flex-col gap-3">
        <h2 id="titulo-cronograma" className="font-heading text-3xl font-medium">
          {C.timeline.title}
        </h2>
        <p className="text-muted-foreground">{C.timeline.description}</p>
      </div>
      <ProcessBoard stages={toProcessStages(listing.acquiredOn, example.process)} data-testid="ficha-proceso" />
      <div className="flex flex-col gap-5" data-testid="actualizaciones">
        <h2 id="titulo-actualizaciones" className="font-heading text-3xl font-medium">
          {C.updates.title}
        </h2>
        {updates.length === 0 ? (
          <EmptyState title={C.updates.empty.title} description={C.updates.empty.description} />
        ) : (
          <ul className="grid gap-4 lg:grid-cols-3">
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
