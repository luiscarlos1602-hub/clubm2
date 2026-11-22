import { describe, expect, it } from "vitest";
import { usd, usdUnits } from "@/shared/domain/money";
import { estimateReservation, projectHoldingGain, reservationAmount } from "./holding-projection";
import type { SimulationBase, SimulationResult } from "./simulator";

// M2-006: 63 de 100 colocadas, 37 disponibles.
const M2_006: SimulationBase = {
  salePrice: usdUnits(76_000),
  acquisitionCost: usdUnits(50_000),
  recoveryBudget: usdUnits(10_000),
  saleCosts: usdUnits(2_280),
  total: 100,
  unitPrice: usdUnits(100),
  placed: 63,
  targetTermMonths: 3,
};

function placedOf(r: SimulationResult): number {
  if (r.outcome.kind !== "payout") throw new Error(`se esperaba payout y llegó ${r.outcome.kind}`);
  return r.outcome.distribution.participations.placed;
}

describe("estimateReservation [SUPUESTO P5-1: la reserva se suma a lo colocado]", () => {
  it("con 1, la colocación pasa a 64 y reparte", () => {
    const r = estimateReservation(M2_006, 1);
    expect(r.heldUsed).toBe(1);
    expect(placedOf(r)).toBe(64);
    if (r.outcome.kind === "payout") expect(r.outcome.payout.gain).toEqual(usd(3_430));
  });

  it("con 37 llega a 100; con 42 se queda en 100 (tope)", () => {
    expect(placedOf(estimateReservation(M2_006, 37))).toBe(100);
    const over = estimateReservation(M2_006, 42);
    expect(placedOf(over)).toBe(100);
  });

  it("más colocadas suben lo que va a los externos", () => {
    const one = estimateReservation(M2_006, 1);
    const full = estimateReservation(M2_006, 37);
    if (one.outcome.kind !== "payout" || full.outcome.kind !== "payout")
      throw new Error("se esperaba reparto");
    expect(full.outcome.distribution.toExternal.cents).toBeGreaterThan(
      one.outcome.distribution.toExternal.cents,
    );
  });

  it("excedente negativo → loss con la devolución calculada (ADR-019)", () => {
    const r = estimateReservation({ ...M2_006, salePrice: usdUnits(10_000) }, 1);
    expect(r.outcome.kind).toBe("loss");
    if (r.outcome.kind === "loss") expect(r.outcome.payout.gain).toEqual(usd(0));
  });
});

describe("reservationAmount y projectHoldingGain", () => {
  it("reservationAmount(100, 3) = 300", () => {
    expect(reservationAmount(usdUnits(100), 3)).toEqual(usdUnits(300));
  });

  it("projectHoldingGain(base, 2) = 2 × USD 34,30", () => {
    expect(projectHoldingGain(M2_006, 2)).toEqual(usd(6_860));
  });

  it("en pérdida → null (el portafolio con pérdida es de W-6); tenencia mayor que la colocación → null (no proyecta menos participaciones en silencio)", () => {
    expect(projectHoldingGain({ ...M2_006, salePrice: usdUnits(10_000) }, 1)).toBeNull();
    expect(projectHoldingGain({ ...M2_006, placed: 3 }, 5)).toBeNull();
    expect(projectHoldingGain({ ...M2_006, placed: 0 }, 1)).toBeNull();
  });
});
