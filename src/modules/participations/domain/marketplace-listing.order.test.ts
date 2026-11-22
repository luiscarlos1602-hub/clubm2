import { describe, expect, it } from "vitest";
import type { ProjectCode, ProjectStatus } from "@/modules/projects";
import { isoDate } from "@/shared/domain/calendar-date";
import { asId } from "@/shared/domain/id";
import { usdUnits } from "@/shared/domain/money";
import { buildMarketplaceListing, type MarketplaceSource } from "./marketplace-listing";

/** [código, estado, fecha de compra, colocadas]. */
type Row = readonly [string, ProjectStatus, string, number?];

function sourceOf(rows: readonly Row[]): MarketplaceSource {
  return {
    projects: rows.map(([n, status, acquired]) => ({
      id: asId(`prj_o_${n}`),
      code: `M2-${n}` as ProjectCode,
      slug: `m2-${n}`,
      name: `Proyecto ${n}`,
      propertyId: asId(`ppt_o_${n}`),
      status,
      timeline: {
        acquiredOn: isoDate(acquired),
        saleSignedOn: null,
        settledOn: status === "settled" ? isoDate("2026-11-01") : null,
      },
    })),
    properties: rows.map(([n]) => ({
      id: asId(`ppt_o_${n}`),
      city: "Caracas",
      zone: "Chacao",
      kind: "apartment" as const,
      areaM2: 80,
    })),
    classes: rows.map(([n, , , placed = 100]) => ({
      id: asId(`pcl_o_${n}`),
      projectId: asId(`prj_o_${n}`),
      total: 100,
      placed,
      unitPrice: usdUnits(100),
    })),
  };
}

describe("buildMarketplaceListing · orden P3-2", () => {
  it("por rango de fase, luego acquiredOn descendente, luego code ascendente", () => {
    const rows: readonly Row[] = [
      ["001", "settled", "2025-01-01"],
      ["003", "settled", "2025-03-01"],
      ["009", "sold", "2025-02-01"],
      ["002", "stalled", "2026-02-01"],
      ["011", "on_sale", "2026-06-01"],
      ["004", "on_sale", "2026-06-01"],
      ["005", "renovation", "2026-08-01"],
      ["008", "funding", "2026-11-01", 100],
      ["006", "funding", "2026-10-01", 63],
    ];
    const codes = buildMarketplaceListing(sourceOf(rows)).map((l) => l.code);
    expect(codes).toEqual([
      "M2-006",
      "M2-008",
      "M2-005",
      "M2-004",
      "M2-011",
      "M2-002",
      "M2-009",
      "M2-003",
      "M2-001",
    ]);
  });

  it("no depende del orden de entrada", () => {
    const rows: readonly Row[] = [
      ["004", "on_sale", "2026-06-01"],
      ["006", "funding", "2026-10-01", 63],
      ["001", "settled", "2025-01-01"],
    ];
    const forward = buildMarketplaceListing(sourceOf(rows)).map((l) => l.code);
    const backward = buildMarketplaceListing(sourceOf([...rows].reverse())).map((l) => l.code);
    expect(forward).toEqual(["M2-006", "M2-004", "M2-001"]);
    expect(backward).toEqual(forward);
  });
});
