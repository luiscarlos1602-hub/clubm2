import { describe, expect, it } from "vitest";
import {
  BPS_PER_WHOLE,
  PERCENT_0,
  PERCENT_100,
  complementPercentage,
  parsePercentage,
  percentage,
} from "./percentage";

describe("percentage", () => {
  it("BPS_PER_WHOLE es 10.000 y las constantes son 0 y 10.000 pb", () => {
    expect(BPS_PER_WHOLE).toBe(10_000);
    expect(PERCENT_0.bps).toBe(0);
    expect(PERCENT_100.bps).toBe(10_000);
  });

  it("parsePercentage acepta 0 y 10.000", () => {
    expect(parsePercentage(0)).toEqual({ ok: true, value: { bps: 0 } });
    expect(parsePercentage(10_000)).toEqual({ ok: true, value: { bps: 10_000 } });
  });

  it.each([-1, 10_001, 25.5, Number.NaN, "2500", null, undefined])(
    "parsePercentage rechaza %s",
    (value) => {
      const r = parsePercentage(value);
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.error.code).toBe("INVALID_PERCENTAGE");
    },
  );

  it("complementPercentage(2500) = 7500", () => {
    expect(complementPercentage(percentage(2500))).toEqual({ bps: 7500 });
  });

  it("percentage lanza RangeError ante un valor no entero (SUPUESTO T1)", () => {
    expect(() => percentage(25.5)).toThrow(RangeError);
    expect(() => percentage(Number.NaN)).toThrow(RangeError);
  });
});
