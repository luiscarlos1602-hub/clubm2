"use client";

import Link from "next/link";
import { MoneyDisplay } from "@/shared/ui/brand";
import { Eyebrow, PageHeader, Section, Surface } from "@/shared/ui/layout";
import { ADMIN_COMMON, DASHBOARD_COPY as C, STAGE_LABEL, WHEEL_LABEL } from "./copy";
import { AVAILABLE_BY_CODE, OWN_CAPITAL_IMMOBILIZED, PLACED_BY_CODE } from "./examples";
import { AdminBarChart, AdminDonut, AdminKpi } from "@/shared/ui/admin";
import { AdminQueryState } from "@/shared/ui/admin";
import { TableScroll } from "@/shared/ui/admin";
import { StageBadge, WheelBadge } from "./badges";
import { countActive, countByStatus, wheelShares } from "./summarize";
import { useAdminProjects } from "./use-admin-projects";
import { formatIsoDate } from "@/shared/lib/format-date";
import { PROJECT_STATUSES } from "../../../domain/project-status";

const WHEEL_COLOR = { good: 1, medium: 4, bad: 2, in_progress: 5 } as const;

/** B1 · Panel de operación. Las ruedas viven solo aquí (ADR-004). */
export function AdminDashboard() {
  const query = useAdminProjects();
  const rows = query.data ?? [];
  const byStage = countByStatus(rows);
  const stages = PROJECT_STATUSES.filter((s) => (byStage[s] ?? 0) > 0);
  const placementCodes = Object.keys(PLACED_BY_CODE);
  const wheels = wheelShares(rows);
  const measured = wheels.filter((w) => w.count > 0);

  return (
    <div data-testid="pagina-b1" data-route-id="b1" className="flex flex-col">
      <PageHeader id="admin-panel-titulo" eyebrow={C.eyebrow} title={C.title} description={C.description} data-testid="admin-panel-cabecera" />
      <Section tone="paper" spacing="md" labelledBy="admin-kpis" innerClassName="flex flex-col gap-8">
        <h2 id="admin-kpis" className="font-heading text-2xl font-semibold">{C.kpis.heading}</h2>
        <AdminQueryState isPending={query.isPending} isError={query.isError} isEmpty={rows.length === 0} onRetry={() => void query.refetch()} testId="admin-panel">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <AdminKpi label={C.kpis.ownCapital} hint={C.kpis.ownCapitalHint} data-testid="admin-kpi-capital">
              <MoneyDisplay value={OWN_CAPITAL_IMMOBILIZED} kind="amount" size="lg" />
            </AdminKpi>
            <AdminKpi label={C.kpis.active} hint={C.kpis.activeHint} data-testid="admin-kpi-activos">{countActive(rows)}</AdminKpi>
            <AdminKpi label={C.kpis.placed} hint={C.kpis.placedHint} data-testid="admin-kpi-colocadas">{C.kpis.placedValue}</AdminKpi>
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <Surface data-testid="admin-por-etapa" padding="md">
              <Eyebrow>{C.byStage.heading}</Eyebrow>
              <AdminBarChart
                ariaLabel={C.charts.stageLabel}
                layout="categories-y"
                height={Math.max(180, stages.length * 44)}
                data-testid="admin-grafica-etapas"
                series={[{ key: "count", label: C.charts.stageLabel, color: 1 }]}
                data={stages.map((s) => ({ label: STAGE_LABEL[s], count: byStage[s] ?? 0 }))}
              />
            </Surface>
            <Surface data-testid="admin-colocacion" padding="md">
              <Eyebrow>{C.charts.placementHeading}</Eyebrow>
              <p className="text-sm text-muted-foreground">{C.charts.placementDescription}</p>
              <AdminBarChart
                ariaLabel={C.charts.placementLabel}
                layout="categories-y"
                stacked
                categoryWidth={64}
                height={Math.max(220, placementCodes.length * 40)}
                data-testid="admin-grafica-colocacion"
                series={[
                  { key: "placed", label: C.charts.placed, color: 1 },
                  { key: "available", label: C.charts.available, color: 5 },
                ]}
                data={placementCodes.map((code) => ({ label: code, placed: PLACED_BY_CODE[code] ?? 0, available: AVAILABLE_BY_CODE[code] ?? 0 }))}
              />
            </Surface>
          </div>
        </AdminQueryState>
      </Section>

      <Section tone="dark" spacing="md" labelledBy="admin-ruedas" innerClassName="flex flex-col gap-8" data-testid="admin-ruedas">
        <div className="flex flex-col gap-3">
          <Eyebrow>{C.wheels.eyebrow}</Eyebrow>
          <h2 id="admin-ruedas" className="font-heading text-3xl font-semibold">{C.wheels.heading}</h2>
          <p className="max-w-[62ch] text-foreground/85">{C.wheels.description}</p>
          <p className="text-sm text-muted-foreground">{ADMIN_COMMON.internalOnly}</p>
        </div>
        <Surface data-testid="admin-ruedas-grafica" padding="md">
          <AdminDonut
            ariaLabel={C.charts.wheelsLabel}
            data-testid="admin-grafica-ruedas"
            slices={measured.map((w) => ({ label: WHEEL_LABEL[w.wheel], value: w.count, color: WHEEL_COLOR[w.wheel] }))}
          />
        </Surface>
        <ul className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {wheels.map((s) => (
            <li key={s.wheel} data-testid={`admin-rueda-${s.wheel}`}>
              <Surface padding="sm" className="gap-1">
                <span className="text-sm text-muted-foreground">{WHEEL_LABEL[s.wheel]}</span>
                <span className="font-heading text-3xl font-semibold tabular-nums">{s.percent} %</span>
                <span className="text-xs text-muted-foreground">{s.count} · {C.wheels.share}</span>
              </Surface>
            </li>
          ))}
        </ul>
      </Section>

      <Section tone="light" spacing="md" labelledBy="admin-tabla" innerClassName="flex flex-col gap-6">
        <h2 id="admin-tabla" className="font-heading text-2xl font-semibold">{C.table.heading}</h2>
        <TableScroll label={C.table.heading} data-testid="admin-tabla-proyectos">
          <thead>
            <tr>
              <th scope="col">{ADMIN_COMMON.code}</th>
              <th scope="col">{ADMIN_COMMON.project}</th>
              <th scope="col">{ADMIN_COMMON.stage}</th>
              <th scope="col">{ADMIN_COMMON.wheel}</th>
              <th scope="col">{C.wheels.measured}</th>
              <th scope="col">{C.table.placement}</th>
              <th scope="col"><span className="sr-only">{C.table.detail}</span></th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ project, property, wheel }) => (
              <tr key={project.id} data-testid={`admin-fila-${project.code}`}>
                <td className="font-mono">{project.code}</td>
                <td>
                  {project.name}
                  <span className="block text-xs text-muted-foreground">{property?.zone}</span>
                </td>
                <td><StageBadge status={project.status} /></td>
                <td><WheelBadge wheel={wheel?.wheel ?? null} /></td>
                <td className="whitespace-nowrap text-xs text-muted-foreground">
                  {wheel ? `${formatIsoDate(wheel.measuredFrom, "short")} ${C.wheels.until} ${formatIsoDate(wheel.measuredUntil, "short")}` : C.wheels.none}
                </td>
                <td className="tabular-nums">{PLACED_BY_CODE[project.code] !== undefined ? `${PLACED_BY_CODE[project.code]} / 100` : "—"}</td>
                <td>
                  <Link href={`/admin/proyectos/${project.slug}`} className="text-sm font-medium underline underline-offset-4 focus-visible:ring-2 focus-visible:ring-ring">
                    {C.table.detail}
                    <span className="sr-only"> {project.code}</span>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </TableScroll>
      </Section>
    </div>
  );
}
