import type { ProjectId } from "@/modules/projects";
import type { IsoDate } from "@/shared/domain/calendar-date";
import type { Id } from "@/shared/domain/id";
import { err, ok, type DomainError, type Result } from "@/shared/domain/result";
import {
  calculateDistribution,
  type Distribution,
  type DistributionInput,
  type DistributionInputErrorCode,
} from "./distribution";

export type SettlementId = Id<"Settlement">;

/** Solo una venta realizada se liquida: nunca una proyección. */
export type RealizedDistributionInput = DistributionInput & { readonly basis: "realized" };

/** Liquidación realizada de un proyecto: devolución de capitales + reparto del excedente. */
export type Settlement = {
  readonly id: SettlementId;
  readonly projectId: ProjectId;
  readonly settledOn: IsoDate;
  readonly input: RealizedDistributionInput;
  /** Resultado de calculateDistribution(input) al liquidar. Es un hecho histórico: se guarda y seed-consistency.test.ts lo recalcula. */
  readonly distribution: Distribution;
};

export type SettlementErrorCode = DistributionInputErrorCode | "LOSS_POLICY_UNDEFINED";

/**
 * Construye una liquidación con el motor único. Excedente ≤ 0 → LOSS_POLICY_UNDEFINED (H2 por definir).
 * El orden de cobro (H1), los AuditEntry y el remanente (H3) son de B5. Nunca lanza.
 */
export function createSettlement(args: {
  readonly id: SettlementId;
  readonly projectId: ProjectId;
  readonly settledOn: IsoDate;
  readonly input: RealizedDistributionInput;
}): Result<Settlement, DomainError<SettlementErrorCode>> {
  const outcome = calculateDistribution(args.input);
  if (!outcome.ok) return outcome;
  if (outcome.value.kind === "no_distribution") {
    return err(
      "LOSS_POLICY_UNDEFINED",
      "excedente ≤ 0: la política de pérdidas está por definir (H2), no se liquida",
    );
  }
  return ok({
    id: args.id,
    projectId: args.projectId,
    settledOn: args.settledOn,
    input: args.input,
    distribution: outcome.value,
  });
}
