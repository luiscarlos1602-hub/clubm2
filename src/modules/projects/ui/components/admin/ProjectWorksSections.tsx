"use client";

import Link from "next/link";
import type { ComponentType } from "react";
import { formatIsoDate } from "@/shared/lib/format-date";
import { formatMoney } from "@/shared/lib/format-money";
import { usd } from "@/shared/domain/money";
import type { IsoDate } from "@/shared/domain/calendar-date";
import { MoneyDisplay, ProjectGallery } from "@/shared/ui/brand";
import { AdminBarChart, AdminDonut, MockAction, TableScroll } from "@/shared/ui/admin";
import { Eyebrow, Section, Surface } from "@/shared/ui/layout";
import { WORKS_COPY as C } from "./copy";
import {
  AVAILABLE_BY_CODE,
  BUDGET_LINES,
  INVESTORS_BY_CODE,
  PLACED_BY_CODE,
  PUBLISHED_UPDATES,
  SPENT_BY_PROFILE,
  WORK_ORDERS,
  type BudgetLineKey,
  type WorksProfile,
} from "./examples";
import { ProjectBudgetPanel } from "./ProjectBudgetPanel";
import { StageBadge, WheelBadge } from "./badges";
import type { ProjectRow } from "./use-admin-projects";

const LINE_KEYS = Object.keys(BUDGET_LINES) as BudgetLineKey[];
const STATE_LABEL = C.states;

/** Tablero de proceso inyectado por `app/admin` (finance: la misma fuente que la ficha y el panel). */
export type ProcessBoardView = ComponentType<{ code: string; acquiredOn: IsoDate; "data-testid"?: string }>;

type Row = ProjectRow;

export function WorksOverviewSection({ row }: { row: Row }) {
  const code = row.project.code;
  return (
    <Section tone="light" spacing="md" labelledBy="obra-imagenes-h" innerClassName="grid gap-8 lg:grid-cols-12">
      <div className="flex min-w-0 flex-col gap-3 lg:col-span-7">
        <h2 id="obra-imagenes-h" className="font-heading text-2xl font-semibold">{C.detail.imagesHeading}</h2>
        <ProjectGallery code={code} name={row.project.name} data-testid="obra-galeria" />
      </div>
      <Surface className="min-w-0 lg:col-span-5" data-testid="obra-colocacion">
        <Eyebrow>{C.detail.statusHeading}</Eyebrow>
        <div className="flex flex-wrap items-center gap-3">
          <StageBadge status={row.project.status} />
          <WheelBadge wheel={row.wheel?.wheel ?? null} />
        </div>
        <h3 className="font-heading text-lg font-semibold">{C.detail.placementHeading}</h3>
        {PLACED_BY_CODE[code] !== undefined ? (
          <AdminDonut
            ariaLabel={C.detail.placementLabel}
            data-testid="obra-grafica-colocacion"
            slices={[
              { label: C.detail.placed, value: PLACED_BY_CODE[code] ?? 0, color: 1 },
              { label: C.detail.available, value: AVAILABLE_BY_CODE[code] ?? 0, color: 5 },
            ]}
            center={<span className="font-heading text-xl font-semibold tabular-nums">{C.detail.placementOf(PLACED_BY_CODE[code] ?? 0)}</span>}
          />
        ) : (
          <p className="text-sm text-muted-foreground">{C.detail.placementNone}</p>
        )}
        <Link href={`/admin/adquisiciones/${row.project.slug}`} data-testid="obra-ver-adquisicion" className="text-sm font-medium underline underline-offset-4 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
          {C.detail.openAcquisition}
        </Link>
      </Surface>
    </Section>
  );
}

export function WorksBudgetSection({ profile }: { profile: WorksProfile }) {
  return (
    <Section tone="sand" spacing="md" labelledBy="obra-presupuesto-h" innerClassName="grid gap-8 lg:grid-cols-12">
      <div className="flex flex-col gap-3 lg:col-span-4">
        <h2 id="obra-presupuesto-h" className="font-heading text-2xl font-semibold">{C.budget.heading}</h2>
        <p className="text-muted-foreground">{C.budget.description}</p>
        <p className="text-sm text-muted-foreground" data-testid="obra-desvios">
          <strong className="text-foreground">{C.deviations.heading}. </strong>
          {profile === "finished" ? C.deviations.some : C.deviations.none}
        </p>
      </div>
      <div className="flex min-w-0 flex-col gap-6 lg:col-span-8">
        <ProjectBudgetPanel profile={profile} />
        <Surface data-testid="obra-grafica-presupuesto">
          <h3 className="font-heading text-lg font-semibold">{C.detail.budgetChartHeading}</h3>
          <AdminBarChart
            ariaLabel={C.detail.budgetChartLabel}
            format={(v) => formatMoney(usd(v))}
            series={[
              { key: "budgeted", label: C.budget.budgeted, color: 5 },
              { key: "spent", label: C.budget.spent, color: 1 },
            ]}
            data={LINE_KEYS.map((k) => ({ label: C.budget.lines[k], budgeted: BUDGET_LINES[k].cents, spent: SPENT_BY_PROFILE[profile][k].cents }))}
          />
        </Surface>
      </div>
    </Section>
  );
}

/** El proceso es solo el tablero (única fuente: finance). Sin tablero inyectado o sin fecha de compra, no se muestra. */
export function WorksProcessSection({ row, ProcessView }: { row: Row; ProcessView?: ProcessBoardView }) {
  const acquiredOn = row.project.timeline.acquiredOn;
  if (!ProcessView || !acquiredOn) return null;
  return (
    <Section tone="light" spacing="md" labelledBy="obra-proceso-h" innerClassName="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 id="obra-proceso-h" className="font-heading text-2xl font-semibold">{C.detail.processHeading}</h2>
        <p className="max-w-[62ch] text-muted-foreground">{C.detail.processDescription}</p>
      </div>
      <ProcessView code={row.project.code} acquiredOn={acquiredOn} data-testid="obra-proceso" />
    </Section>
  );
}

export function WorksInvestorsSection({ code }: { code: string }) {
  const investors = INVESTORS_BY_CODE[code];
  if (!investors) return null;
  return (
    <Section tone="paper" spacing="md" labelledBy="obra-inversionistas-h" innerClassName="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 id="obra-inversionistas-h" className="font-heading text-2xl font-semibold">{C.detail.investorsHeading}</h2>
        <p className="max-w-[62ch] text-muted-foreground">{C.detail.investorsDescription}</p>
      </div>
      <TableScroll label={C.detail.investorsLabel} data-testid="obra-inversionistas">
        <thead><tr>
          <th scope="col">{C.detail.investorName}</th><th scope="col">{C.detail.investorSince}</th><th scope="col">{C.detail.investorParticipations}</th>
        </tr></thead>
        <tbody>
          {investors.map((i) => (
            <tr key={i.name}>
              <td>{i.name}</td>
              <td>{formatIsoDate(i.since, "short")}</td>
              <td className="tabular-nums">{i.participations}</td>
            </tr>
          ))}
        </tbody>
      </TableScroll>
    </Section>
  );
}

/** Órdenes de trabajo con contratista (no es la cronología del proyecto: esa es el tablero de proceso). */
export function WorksOrdersSection() {
  return (
    <Section tone="sand" spacing="md" labelledBy="obra-ordenes-h" innerClassName="flex flex-col gap-4">
      <h2 id="obra-ordenes-h" className="font-heading text-2xl font-semibold">{C.orders.heading}</h2>
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
    </Section>
  );
}

export function WorksPublishSection() {
  return (
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
  );
}
