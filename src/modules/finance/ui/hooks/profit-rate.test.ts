import { describe, expect, it } from "vitest";
import { usd, usdUnits } from "@/shared/domain/money";
import { profitRateLabel, recoveryRateLabel } from "./profit-rate";

describe("profitRateLabel", () => {
  it("formatea el % del motor con un solo texto", () => {
    expect(profitRateLabel(usdUnits(25), usdUnits(100))).toBe("25 % sobre el capital");
    expect(profitRateLabel(usd(2_250), usd(10_000))).toBe("22,5 % sobre el capital");
  });
  it("sin ganancia no hay texto", () => {
    expect(profitRateLabel(null, usdUnits(100))).toBeNull();
  });
  it("si el % no puede calcularse (capital 0, ganancia negativa) dice «% por definir»; nunca omite ni sale negativo", () => {
    expect(profitRateLabel(usdUnits(25), usd(0))).toBe("% por definir");
    expect(profitRateLabel(usd(-1), usdUnits(100))).toBe("% por definir");
  });
});

describe("recoveryRateLabel", () => {
  it("expresa la pérdida como % del aporte recuperado, sin signo negativo (C5: 97,5 %)", () => {
    expect(recoveryRateLabel(usd(9_750), usd(10_000))).toBe("97,5 % del aporte recuperado");
    expect(recoveryRateLabel(usdUnits(95), usdUnits(100))).toBe("95 % del aporte recuperado");
  });
  it("sin devolución, 0 %; con capital 0 no se inventa un %", () => {
    expect(recoveryRateLabel(usd(0), usdUnits(100))).toBe("0 % del aporte recuperado");
    expect(recoveryRateLabel(usd(0), usd(0))).toBe("% de recuperación por definir");
  });
});
