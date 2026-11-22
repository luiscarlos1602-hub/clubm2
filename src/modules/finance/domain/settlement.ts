import type { ProjectId } from "@/modules/projects";
import type { IsoDate } from "@/shared/domain/calendar-date";
import type { Id } from "@/shared/domain/id";
import { ok, type DomainError, type Result } from "@/shared/domain/result";
import {
  calculateDistribution,
  type DistributionInput,
  type DistributionOutcome,
  type DistributionInputErrorCode,
} from "./distribution";

export type SettlementId = Id<"Settlement">;

/** Solo una venta realizada se liquida: nunca una proyección. */
export type RealizedDistributionInput = DistributionInput & { readonly basis: "realized" };

/** Liquidación realizada de un proyecto: devolución de capitales + reparto del excedente o de la pérdida (ADR-019). */
export type Settlement = {
  readonly id: SettlementId;
  readonly projectId: ProjectId;
  readonly settledOn: IsoDate;
  readonly input: RealizedDistributionInput;
  /** Resultado de calculateDistribution(input) al liquidar. Es un hecho histórico: se guarda y seed-consistency.test.ts lo recalcula. */
  readonly distribution: DistributionOutcome;
};

export type SettlementErrorCode = DistributionInputErrorCode;

/**
 * Construye una liquidación con el motor único, con ganancia, en cero o con pérdida (espejo 25/75, ADR-019).
 * Sin prelación de cobro (ADR-019 §4). Los AuditEntry y el remanente (H3) quedan fuera. Nunca lanza.
 */
export function createSettlement(args: {
  readonly id: SettlementId;
  readonly projectId: ProjectId;
  readonly settledOn: IsoDate;
  readonly input: RealizedDistributionInput;
}): Result<Settlement, DomainError<SettlementErrorCode>> {
  const outcome = calculateDistribution(args.input);
  if (!outcome.ok) return outcome;
  return ok({
    id: args.id,
    projectId: args.projectId,
    settledOn: args.settledOn,
    input: args.input,
    distribution: outcome.value,
  });
}
