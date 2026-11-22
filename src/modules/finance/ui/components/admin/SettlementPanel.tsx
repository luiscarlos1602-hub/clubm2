"use client";

import { useState } from "react";
import { MoneyDisplay } from "@/shared/ui/brand";
import { Surface } from "@/shared/ui/layout";
import { usd } from "@/shared/domain/money";
import { formatMoney } from "@/shared/lib/format-money";
import { AdminDonut, MockAction } from "@/shared/ui/admin";
import { FINANCE_ADMIN_COPY } from "./copy";
import { settlementView } from "./settlement-view";
import type { FinanceRow } from "./use-admin-finance";

const C = FINANCE_ADMIN_COPY.settlement;
const CHARTS = FINANCE_ADMIN_COPY.charts;

/** Resultado del motor para el proyecto elegido. Realizado si ya está liquidado; si no, proyección. */
export function SettlementPanel({ rows }: { rows: readonly FinanceRow[] }) {
  const options = rows.flatMap((r) => {
    const view = settlementView(r);
    return view ? [{ row: r, view }] : [];
  });
  const [code, setCode] = useState<string>(options[0]?.row.project.code ?? "");
  const current = options.find((o) => o.row.project.code === code) ?? options[0];
  if (!current) return null;
  const { view, row } = current;
  const kind = view.basis === "realized" ? "realized" : "projection";
  const out = view.outcome;

  return (
    <Surface data-testid="finanzas-liquidacion" className="gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="finanzas-proyecto" className="text-sm font-medium">{C.selectLabel}</label>
          <select
            id="finanzas-proyecto"
            data-testid="finanzas-selector"
            value={row.project.code}
            onChange={(e) => setCode(e.target.value)}
            className="h-10 rounded-lg border border-border bg-background px-3 text-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            {options.map((o) => (
              <option key={o.row.project.id} value={o.row.project.code}>{o.row.project.code} · {o.row.project.name}</option>
            ))}
          </select>
        </div>
        <p className="text-sm font-medium" data-testid="finanzas-base">{view.basis === "realized" ? C.realizedTag : C.projectionTag}</p>
      </div>

      <div role="group" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label={C.inputs}>
        <MoneyDisplay value={view.inputs.salePrice} kind={kind} label={C.salePrice} size="sm" />
        <MoneyDisplay value={view.inputs.acquisition} kind="capital" label={C.acquisition} size="sm" />
        <MoneyDisplay value={view.inputs.recovery} kind="capital" label={C.recovery} size="sm" />
        <MoneyDisplay value={view.inputs.saleCosts} kind={kind} label={C.saleCosts} size="sm" />
      </div>
      <p className="text-sm text-muted-foreground">{C.placed(view.placed, view.total)}</p>

      {out.kind === "no_distribution" ? (
        <p data-testid="finanzas-sin-reparto" className="rounded-xl border border-dashed border-line p-4 text-sm">{C.noDistribution}</p>
      ) : (
        <div className="flex flex-col gap-6 border-t border-border pt-6" data-testid="finanzas-resultado">
          <h3 className="font-heading text-lg font-semibold">{C.result}</h3>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <MoneyDisplay value={out.surplus} kind={kind} label={C.surplus} data-testid="finanzas-excedente" />
            <MoneyDisplay value={out.fund} kind={kind} label={C.fund} data-testid="finanzas-fondo" />
            <MoneyDisplay value={out.perParticipation} kind={kind} label={C.perParticipation} data-testid="finanzas-por-participacion" />
            <MoneyDisplay value={out.toExternal} kind={kind} label={C.toExternal} data-testid="finanzas-externos" />
            <MoneyDisplay value={out.companyTotal} kind={kind} label={C.companyTotal} data-testid="finanzas-empresa" />
            <MoneyDisplay value={out.roundingResidue} kind={kind} label={C.residue} data-testid="finanzas-residuo" />
          </div>
          <div className="flex flex-col gap-3 border-t border-border pt-6" data-testid="finanzas-grafica-reparto">
            <h3 className="font-heading text-lg font-semibold">{CHARTS.splitHeading}</h3>
            {out.toExternal.cents + out.companyTotal.cents > 0 ? (
              <AdminDonut
                ariaLabel={CHARTS.splitLabel}
                data-testid="finanzas-anillo-reparto"
                format={(v) => formatMoney(usd(v))}
                slices={[
                  { label: CHARTS.splitToExternal, value: out.toExternal.cents, color: 4 },
                  { label: CHARTS.splitToCompany, value: out.companyTotal.cents, color: 1 },
                ]}
              />
            ) : (
              <p className="text-sm text-muted-foreground" data-testid="finanzas-reparto-vacio">{CHARTS.splitNone}</p>
            )}
          </div>
          <div className="grid gap-5 border-t border-border pt-6 sm:grid-cols-2">
            <MoneyDisplay value={out.capital.external} kind="capital" label={C.capitalExternal} data-testid="finanzas-capital-externo" />
            <MoneyDisplay value={out.capital.company} kind="capital" label={C.capitalCompany} data-testid="finanzas-capital-empresa" />
          </div>
          <p className="text-xs text-muted-foreground">{C.capitalNote}</p>
        </div>
      )}

      <div className="flex flex-col gap-2 border-t border-border pt-6">
        <p className="text-sm text-muted-foreground"><strong className="text-foreground">{C.conciliation}. </strong>{C.conciliationText}</p>
        {view.basis === "realized" ? (
          <p className="text-sm font-medium" data-testid="finanzas-ya-liquidado">{C.alreadySettled}</p>
        ) : (
          <MockAction key={row.project.code} label={C.liquidate} doneMessage={C.liquidated} data-testid="finanzas-liquidar" />
        )}
      </div>
    </Surface>
  );
}
