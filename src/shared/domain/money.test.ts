import fc from "fast-check";
import { describe, expect, it } from "vitest";
import {
  MAX_MONEY_CENTS,
  ZERO_USD,
  addMoney,
  applyPercentageFloor,
  compareMoney,
  divideFloor,
  equalsMoney,
  isNegative,
  isPositive,
  isZero,
  multiplyMoney,
  parseUsdCents,
  subtractMoney,
  sumMoney,
  usd,
  usdUnits,
} from "./money";
import { percentage } from "./percentage";

const RUNS = { numRuns: 1000 };
const quarter = percentage(2500);

describe("money · constructores", () => {
  it("usdUnits(100) = 10.000 ¢", () => {
    expect(usdUnits(100)).toEqual({ cents: 10_000, currency: "USD" });
  });

  it("usd crea el literal en centavos", () => {
    expect(usd(1)).toEqual({ cents: 1, currency: "USD" });
    expect(ZERO_USD).toEqual({ cents: 0, currency: "USD" });
  });

  it("usd y usdUnits lanzan RangeError ante no enteros (SUPUESTO T1)", () => {
    expect(() => usd(1.5)).toThrow(RangeError);
    expect(() => usd(Number.NaN)).toThrow(RangeError);
    expect(() => usdUnits(0.5)).toThrow(RangeError);
    expect(() => usdUnits(Number.MAX_SAFE_INTEGER)).toThrow(RangeError);
  });

  it("MAX_MONEY_CENTS × 10.000 cabe en un entero seguro", () => {
    expect(MAX_MONEY_CENTS * 10_000).toBeLessThanOrEqual(Number.MAX_SAFE_INTEGER);
  });
});

describe("money · parseUsdCents", () => {
  it("acepta 0, enteros positivos, negativos y el techo", () => {
    expect(parseUsdCents(0)).toEqual({ ok: true, value: ZERO_USD });
    expect(parseUsdCents(10_000)).toEqual({ ok: true, value: usd(10_000) });
    expect(parseUsdCents(-500)).toEqual({ ok: true, value: usd(-500) });
    expect(parseUsdCents(MAX_MONEY_CENTS)).toEqual({ ok: true, value: usd(MAX_MONEY_CENTS) });
  });

  it.each([1.5, Number.NaN, "100", MAX_MONEY_CENTS + 1, -MAX_MONEY_CENTS - 1, Infinity, null, undefined, {}])(
    "rechaza %s",
    (value) => {
      const r = parseUsdCents(value);
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.error.code).toBe("INVALID_MONEY");
    },
  );
});

describe("money · aritmética", () => {
  it("sumMoney([]) = 0 y suma la lista", () => {
    expect(sumMoney([])).toEqual(ZERO_USD);
    expect(sumMoney([usd(1), usd(2), usd(3)])).toEqual(usd(6));
  });

  it("addMoney, subtractMoney (puede ser negativo) y multiplyMoney", () => {
    expect(addMoney(usd(150), usd(50))).toEqual(usd(200));
    expect(subtractMoney(usd(100), usd(250))).toEqual(usd(-150));
    expect(multiplyMoney(usd(10_000), 63)).toEqual(usd(630_000));
    expect(multiplyMoney(usd(10_000), 0)).toEqual(ZERO_USD);
  });

  it("multiplyMoney lanza RangeError con factor no entero", () => {
    expect(() => multiplyMoney(usd(100), 1.5)).toThrow(RangeError);
  });

  it("compareMoney, equalsMoney y predicados de signo", () => {
    expect(compareMoney(usd(1), usd(2))).toBe(-1);
    expect(compareMoney(usd(2), usd(2))).toBe(0);
    expect(compareMoney(usd(3), usd(2))).toBe(1);
    expect(equalsMoney(usd(7), usd(7))).toBe(true);
    expect(equalsMoney(usd(7), usd(8))).toBe(false);
    expect(isPositive(usd(1))).toBe(true);
    expect(isPositive(ZERO_USD)).toBe(false);
    expect(isNegative(usd(-1))).toBe(true);
    expect(isNegative(ZERO_USD)).toBe(false);
    expect(isZero(ZERO_USD)).toBe(true);
    expect(isZero(usd(-0))).toBe(true);
    expect(isZero(usd(1))).toBe(false);
  });

  it("propiedad: addMoney y subtractMoney se invierten", () => {
    const amount = fc.integer({ min: -MAX_MONEY_CENTS, max: MAX_MONEY_CENTS });
    fc.assert(
      fc.property(amount, amount, (a, b) => equalsMoney(subtractMoney(addMoney(usd(a), usd(b)), usd(b)), usd(a))),
      RUNS,
    );
  });
});

describe("money · redondeo (únicos puntos del proyecto)", () => {
  it("applyPercentageFloor(1 ¢, 25 %) = 0 ¢", () => {
    expect(applyPercentageFloor(usd(1), quarter)).toEqual(ZERO_USD);
  });

  it("applyPercentageFloor(900.004 ¢, 25 %) = 225.001 ¢", () => {
    expect(applyPercentageFloor(usd(900_004), quarter)).toEqual(usd(225_001));
  });

  it("applyPercentageFloor con 0 % y 100 %", () => {
    expect(applyPercentageFloor(usd(12_345), percentage(0))).toEqual(ZERO_USD);
    expect(applyPercentageFloor(usd(12_345), percentage(10_000))).toEqual(usd(12_345));
  });

  it("applyPercentageFloor en el techo no pierde precisión", () => {
    expect(applyPercentageFloor(usd(MAX_MONEY_CENTS), quarter)).toEqual(usd(225_000_000_000));
    expect(applyPercentageFloor(usd(MAX_MONEY_CENTS - 1), percentage(9_999))).toEqual(
      usd(Math.floor(((MAX_MONEY_CENTS - 1) * 9_999) / 10_000)),
    );
  });

  it("propiedad: applyPercentageFloor es el floor exacto", () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: MAX_MONEY_CENTS }), fc.integer({ min: 0, max: 10_000 }), (c, bps) => {
        const r = applyPercentageFloor(usd(c), percentage(bps)).cents;
        return r * 10_000 <= c * bps && c * bps < (r + 1) * 10_000;
      }),
      RUNS,
    );
  });

  it("divideFloor(225.001 ¢, 100) = { 2.250 ¢, 1 ¢ }", () => {
    expect(divideFloor(usd(225_001), 100)).toEqual({ quotient: usd(2_250), remainder: usd(1) });
  });

  it("divideFloor lanza RangeError con divisor inválido", () => {
    expect(() => divideFloor(usd(100), 0)).toThrow(RangeError);
    expect(() => divideFloor(usd(100), 1.5)).toThrow(RangeError);
  });

  it("propiedad: divideFloor cumple q × d + r = m y 0 ≤ r < d", () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: MAX_MONEY_CENTS }), fc.integer({ min: 1, max: 1_000_000 }), (c, d) => {
        const { quotient, remainder } = divideFloor(usd(c), d);
        return (
          quotient.cents * d + remainder.cents === c &&
          remainder.cents >= 0 &&
          remainder.cents < d &&
          Number.isSafeInteger(quotient.cents)
        );
      }),
      RUNS,
    );
  });
});
