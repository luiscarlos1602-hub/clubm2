"use client";

import { useState } from "react";
import { MoneyDisplay } from "@/shared/ui/brand";
import { Surface } from "@/shared/ui/layout";
import { usd } from "@/shared/domain/money";
import { formatMoney } from "@/shared/lib/format-money";
import { AdminDonut } from "@/shared/ui/admin";
import { Button } from "@/shared/ui/primitives/button";
import type { Distribution, LossDistribution } from "../../../domain/distribution";
import type { HolderPayout } from "../../../domain/holder-payout";
import { settlementView, type SettlementView } from "../../hooks/settlement-view";
import { useSettleProject } from "../../hooks/use-settle-project";
import { LossFigures } from "../investor/LossFigures";
import { FINANCE_ADMIN_COPY } from "./copy";
import type { FinanceRow } from "./use-admin-finance";

const C = FINANCE_ADMIN_COPY.settlement;
const CHARTS = FINANCE_ADMIN_COPY.charts;

type MoneyKind = "realized" | "projection";

function SplitChart({ external, company }: { external: { cents: number }; company: { cents: number } }) {
  return (
    <div className="flex flex-col gap-3 border-t border-border pt-6" data-testid="finanzas-grafica-reparto">
      <h3 className="font-heading text-lg font-semibold">{CHARTS.splitHeading}</h3>
      {external.cents + company.cents > 0 ? (
        <AdminDonut
          ariaLabel={CHARTS.splitLabel}
          data-testid="finanzas-anillo-reparto"
          format={(v) => formatMoney(usd(v))}
          slices={[
            { label: CHARTS.splitToExternal, value: external.cents, color: 4 },
            { label: CHARTS.splitToCompany, value: company.cents, color: 1 },
          ]}
        />
      ) : (
        <p className="text-sm text-muted-foreground" data-testid="finanzas-reparto-vacio">{CHARTS.splitNone}</p>
      )}
    </div>
  );
}

function GainResult({ out, kind }: { out: Distribution; kind: MoneyKind }) {
  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <MoneyDisplay value={out.surplus} kind={kind} label={C.surplus} data-testid="finanzas-excedente" />
        <MoneyDisplay value={out.fund} kind={kind} label={C.fund} data-testid="finanzas-fondo" />
        <MoneyDisplay value={out.perParticipation} kind={kind} label={C.perParticipation} data-testid="finanzas-por-participacion" />
        <MoneyDisplay value={out.toExternal} kind={kind} label={C.toExternal} data-testid="finanzas-externos" />
        <MoneyDisplay value={out.companyTotal} kind={kind} label={C.companyTotal} data-testid="finanzas-empresa" />
        <MoneyDisplay value={out.roundingResidue} kind={kind} label={C.residue} data-testid="finanzas-residuo" />
      </div>
      {out.surplus.cents === 0 ? <p className="text-sm text-muted-foreground" data-testid="finanzas-sin-reparto">{C.noDistribution}</p> : null}
      <SplitChart external={out.toExternal} company={out.companyTotal} />
      <div className="grid gap-5 border-t border-border pt-6 sm:grid-cols-2">
        <MoneyDisplay value={out.capital.external} kind="capital" label={C.capitalExternal} data-testid="finanzas-capital-externo" />
        <MoneyDisplay value={out.capital.company} kind="capital" label={C.capitalCompany} data-testid="finanzas-capital-empresa" />
      </div>
    </>
  );
}

function LossResult({ out, kind }: { out: LossDistribution; kind: MoneyKind }) {
  return (
    <>
      <h4 className="font-heading text-base font-semibold" data-testid="finanzas-resultado-perdida">{C.lossHeading}</h4>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <MoneyDisplay value={out.loss} kind={kind} label={C.lossTotal} data-testid="finanzas-perdida" />
        <MoneyDisplay value={out.externalLoss} kind={kind} label={C.lossExternal} data-testid="finanzas-perdida-externos" />
        <MoneyDisplay value={out.companyLoss} kind={kind} label={C.lossCompany} data-testid="finanzas-perdida-empresa" />
        <MoneyDisplay value={out.lossPerParticipation} kind={kind} label={C.lossPerParticipation} data-testid="finanzas-perdida-por-participacion" />
        <MoneyDisplay value={out.returned.external} kind={kind} label={C.returnedExternal} data-testid="finanzas-devuelto-externos" />
        <MoneyDisplay value={out.returned.company} kind={kind} label={C.returnedCompany} data-testid="finanzas-devuelto-empresa" />
      </div>
      <p className="text-sm text-muted-foreground">{C.lossNote}</p>
      <SplitChart external={out.externalLoss} company={out.companyLoss} />
      <div className="grid gap-5 border-t border-border pt-6 sm:grid-cols-2">
        <MoneyDisplay value={out.capital.external} kind="capital" label={C.capitalContributedExternal} data-testid="finanzas-capital-externo" />
        <MoneyDisplay value={out.capital.company} kind="capital" label={C.capitalContributedCompany} data-testid="finanzas-capital-empresa" />
      </div>
    </>
  );
}

/** CA7 · cobro de un titular con 1 participación: aportado · devuelto · ganancia o pérdida · cobro. */
function HolderSection({ payout, realized }: { payout: HolderPayout; realized: boolean }) {
  const kind = realized ? "realized" : "projection";
  return (
    <div className="flex flex-col gap-4 border-t border-border pt-6" data-testid="finanzas-por-titular">
      <div className="flex flex-wrap items-baseline gap-3">
        <h3 className="font-heading text-lg font-semibold">{realized ? C.holderHeading : C.holderPreviewHeading}</h3>
        {realized ? <span className="text-sm font-medium" data-testid="finanzas-titular-base">{C.holderTag}</span> : null}
      </div>
      {payout.result === "loss" ? (
        <LossFigures
          payout={payout}
          kind={kind}
          testIdPrefix="finanzas-titular"
          labels={{ capital: C.holderCapital, loss: C.holderLoss, returned: C.holderReturned }}
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-3">
          <MoneyDisplay value={payout.capital} kind="capital" label={C.holderCapital} data-testid="finanzas-titular-capital" />
          <MoneyDisplay value={payout.capitalReturned} kind={kind} label={C.holderReturned} data-testid="finanzas-titular-capital-devuelto" />
          <MoneyDisplay value={payout.gain} kind={kind} label={C.holderGain} data-testid="finanzas-titular-ganancia" />
        </div>
      )}
      <MoneyDisplay value={payout.total} kind={kind} label={C.holderTotal} data-testid="finanzas-titular-cobro" />
    </div>
  );
}

function SettleAction({ row }: { row: FinanceRow }) {
  const { settle, isPending } = useSettleProject();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const onSettle = async () => {
    setError(null);
    const result = await settle(row.project.id);
    if (result.ok) setDone(true);
    else setError(C.errors[result.error.code as keyof typeof C.errors] ?? C.errors.fallback);
  };
  return (
    <div className="flex flex-col gap-2">
      <Button type="button" className="self-start" disabled={isPending} onClick={() => void onSettle()} data-testid="finanzas-liquidar">
        {isPending ? C.liquidating : C.liquidate}
      </Button>
      {error ? <p role="alert" className="text-sm font-medium text-destructive" data-testid="finanzas-error">{error}</p> : null}
      {done ? <p role="status" className="text-sm text-muted-foreground" data-testid="finanzas-liquidar-confirmacion">{C.liquidated}</p> : null}
    </div>
  );
}

function tagOf(view: SettlementView): string {
  if (view.state === "settled") return C.realizedTag;
  return view.state === "sold" ? C.soldTag : C.projectionTag;
}

/** Resultado del motor para el proyecto elegido: realizado si ya está liquidado, vista previa si está vendido, proyección si no. */
export function SettlementPanel({ rows }: { rows: readonly FinanceRow[] }) {
  const options = rows.flatMap((r) => {
    const view = settlementView(r);
    return view ? [{ row: r, view }] : [];
  });
  const [code, setCode] = useState<string>(options[0]?.row.project.code ?? "");
  const current = options.find((o) => o.row.project.code === code) ?? options[0];
  if (!current) return null;
  const { view, row } = current;
  const kind: MoneyKind = view.basis === "realized" ? "realized" : "projection";
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
        <p className="text-sm font-medium" data-testid="finanzas-base">{tagOf(view)}</p>
      </div>

      <div role="group" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label={C.inputs}>
        <MoneyDisplay value={view.inputs.salePrice} kind={kind} label={C.salePrice} size="sm" />
        <MoneyDisplay value={view.inputs.acquisition} kind="capital" label={C.acquisition} size="sm" />
        <MoneyDisplay value={view.inputs.recovery} kind="capital" label={C.recovery} size="sm" />
        <MoneyDisplay value={view.inputs.saleCosts} kind={kind} label={C.saleCosts} size="sm" />
      </div>
      <p className="text-sm text-muted-foreground">{C.placed(view.placed, view.total)}</p>
      {view.state === "sold" ? <p className="text-sm font-medium" data-testid="finanzas-vista-previa">{C.previewNote}</p> : null}

      <div className="flex flex-col gap-6 border-t border-border pt-6" data-testid="finanzas-resultado">
        <h3 className="font-heading text-lg font-semibold">{C.result}</h3>
        {out.kind === "loss" ? <LossResult out={out} kind={kind} /> : <GainResult out={out} kind={kind} />}
        <p className="text-xs text-muted-foreground">{C.capitalNote}</p>
      </div>

      {view.state !== "projection" && view.perParticipation ? <HolderSection payout={view.perParticipation} realized={view.state === "settled"} /> : null}

      <div className="flex flex-col gap-2 border-t border-border pt-6">
        <p className="text-sm text-muted-foreground"><strong className="text-foreground">{C.conciliation}. </strong>{C.conciliationText}</p>
        {view.state === "settled" ? (
          <p className="text-sm font-medium" data-testid="finanzas-ya-liquidado">{C.alreadySettled}</p>
        ) : view.state === "sold" ? (
          <SettleAction key={row.project.code} row={row} />
        ) : null}
      </div>
    </Surface>
  );
}
