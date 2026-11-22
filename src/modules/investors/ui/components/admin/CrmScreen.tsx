"use client";

import { useState } from "react";
import { Users } from "lucide-react";
import { formatIsoDate } from "@/shared/lib/format-date";
import { EmptyState, MoneyDisplay } from "@/shared/ui/brand";
import { PageHeader, Section, Surface } from "@/shared/ui/layout";
import { AdminKpi, MockAction, TableScroll } from "@/shared/ui/admin";
import { CRM_COPY as C } from "./copy";
import { AVERAGE_TICKET, FUNNEL, LEADS, LEADS_THIS_MONTH, ORIGINS, REGISTRY_TO_INVESTED, type FunnelStepKey } from "./examples";

/** B6 · Leads, embudo y origen. Todo de ejemplo; el filtro solo recorta la lista. */
export function CrmScreen() {
  const [step, setStep] = useState<FunnelStepKey | "all">("all");
  const visible = LEADS.filter((l) => step === "all" || l.step === step);
  return (
    <div data-testid="pagina-b6" data-route-id="b6" className="flex flex-col">
      <PageHeader id="admin-crm-titulo" eyebrow={C.eyebrow} title={C.title} description={C.description} data-testid="admin-crm-cabecera" />
      <Section tone="paper" spacing="md" labelledBy="crm-kpis" innerClassName="flex flex-col gap-8">
        <h2 id="crm-kpis" className="font-heading text-2xl font-semibold">{C.kpis.heading}</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <AdminKpi label={C.kpis.leads} data-testid="crm-kpi-leads">{LEADS_THIS_MONTH}</AdminKpi>
          <AdminKpi label={C.kpis.ticket} hint={C.kpis.ticketHint} data-testid="crm-kpi-ticket">
            <MoneyDisplay value={AVERAGE_TICKET} kind="amount" size="lg" />
          </AdminKpi>
          <AdminKpi label={C.kpis.conversion} data-testid="crm-kpi-conversion">{REGISTRY_TO_INVESTED}</AdminKpi>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Surface data-testid="crm-embudo">
            <h3 className="font-heading text-xl font-semibold">{C.funnel.heading}</h3>
            <p className="text-sm text-muted-foreground">{C.funnel.description}</p>
            <ol className="flex flex-col gap-3">
              {FUNNEL.map((f) => (
                <li key={f.key} className="flex flex-col gap-1 text-sm">
                  <span className="flex justify-between"><span>{C.funnel.steps[f.key]}</span><span className="tabular-nums">{f.count}</span></span>
                  <span aria-hidden className="h-2.5 overflow-hidden rounded-full bg-line/30">
                    <span className="block h-full rounded-full bg-primary" style={{ width: `${f.widthPercent}%` }} />
                  </span>
                </li>
              ))}
            </ol>
          </Surface>
          <Surface data-testid="crm-origen">
            <h3 className="font-heading text-xl font-semibold">{C.origin.heading}</h3>
            <p className="text-sm text-muted-foreground">{C.origin.description}</p>
            <ul className="flex flex-col gap-3">
              {ORIGINS.map((o) => (
                <li key={o.label} className="flex flex-col gap-1 text-sm">
                  <span className="flex justify-between"><span>{o.label}</span><span className="tabular-nums">{o.percent} %</span></span>
                  <span aria-hidden className="h-2.5 overflow-hidden rounded-full bg-line/30">
                    <span className="block h-full rounded-full bg-primary" style={{ width: `${o.percent}%` }} />
                  </span>
                </li>
              ))}
            </ul>
          </Surface>
        </div>
      </Section>
      <Section tone="light" spacing="md" labelledBy="crm-leads" innerClassName="flex flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <h2 id="crm-leads" className="font-heading text-2xl font-semibold">{C.leads.heading}</h2>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="crm-filtro" className="text-sm font-medium">{C.leads.filterLabel}</label>
            <select id="crm-filtro" data-testid="crm-filtro" value={step} onChange={(e) => setStep(e.target.value as FunnelStepKey | "all")}
              className="h-10 rounded-lg border border-border bg-background px-3 text-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
              <option value="all">{C.leads.all}</option>
              {FUNNEL.map((f) => <option key={f.key} value={f.key}>{C.funnel.steps[f.key]}</option>)}
            </select>
          </div>
        </div>
        {visible.length === 0 ? (
          <EmptyState icon={Users} data-testid="crm-vacio" title={C.leads.emptyTitle} description={C.leads.emptyDescription} />
        ) : (
          <TableScroll label={C.leads.tableLabel} data-testid="crm-tabla">
            <thead><tr>
              <th scope="col">{C.leads.name}</th><th scope="col">{C.leads.city}</th><th scope="col">{C.leads.origin}</th>
              <th scope="col">{C.leads.step}</th><th scope="col">{C.leads.date}</th><th scope="col">{C.leads.ticket}</th>
              <th scope="col"><span className="sr-only">{C.leads.contact}</span></th>
            </tr></thead>
            <tbody>
              {visible.map((l) => (
                <tr key={l.id} data-testid={`crm-fila-${l.id}`}>
                  <td>{l.name}</td><td>{l.city}</td><td>{l.origin}</td><td>{C.funnel.steps[l.step]}</td>
                  <td className="whitespace-nowrap">{formatIsoDate(l.date, "short")}</td>
                  <td>{l.ticket ? <MoneyDisplay value={l.ticket} kind="amount" size="sm" /> : C.leads.noTicket}</td>
                  <td><MockAction label={C.leads.contact} doneMessage={C.leads.contacted} variant="outline" data-testid={`crm-contactar-${l.id}`} /></td>
                </tr>
              ))}
            </tbody>
          </TableScroll>
        )}
      </Section>
    </div>
  );
}
