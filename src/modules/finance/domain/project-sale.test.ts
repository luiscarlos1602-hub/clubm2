import { describe, expect, it } from "vitest";
import type { ProjectId } from "@/modules/projects";
import { isoDate } from "@/shared/domain/calendar-date";
import { asId } from "@/shared/domain/id";
import { MAX_MONEY_CENTS, usd, usdUnits } from "@/shared/domain/money";
import { checkProjectSale, type ProjectSale } from "./project-sale";

const TODAY = isoDate("2026-11-22");
const SALE: ProjectSale = {
  projectId: asId("prj_test_01") as ProjectId,
  salePrice: usdUnits(47_000),
  saleCosts: usdUnits(1_000),
  signedOn: TODAY,
};

const codeOf = (sale: ProjectSale): string | null => {
  const r = checkProjectSale(sale, TODAY);
  return r.ok ? null : r.error.code;
};

describe("checkProjectSale (W-5, W5-2)", () => {
  it("venta válida firmada hoy → ok con la misma venta", () => {
    expect(checkProjectSale(SALE, TODAY)).toEqual({ ok: true, value: SALE });
  });

  it("fecha pasada y costos en 0 → ok", () => {
    expect(codeOf({ ...SALE, saleCosts: usd(0), signedOn: isoDate("2026-01-31") })).toBeNull();
  });

  it("costos iguales al precio → ok (P − O = 0)", () => {
    expect(codeOf({ ...SALE, saleCosts: SALE.salePrice })).toBeNull();
  });

  it.each([0, -1])("precio %s → NON_POSITIVE_SALE_PRICE", (cents) => {
    expect(codeOf({ ...SALE, salePrice: usd(cents) })).toBe("NON_POSITIVE_SALE_PRICE");
  });

  it("costos negativos → NEGATIVE_AMOUNT", () => {
    expect(codeOf({ ...SALE, saleCosts: usd(-1) })).toBe("NEGATIVE_AMOUNT");
  });

  it("montos sobre el techo o no enteros → AMOUNT_TOO_LARGE", () => {
    expect(codeOf({ ...SALE, salePrice: usd(MAX_MONEY_CENTS + 1) })).toBe("AMOUNT_TOO_LARGE");
    expect(codeOf({ ...SALE, saleCosts: { cents: 1.5, currency: "USD" } })).toBe("AMOUNT_TOO_LARGE");
  });

  it("W5-2 · costos mayores que el precio → SALE_COSTS_EXCEED_PRICE", () => {
    expect(codeOf({ ...SALE, saleCosts: usd(SALE.salePrice.cents + 1) })).toBe(
      "SALE_COSTS_EXCEED_PRICE",
    );
  });

  it("firma posterior a hoy → SALE_DATE_IN_FUTURE", () => {
    expect(codeOf({ ...SALE, signedOn: isoDate("2026-11-23") })).toBe("SALE_DATE_IN_FUTURE");
  });
});
