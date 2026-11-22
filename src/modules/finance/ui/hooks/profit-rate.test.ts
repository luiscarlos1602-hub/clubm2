import { describe, expect, it } from "vitest";
import { usd, usdUnits } from "@/shared/domain/money";
import { profitRateLabel } from "./profit-rate";

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
