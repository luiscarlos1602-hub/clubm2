// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { usd } from "@/shared/domain/money";
import { calculateDistribution } from "../../../domain/distribution";
import { calculateHolderPayout } from "../../../domain/holder-payout";
import type { SimulationResult } from "../../../domain/simulator";
import { SimulatorResultPanel } from "./SimulatorResultPanel";

afterEach(cleanup);

function lossResult(): SimulationResult {
  const d = calculateDistribution({
    basis: "projection",
    salePrice: usd(1_900_000),
    acquisitionCost: usd(1_000_000),
    recoveryBudget: usd(1_000_000),
    saleCosts: usd(0),
    participations: { total: 100, placed: 100, unitPrice: usd(10_000) },
  });
  if (!d.ok || d.value.kind !== "loss") throw new Error("se esperaba pérdida");
  const p = calculateHolderPayout(d.value, 2);
  if (!p.ok) throw new Error(p.error.code);
  return {
    basis: "projection",
    salePrice: usd(1_900_000),
    worksOverrun: usd(0),
    recoveryBudget: usd(1_000_000),
    termMonths: 6,
    heldUsed: 2,
    outcome: { kind: "loss", distribution: d.value, payout: p.value },
  } as SimulationResult;
}

describe("SimulatorResultPanel · pérdida", () => {
  it("muestra capital, pérdida proyectada y capital devuelto como montos, con % de recuperación", () => {
    render(<SimulatorResultPanel result={lossResult()} requestedHeld={2} />);
    expect(screen.getByTestId("simulador-sin-reparto")).toBeTruthy();
    expect(screen.getByTestId("simulador-capital").textContent).toContain("200");
    expect(screen.getByTestId("simulador-perdida").textContent).toMatch(/USD\s5(?!\d)/);
    expect(screen.getByTestId("simulador-capital-devuelto").textContent).toMatch(/USD\s195(?!\d)/);
    expect(screen.getByTestId("simulador-recuperacion").textContent).toBe("97,5 % del aporte recuperado");
    expect(screen.getByTestId("simulador-perdida").textContent).toContain("Proyección");
    expect(screen.queryByTestId("simulador-ganancia")).toBeNull();
    expect(screen.getByTestId("simulador-resultado").textContent).not.toMatch(/−|sobre el capital/);
  });
});
