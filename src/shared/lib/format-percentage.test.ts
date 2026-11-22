import { describe, expect, it } from "vitest";
import { percentage } from "@/shared/domain/percentage";
import { formatPercentage, percentageToCss } from "./format-percentage";

describe("formatPercentage", () => {
  it.each([
    [2500, "25 %"],
    [7500, "75 %"],
    [0, "0 %"],
    [10_000, "100 %"],
    [2250, "22,5 %"],
    [1234, "12,34 %"],
    [5, "0,05 %"],
    [-50, "-0,5 %"],
    [-250, "-2,5 %"],
  ])("%i pb → %s", (bps, expected) => {
    expect(formatPercentage(percentage(bps))).toBe(expected);
  });
});

describe("percentageToCss", () => {
  it("convierte pb a ancho CSS", () => {
    expect(percentageToCss(percentage(2500))).toBe("25%");
    expect(percentageToCss(percentage(2250))).toBe("22.5%");
  });
  it("rechaza fuera de 0..10000", () => {
    expect(() => percentageToCss(percentage(-1))).toThrow(RangeError);
    expect(() => percentageToCss(percentage(10_001))).toThrow(RangeError);
  });
});
