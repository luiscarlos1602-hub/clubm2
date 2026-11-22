"use client";

import type { Money } from "@/shared/domain/money";
import { MoneyDisplay } from "@/shared/ui/brand";
import { PageHeader, Section } from "@/shared/ui/layout";
import { StageBadge } from "@/modules/projects/backoffice-ui";
import { AdminKpi, AdminQueryState, TableScroll } from "@/shared/ui/admin";
import { FINANCE_ADMIN_COPY as C } from "./copy";
import { EXTERNAL_CAPITAL_BY_CODE, EXTERNAL_CAPITAL_TOTAL, OWN_CAPITAL_TOTAL } from "./examples";
import { SettlementPanel } from "./SettlementPanel";
import { useAdminFinance } from "./use-admin-finance";

/** B5 · Finanzas: caja por proyecto y liquidación con el motor. */
export function FinanceScreen() {
  const query = useAdminFinance();
  const rows = query.data ?? [];
  const funded = rows.filter((r) => r.economics !== null && EXTERNAL_CAPITAL_BY_CODE[r.project.code] !== undefined);
  const settledCount = rows.filter((r) => r.settlement !== null).length;
  return (
    <div data-testid="pagina-b5" data-route-id="b5" className="flex flex-col">
      <PageHeader id="admin-fin-titulo" eyebrow={C.eyebrow} title={C.title} description={C.description} data-testid="admin-fin-cabecera" />
      <Section tone="paper" spacing="md" labelledBy="admin-fin-caja" innerClassName="flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <h2 id="admin-fin-caja" className="font-heading text-2xl font-semibold">{C.cash.heading}</h2>
          <p className="max-w-[62ch] text-muted-foreground">{C.cash.description}</p>
        </div>
        <AdminQueryState isPending={query.isPending} isError={query.isError} isEmpty={rows.length === 0} onRetry={() => void query.refetch()} testId="admin-fin">
          <div className="grid gap-4 sm:grid-cols-3">
            <AdminKpi label={C.kpis.own} data-testid="fin-kpi-propio"><MoneyDisplay value={OWN_CAPITAL_TOTAL} kind="amount" size="lg" /></AdminKpi>
            <AdminKpi label={C.kpis.external} data-testid="fin-kpi-externo"><MoneyDisplay value={EXTERNAL_CAPITAL_TOTAL} kind="amount" size="lg" /></AdminKpi>
            <AdminKpi label={C.kpis.settled} data-testid="fin-kpi-liquidados">{settledCount}</AdminKpi>
          </div>
          <TableScroll label={C.cash.tableLabel} data-testid="fin-tabla-caja">
            <thead><tr>
              <th scope="col">{C.cash.project}</th><th scope="col">{C.cash.stage}</th>
              <th scope="col">{C.cash.ownCapital}</th><th scope="col">{C.cash.externalCapital}</th><th scope="col">{C.cash.reserve}</th>
            </tr></thead>
            <tbody>
              {funded.map(({ project, economics }) => (
                <tr key={project.id} data-testid={`fin-fila-${project.code}`}>
                  <td><span className="font-mono">{project.code}</span><span className="block text-xs text-muted-foreground">{project.name}</span></td>
                  <td><StageBadge status={project.status} /></td>
                  <td>{economics ? <MoneyDisplay value={economics.acquisitionCost} kind="amount" size="sm" /> : "—"}</td>
                  <td>{EXTERNAL_CAPITAL_BY_CODE[project.code] ? <MoneyDisplay value={EXTERNAL_CAPITAL_BY_CODE[project.code] as Money} kind="amount" size="sm" /> : "—"}</td>
                  <td className="text-muted-foreground">{C.cash.pending}</td>
                </tr>
              ))}
            </tbody>
          </TableScroll>
        </AdminQueryState>
      </Section>
      <Section tone="sand" spacing="md" labelledBy="admin-fin-liq" innerClassName="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h2 id="admin-fin-liq" className="font-heading text-2xl font-semibold">{C.settlement.heading}</h2>
          <p className="max-w-[62ch] text-muted-foreground">{C.settlement.description}</p>
        </div>
        {rows.length > 0 ? <SettlementPanel rows={rows} /> : null}
      </Section>
    </div>
  );
}
