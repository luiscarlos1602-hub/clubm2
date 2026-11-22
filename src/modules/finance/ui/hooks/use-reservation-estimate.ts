import { useMemo } from "react";
import type { Money } from "@/shared/domain/money";
import { estimateReservation, reservationAmount } from "../../domain/holding-projection";
import type { ProjectDetail } from "../../domain/project-detail";
import type { SimulationOutcome } from "../../domain/simulator";

export type ReservationEstimate = {
  /** Capital de la reserva: precio por participación × cantidad. */
  readonly amount: Money;
  readonly outcome: SimulationOutcome;
};

/** Estimación de una reserva con el motor [SUPUESTO P5-1]. La cuenta vive en el dominio; aquí solo se memoiza. */
export function useReservationEstimate(detail: ProjectDetail, quantity: number): ReservationEstimate {
  return useMemo(
    () => ({
      amount: reservationAmount(detail.listing.unitPrice, quantity),
      outcome: estimateReservation(detail.simulation.base, quantity).outcome,
    }),
    [detail, quantity],
  );
}
