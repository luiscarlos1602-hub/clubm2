// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import type { IsoDate } from "@/shared/domain/calendar-date";
import { asId } from "@/shared/domain/id";
import { usd } from "@/shared/domain/money";
import { calculateHolderPayout } from "../../../domain/holder-payout";
import { createSettlement, type RealizedDistributionInput, type Settlement } from "../../../domain/settlement";
import { RealizedResult } from "./RealizedResult";

afterEach(cleanup);

/** Precio por participación 100 USD, total 100, C = F = 10.000 USD. */
function settlementFor(salePrice: number): Settlement {
  const input: RealizedDistributionInput = {
    basis: "realized",
    salePrice: usd(salePrice),
    acquisitionCost: usd(1_000_000),
    recoveryBudget: usd(1_000_000),
    saleCosts: usd(0),
    participations: { total: 100, placed: 100, unitPrice: usd(10_000) },
  };
  const r = createSettlement({ id: asId("stl_test_01"), projectId: asId("prj_test_01"), settledOn: "2026-11-22" as IsoDate, input });
  if (!r.ok) throw new Error(r.error.code);
  return r.value;
}

function renderRealized(salePrice: number) {
  const settlement = settlementFor(salePrice);
  const payout = calculateHolderPayout(settlement.distribution, 1);
  if (!payout.ok) throw new Error(payout.error.code);
  render(<RealizedResult realized={payout.value} settlement={settlement} />);
}

describe("RealizedResult", () => {
  it("con pérdida (C5): capital devuelto 97,50 y pérdida realizada 2,50, sin signo negativo ni % de ganancia", () => {
    renderRealized(1_900_000);
    expect(screen.getByTestId("realizado-capital-devuelto").textContent).toContain("97,50");
    expect(screen.getByTestId("realizado-perdida").textContent).toContain("2,50");
    expect(screen.getByTestId("realizado-recuperacion").textContent).toBe("97,5 % del aporte recuperado");
    expect(screen.getAllByTestId("realizado-capital")).toHaveLength(1);
    expect(screen.queryByTestId("realizado-ganancia")).toBeNull();
    const text = screen.getByTestId("seccion-resultado-realizado").textContent ?? "";
    expect(text).not.toMatch(/−|-\s?USD|USD\s?-|sobre el capital/);
  });

  it("con ganancia mantiene la ganancia realizada con su %", () => {
    renderRealized(4_000_000);
    expect(screen.getByTestId("realizado-ganancia").textContent).toContain("sobre el capital");
    expect(screen.queryByTestId("realizado-perdida")).toBeNull();
  });

  it("con excedente 0 muestra ganancia 0, no pérdida", () => {
    renderRealized(2_000_000);
    expect(screen.getByTestId("realizado-ganancia").textContent).toContain("0");
    expect(screen.queryByTestId("realizado-perdida")).toBeNull();
  });
});
