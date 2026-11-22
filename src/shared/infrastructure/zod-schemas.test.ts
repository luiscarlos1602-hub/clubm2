import { describe, expect, it } from "vitest";
import { idSchema, isoDateSchema, moneySchema } from "./zod-schemas";

describe("zod-schemas", () => {
  it("moneySchema acepta Money y rechaza decimales o moneda ajena", () => {
    expect(moneySchema.safeParse({ cents: 10000, currency: "USD" }).success).toBe(true);
    expect(moneySchema.safeParse({ cents: 1.5, currency: "USD" }).success).toBe(false);
    expect(moneySchema.safeParse({ cents: 100, currency: "EUR" }).success).toBe(false);
    expect(moneySchema.safeParse(100).success).toBe(false);
  });

  it("isoDateSchema valida fechas civiles", () => {
    expect(isoDateSchema.safeParse("2028-02-29").success).toBe(true);
    expect(isoDateSchema.safeParse("2027-02-29").success).toBe(false);
    expect(isoDateSchema.safeParse(20270101).success).toBe(false);
  });

  it("idSchema valida el formato de ids", () => {
    const s = idSchema<"Project">();
    expect(s.safeParse("prj_chacao_01").success).toBe(true);
    expect(s.safeParse("Prj-1").success).toBe(false);
  });
});
