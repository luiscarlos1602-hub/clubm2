"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeader, Section, Surface } from "@/shared/ui/layout";
import { AdminQueryState } from "@/shared/ui/admin";
import { Button } from "@/shared/ui/primitives/button";
import type { ProjectStatus } from "../../../domain/project-status";
import { ACQUISITIONS_COPY as C } from "./copy";
import { useAdminProjects, type ProjectRow } from "./use-admin-projects";

const LINK = "rounded-sm font-medium underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50";

/** Columnas del pipeline (docs/02 §2). "Comprado" sigue al proyecto mientras se coloca y se reforma. */
const COLUMNS: readonly { readonly id: string; readonly title: string; readonly statuses: readonly ProjectStatus[] }[] = [
  { id: "oportunidad", title: C.columns.opportunity, statuses: ["opportunity"] },
  { id: "due-diligence", title: C.columns.due_diligence, statuses: ["due_diligence"] },
  { id: "comprado", title: C.columns.acquired, statuses: ["acquired", "funding", "renovation"] },
  { id: "descartado", title: C.columns.discarded, statuses: ["discarded"] },
];

function ProjectCard({ row }: { row: ProjectRow }) {
  return (
    <li data-testid={`oportunidad-${row.project.code}`}>
      <Surface padding="sm" className="gap-2">
        <span className="font-mono text-xs text-muted-foreground">{row.project.code}</span>
        <Link href={`/admin/adquisiciones/${row.project.slug}`} data-testid={`oportunidad-ver-${row.project.code}`} className={LINK}>
          {row.project.name}
          <span className="sr-only"> · {C.openDetail}</span>
        </Link>
        <span className="text-xs text-muted-foreground">{row.property?.city} · {row.property?.zone}</span>
      </Surface>
    </li>
  );
}

function Column({ id, title, rows, footer }: { id: string; title: string; rows: readonly ProjectRow[]; footer?: React.ReactNode }) {
  return (
    <section aria-labelledby={`col-${id}`} data-testid={`columna-${id}`} className="flex min-w-0 flex-col gap-3 rounded-2xl bg-line/15 p-3">
      <h3 id={`col-${id}`} className="flex items-baseline justify-between px-1 text-sm font-semibold">
        {title}
        <span className="text-xs font-normal text-muted-foreground tabular-nums">{rows.length}</span>
      </h3>
      {rows.length === 0 ? (
        <p className="px-1 py-4 text-xs text-muted-foreground">{C.emptyColumn}</p>
      ) : (
        <ul className="flex flex-col gap-3">{rows.map((r) => <ProjectCard key={r.project.id} row={r} />)}</ul>
      )}
      {footer}
    </section>
  );
}

/** B2 · Pipeline de oportunidades (W-3): columnas por etapa real del repositorio; el cambio de etapa vive en el detalle. */
export function AcquisitionsBoard() {
  const query = useAdminProjects();
  const rows = query.data ?? [];
  return (
    <div data-testid="pagina-b2" data-route-id="b2" className="flex flex-col">
      <PageHeader id="admin-adq-titulo" eyebrow={C.eyebrow} title={C.title} description={C.description} data-testid="admin-adq-cabecera" />
      <Section tone="paper" spacing="md" label={C.boardLabel} innerClassName="flex flex-col gap-8">
        <AdminQueryState isPending={query.isPending} isError={query.isError} isEmpty={false} onRetry={() => void query.refetch()} testId="admin-adq">
          <div data-testid="admin-kanban" className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {COLUMNS.map((col) => (
              <Column
                key={col.id}
                id={col.id}
                title={col.title}
                rows={rows.filter((r) => col.statuses.includes(r.project.status))}
                footer={col.id === "oportunidad" ? (
                  <Button asChild variant="outline" size="sm" className="self-start">
                    <Link href="/admin/proyectos/nuevo" data-testid="adq-nueva-oportunidad"><Plus aria-hidden />{C.newOpportunity}</Link>
                  </Button>
                ) : undefined}
              />
            ))}
          </div>
        </AdminQueryState>
      </Section>
    </div>
  );
}
