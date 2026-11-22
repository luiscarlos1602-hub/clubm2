import { MoneyDisplay } from "@/shared/ui/brand";
import type { HolderPayout } from "../../../domain/holder-payout";
import { recoveryRateLabel } from "../../hooks/profit-rate";

export type LossFiguresLabels = { readonly capital: string; readonly loss: string; readonly returned: string };

export type LossFiguresProps = {
  payout: HolderPayout;
  /** projection: cifras futuras (rótulo de proyección); realized: hechos de una liquidación. */
  kind: "projection" | "realized";
  labels: LossFiguresLabels;
  /** Prefijo de los data-testid: `${testIdPrefix}-capital`, `-perdida`, `-capital-devuelto`, `-recuperacion`. */
  testIdPrefix: string;
  size?: "sm" | "md" | "lg";
  /** false si el capital ya se muestra aparte en la misma vista (evita testid duplicado). */
  showCapital?: boolean;
};

/** Pérdida (ADR-019): capital aportado, pérdida y capital devuelto como montos sin signo, y el % de recuperación del motor.
 *  Nunca se llama "ganancia" ni se expresa como % negativo. */
export function LossFigures({ payout, kind, labels, testIdPrefix, size = "md", showCapital = true }: LossFiguresProps) {
  const moneyKind = kind === "projection" ? "projection" : "amount";
  return (
    <div className="flex flex-col gap-4" data-kind={kind}>
      {showCapital ? <MoneyDisplay value={payout.capital} kind="capital" label={labels.capital} size={size} data-testid={`${testIdPrefix}-capital`} /> : null}
      <MoneyDisplay value={payout.loss} kind={moneyKind} label={labels.loss} size="md" data-testid={`${testIdPrefix}-perdida`} />
      <div className="flex flex-col gap-1">
        <MoneyDisplay value={payout.capitalReturned} kind={moneyKind} label={labels.returned} size="md" data-testid={`${testIdPrefix}-capital-devuelto`} />
        <span className="font-mono text-sm text-muted-foreground" data-testid={`${testIdPrefix}-recuperacion`}>
          {recoveryRateLabel(payout.capitalReturned, payout.capital)}
        </span>
      </div>
    </div>
  );
}
