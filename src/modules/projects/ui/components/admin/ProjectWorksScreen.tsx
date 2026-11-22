"use client";

import Link from "next/link";
import { Hammer } from "lucide-react";
import { formatIsoDate } from "@/shared/lib/format-date";
import { EmptyState, MoneyDisplay, ProjectSeal } from "@/shared/ui/brand";
import { Eyebrow, PageHeader, Section, Surface } from "@/shared/ui/layout";
import { Button } from "@/shared/ui/primitives/button";
import type { ProjectStatus } from "../../../domain/project-status";
import { ADMIN_COMMON, WORKS_COPY as C } from "./copy";
import { MILESTONES, PUBLISHED_UPDATES, WORK_ORDERS, type WorksProfile } from "./examples";
import { AdminQueryState } from "@/shared/ui/admin";
import { MockAction } from "@/shared/ui/admin";
import { ProjectBudgetPanel } from "./ProjectBudgetPanel";
import { TableScroll } from "@/shared/ui/admin";
import { StageBadge, WheelBadge } from "./badges";
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
const STATE_LABEL = { done: C.milestones.done, current: C.milestones.current, upcoming: C.milestones.upcoming } as const;

/** B3 · Obra de un proyecto: presupuesto frente a gasto, hitos y publicación de avances (maqueta). */
export function ProjectWorksScreen({ idOrSlug }: { idOrSlug: string }) {
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

      {row && !profile ? (
        <Section tone="light" spacing="md" label={C.noWorks.title}>
          <EmptyState icon={Hammer} data-testid="admin-obra-sin-obra" title={C.noWorks.title} description={C.noWorks.description} />
        </Section>
      ) : null}

      {row && profile ? (
        <>
          <Section tone="light" spacing="md" labelledBy="obra-presupuesto-h" innerClassName="grid gap-8 lg:grid-cols-12">
            <div className="flex flex-col gap-3 lg:col-span-4">
              <h2 id="obra-presupuesto-h" className="font-heading text-2xl font-semibold">{C.budget.heading}</h2>
              <p className="text-muted-foreground">{C.budget.description}</p>
              <p className="text-sm text-muted-foreground" data-testid="obra-desvios">
                <strong className="text-foreground">{C.deviations.heading}. </strong>
                {profile === "finished" ? C.deviations.some : C.deviations.none}
              </p>
            </div>
            <div className="min-w-0 lg:col-span-8"><ProjectBudgetPanel profile={profile} /></div>
          </Section>

          <Section tone="sand" spacing="md" labelledBy="obra-hitos-h" innerClassName="grid gap-8 lg:grid-cols-12">
            <div className="flex min-w-0 flex-col gap-4 lg:col-span-5">
              <h2 id="obra-hitos-h" className="font-heading text-2xl font-semibold">{C.milestones.heading}</h2>
              <ol className="flex flex-col gap-3" data-testid="obra-hitos">
                {MILESTONES.map((m, i) => (
                  <li key={m.label} className="flex items-center gap-3 text-sm" data-state={m.states[profile]}>
                    <span className="font-mono text-xs text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
                    <span className="flex-1">{m.label}</span>
                    <span className="text-xs text-muted-foreground">{STATE_LABEL[m.states[profile]]}</span>
                  </li>
                ))}
              </ol>
            </div>
            <div className="flex min-w-0 flex-col gap-4 lg:col-span-7">
              <h2 className="font-heading text-2xl font-semibold">{C.orders.heading}</h2>
              <TableScroll label={C.orders.heading} data-testid="obra-ordenes">
                <thead><tr>
                  <th scope="col">{C.orders.columns.order}</th><th scope="col">{C.orders.columns.contractor}</th>
                  <th scope="col">{C.orders.columns.budget}</th><th scope="col">{C.orders.columns.status}</th>
                </tr></thead>
                <tbody>
                  {WORK_ORDERS.map((o) => (
                    <tr key={o.id}>
                      <td>{o.id}</td><td>{o.contractor}</td>
                      <td><MoneyDisplay value={o.budget} kind="amount" size="sm" /></td>
                      <td>{STATE_LABEL[o.status]}</td>
                    </tr>
                  ))}
                </tbody>
              </TableScroll>
            </div>
          </Section>

          <Section tone="light" spacing="md" labelledBy="obra-avance-h" innerClassName="grid gap-8 lg:grid-cols-12">
            <Surface className="lg:col-span-7" data-testid="obra-publicar">
              <Eyebrow>{C.publish.heading}</Eyebrow>
              <p id="obra-avance-h" className="text-muted-foreground">{C.publish.description}</p>
              <label htmlFor="obra-avance-texto" className="text-sm font-medium">{C.publish.label}</label>
              <textarea id="obra-avance-texto" rows={4} placeholder={C.publish.placeholder}
                className="w-full rounded-lg border border-border bg-background p-3 text-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none" />
              <MockAction label={C.publish.action} doneMessage={C.publish.done} data-testid="obra-publicar-avance" />
            </Surface>
            <div className="flex min-w-0 flex-col gap-4 lg:col-span-5">
              <h2 className="font-heading text-xl font-semibold">{C.publish.history}</h2>
              <ul className="flex flex-col gap-3" data-testid="obra-avances">
                {PUBLISHED_UPDATES.map((u) => (
                  <li key={u.date} className="border-l-2 border-line pl-4 text-sm">
                    <span className="block font-mono text-xs text-muted-foreground">{formatIsoDate(u.date, "short")}</span>
                    {u.text}
                  </li>
                ))}
              </ul>
            </div>
          </Section>
        </>
      ) : null}
    </div>
  );
}
