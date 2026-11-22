import { describe, expect, it } from "vitest";
import { usd, usdUnits } from "@/shared/domain/money";
import { calculateProfitRate } from "./profit-rate";

describe("calculateProfitRate (ADR-013)", () => {
  it("C1 · 50 de ganancia sobre 100 de capital = 50 %", () => {
    const r = calculateProfitRate(usdUnits(50), usdUnits(100));
    expect(r).toEqual({ ok: true, value: { bps: 5000 } });
  });
  it("M2-003 · 17.250 ¢ sobre 50.000 ¢ = 34,5 %", () => {
    expect(calculateProfitRate(usd(17_250), usd(50_000))).toEqual({ ok: true, value: { bps: 3450 } });
  });
  it("redondea hacia abajo al punto básico", () => {
    expect(calculateProfitRate(usd(1), usd(3))).toEqual({ ok: true, value: { bps: 3333 } });
  });
  it("ganancia cero = 0 %", () => {
    expect(calculateProfitRate(usd(0), usdUnits(100))).toEqual({ ok: true, value: { bps: 0 } });
  });
  it("capital cero o negativo → error", () => {
    expect(calculateProfitRate(usdUnits(1), usd(0)).ok).toBe(false);
  });
  it("ganancia negativa no se expresa como %", () => {
    const r = calculateProfitRate(usd(-1), usdUnits(100));
    expect(r.ok).toBe(false);
  });
});
