import { describe, expect, it } from "vitest";
import { isoDate, type IsoDate } from "@/shared/domain/calendar-date";
import { asId } from "@/shared/domain/id";
import { WHEEL_THRESHOLDS_MONTHS, classifyProjectWheel, classifyWheel } from "./classify-wheel";
import type { Project, ProjectCode, ProjectTimeline } from "./project";

const d = (raw: string): IsoDate => isoDate(raw);
const ACQUIRED = d("2026-01-15");
const TODAY = d("2026-12-01");

function project(timeline: ProjectTimeline): Project {
  return {
    id: asId<"Project">("prj_chacao_01"),
    code: "M2-001" as ProjectCode,
    slug: "apartamento-chacao",
    name: "Apartamento en Chacao",
    propertyId: asId<"Property">("prp_chacao_01"),
    status: timeline.settledOn ? "settled" : timeline.saleSignedOn ? "sold" : "on_sale",
    timeline,
  };
}

describe("classifyWheel", () => {
  it("umbrales: 3 y 6 meses", () => {
    expect(WHEEL_THRESHOLDS_MONTHS).toEqual({ good: 3, medium: 6 });
  });

  it("K2 · venta a los 3 meses exactos (15-abr) → buena", () => {
    expect(classifyWheel({ acquiredOn: ACQUIRED, saleSignedOn: d("2026-04-15") }, TODAY)).toEqual({
      ok: true,
      value: { wheel: "good", sold: true, measuredFrom: "2026-01-15", measuredUntil: "2026-04-15" },
    });
  });

  it("K2 · venta a 3 meses + 1 día (16-abr) → media", () => {
    expect(classifyWheel({ acquiredOn: ACQUIRED, saleSignedOn: d("2026-04-16") }, TODAY)).toEqual({
      ok: true,
      value: {
        wheel: "medium",
        sold: true,
        measuredFrom: "2026-01-15",
        measuredUntil: "2026-04-16",
      },
    });
  });

  it("K2 · venta a los 6 meses exactos (15-jul) → media", () => {
    const result = classifyWheel({ acquiredOn: ACQUIRED, saleSignedOn: d("2026-07-15") }, TODAY);
    expect(result.ok && result.value.wheel).toBe("medium");
  });

  it("K3 · venta a 6 meses + 1 día (16-jul) → mala (vendida)", () => {
    expect(classifyWheel({ acquiredOn: ACQUIRED, saleSignedOn: d("2026-07-16") }, TODAY)).toEqual({
      ok: true,
      value: { wheel: "bad", sold: true, measuredFrom: "2026-01-15", measuredUntil: "2026-07-16" },
    });
  });

  it("Ruedas · venta el mismo día de la compra → buena", () => {
    const result = classifyWheel({ acquiredOn: ACQUIRED, saleSignedOn: ACQUIRED }, ACQUIRED);
    expect(result.ok && result.value.wheel).toBe("good");
  });

  it("Ruedas · sin venta y hoy = 15-jul → en curso", () => {
    expect(classifyWheel({ acquiredOn: ACQUIRED, saleSignedOn: null }, d("2026-07-15"))).toEqual({
      ok: true,
      value: {
        wheel: "in_progress",
        sold: false,
        measuredFrom: "2026-01-15",
        measuredUntil: "2026-07-15",
      },
    });
  });

  it("Ruedas · sin venta y hoy = 16-jul → mala", () => {
    expect(classifyWheel({ acquiredOn: ACQUIRED, saleSignedOn: null }, d("2026-07-16"))).toEqual({
      ok: true,
      value: { wheel: "bad", sold: false, measuredFrom: "2026-01-15", measuredUntil: "2026-07-16" },
    });
  });

  it("Ruedas · sin venta y hoy = día de compra → en curso", () => {
    const result = classifyWheel({ acquiredOn: ACQUIRED, saleSignedOn: null }, ACQUIRED);
    expect(result.ok && result.value.wheel).toBe("in_progress");
  });

  it("K2 · fin de mes: compra 31-ago-2026, 6 meses = 28-feb-2027", () => {
    const acquiredOn = d("2026-08-31");
    const onLimit = classifyWheel({ acquiredOn, saleSignedOn: d("2027-02-28") }, d("2027-03-15"));
    const pastLimit = classifyWheel({ acquiredOn, saleSignedOn: d("2027-03-01") }, d("2027-03-15"));
    expect(onLimit.ok && onLimit.value.wheel).toBe("medium");
    expect(pastLimit.ok && pastLimit.value.wheel).toBe("bad");
    const unsold = classifyWheel({ acquiredOn, saleSignedOn: null }, d("2027-02-28"));
    expect(unsold.ok && unsold.value.wheel).toBe("in_progress");
  });

  describe("errores", () => {
    it("venta antes de compra → SALE_BEFORE_ACQUISITION", () => {
      const result = classifyWheel({ acquiredOn: ACQUIRED, saleSignedOn: d("2026-01-14") }, TODAY);
      expect(!result.ok && result.error.code).toBe("SALE_BEFORE_ACQUISITION");
    });
    it("hoy antes de compra → TODAY_BEFORE_ACQUISITION", () => {
      const result = classifyWheel({ acquiredOn: ACQUIRED, saleSignedOn: null }, d("2026-01-14"));
      expect(!result.ok && result.error.code).toBe("TODAY_BEFORE_ACQUISITION");
    });
    it("venta posterior a hoy → SALE_AFTER_TODAY", () => {
      const result = classifyWheel(
        { acquiredOn: ACQUIRED, saleSignedOn: d("2026-04-01") },
        d("2026-03-31"),
      );
      expect(!result.ok && result.error.code).toBe("SALE_AFTER_TODAY");
    });
  });
});

describe("classifyProjectWheel", () => {
  it("K4 · la liquidación posterior no cambia la rueda", () => {
    const sold: ProjectTimeline = {
      acquiredOn: ACQUIRED,
      saleSignedOn: d("2026-04-15"),
      settledOn: null,
    };
    const settledSoon = classifyProjectWheel(
      project({ ...sold, settledOn: d("2026-04-20") }),
      TODAY,
    );
    const settledLate = classifyProjectWheel(
      project({ ...sold, settledOn: d("2026-11-30") }),
      TODAY,
    );
    const unsettled = classifyProjectWheel(project(sold), TODAY);
    expect(settledSoon).toEqual(unsettled);
    expect(settledLate).toEqual(unsettled);
    expect(unsettled.ok && unsettled.value).toEqual({
      wheel: "good",
      sold: true,
      measuredFrom: "2026-01-15",
      measuredUntil: "2026-04-15",
    });
  });

  it("proyecto sin acquiredOn → NOT_ACQUIRED", () => {
    const result = classifyProjectWheel(
      project({ acquiredOn: null, saleSignedOn: null, settledOn: null }),
      TODAY,
    );
    expect(!result.ok && result.error.code).toBe("NOT_ACQUIRED");
  });

  it("propaga los errores de classifyWheel", () => {
    const result = classifyProjectWheel(
      project({ acquiredOn: ACQUIRED, saleSignedOn: null, settledOn: null }),
      d("2026-01-01"),
    );
    expect(!result.ok && result.error.code).toBe("TODAY_BEFORE_ACQUISITION");
  });
});
