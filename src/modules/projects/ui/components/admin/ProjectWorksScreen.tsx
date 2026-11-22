"use client";

import Link from "next/link";
import { Hammer } from "lucide-react";
import { EmptyState, ProjectSeal } from "@/shared/ui/brand";
import { AdminQueryState } from "@/shared/ui/admin";
import { PageHeader, Section } from "@/shared/ui/layout";
import { Button } from "@/shared/ui/primitives/button";
import type { ProjectStatus } from "../../../domain/project-status";
import { ADMIN_COMMON, WORKS_COPY as C } from "./copy";
import type { WorksProfile } from "./examples";
import { StageBadge, WheelBadge } from "./badges";
import {
  WorksBudgetSection,
  WorksInvestorsSection,
  WorksOrdersSection,
  WorksOverviewSection,
  WorksProcessSection,
  WorksPublishSection,
  type ProcessBoardView,
} from "./ProjectWorksSections";
import { useAdminProjects } from "./use-admin-projects";

const PROFILE: Partial<Record<ProjectStatus, WorksProfile>> = {
  acquired: "funding",
  funding: "funding",
  renovation: "renovation",
  on_sale: "finished",
  stalled: "finished",
  sold: "finished",
  settled: "finished",
};

/** B3 · Obra de un proyecto: presupuesto frente a gasto, proceso y publicación de avances (maqueta).
 *  `ProcessView` lo inyecta app/admin (finance es la única fuente del tablero de proceso). */
export function ProjectWorksScreen({ idOrSlug, ProcessView }: { idOrSlug: string; ProcessView?: ProcessBoardView }) {
  const query = useAdminProjects();
  const rows = query.data ?? [];
  const row = rows.find((r) => r.project.slug === idOrSlug || r.project.id === idOrSlug);
  const profile = row ? PROFILE[row.project.status] : undefined;

  return (
    <div data-testid="pagina-b3" data-route-id="b3" className="flex flex-col">
      <PageHeader
        id="admin-obra-titulo"
        eyebrow={C.eyebrow}
        title={row ? row.project.name : C.title}
        description={row ? undefined : C.description}
        aside={row?.project.timeline.acquiredOn ? <ProjectSeal code={row.project.code} date={row.project.timeline.acquiredOn} /> : undefined}
        data-testid="admin-obra-cabecera"
      />
      <Section tone="paper" spacing="md" label={C.title} innerClassName="flex flex-col gap-8">
        <AdminQueryState isPending={query.isPending} isError={query.isError} isEmpty={false} onRetry={() => void query.refetch()} testId="admin-obra">
          {!row ? (
            <EmptyState data-testid="admin-obra-no-encontrado" title={C.notFound.title} description={C.notFound.description}
              action={<Button asChild variant="outline"><Link href="/admin">{C.notFound.action}</Link></Button>} />
          ) : (
            <div className="flex flex-wrap items-center gap-3" data-testid="admin-obra-resumen">
              <StageBadge status={row.project.status} />
              <span className="text-sm text-muted-foreground">{ADMIN_COMMON.wheel}</span>
              <WheelBadge wheel={row.wheel?.wheel ?? null} />
              <span className="text-sm text-muted-foreground">{row.property?.city} · {row.property?.zone}</span>
            </div>
          )}
        </AdminQueryState>
      </Section>

      {row ? <WorksOverviewSection row={row} /> : null}

      {row && !profile ? (
        <Section tone="light" ruled spacing="md" label={C.noWorks.title}>
          <EmptyState icon={Hammer} data-testid="admin-obra-sin-obra" title={C.noWorks.title} description={C.noWorks.description} />
        </Section>
      ) : null}

      {row && profile ? (
        <>
          <WorksBudgetSection profile={profile} />
          <WorksProcessSection row={row} ProcessView={ProcessView} />
          <WorksInvestorsSection code={row.project.code} />
          <WorksOrdersSection />
          <WorksPublishSection />
        </>
      ) : null}
    </div>
  );
}
