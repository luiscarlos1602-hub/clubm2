import { describe, expect, it } from "vitest";
import { WHEEL_THRESHOLDS_MONTHS } from "./classify-wheel";
import { TARGET_TERM_MONTHS } from "./target-term";

describe("TARGET_TERM_MONTHS", () => {
  it("es el objetivo de 3 meses del maestro §4 (proyección)", () => {
    expect(TARGET_TERM_MONTHS).toBe(3);
  });

  it("acompaña al umbral interno: si cambia el objetivo interno, cambia el público", () => {
    expect(TARGET_TERM_MONTHS).toBe(WHEEL_THRESHOLDS_MONTHS.good);
  });
});
