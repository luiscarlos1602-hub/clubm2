import { describe, expect, it } from "vitest";
import { usd, usdUnits } from "@/shared/domain/money";
import { calculateProfitRate, calculateRecoveryRate } from "./profit-rate";

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

describe("calculateRecoveryRate (ADR-019: % del aporte que se recupera)", () => {
  it("C5 · 97,50 devueltos sobre 100 aportados = 97,5 %", () => {
    expect(calculateRecoveryRate(usd(9_750), usdUnits(100))).toEqual({ ok: true, value: { bps: 9750 } });
  });
  it("C8 · tope: 0 devuelto = 0 %", () => {
    expect(calculateRecoveryRate(usd(0), usdUnits(100))).toEqual({ ok: true, value: { bps: 0 } });
  });
  it("C10 · aporte completo = 100 %", () => {
    expect(calculateRecoveryRate(usdUnits(100), usdUnits(100))).toEqual({ ok: true, value: { bps: 10_000 } });
  });
  it("redondea hacia abajo al punto básico", () => {
    expect(calculateRecoveryRate(usd(2), usd(3))).toEqual({ ok: true, value: { bps: 6666 } });
  });
  it("capital cero → CAPITAL_NOT_POSITIVE; devolución negativa → NEGATIVE_RETURN (sin lanzar)", () => {
    const zero = calculateRecoveryRate(usd(0), usd(0));
    expect(zero.ok ? null : zero.error.code).toBe("CAPITAL_NOT_POSITIVE");
    const negative = calculateRecoveryRate(usd(-1), usdUnits(100));
    expect(negative.ok ? null : negative.error.code).toBe("NEGATIVE_RETURN");
  });
});
