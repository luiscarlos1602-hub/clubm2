import { describe, expect, it } from "vitest";
import { isoDate, type IsoDate } from "@/shared/domain/calendar-date";
import { asId } from "@/shared/domain/id";
import type { Project, ProjectCode, ProjectTimeline, Property } from "./project";
import { checkProjectConsistency, checkProperty } from "./project-consistency";
import type { ProjectStatus } from "./project-status";

const d = (raw: string): IsoDate => isoDate(raw);
const NONE: ProjectTimeline = { acquiredOn: null, saleSignedOn: null, settledOn: null };
const ACQ: ProjectTimeline = { ...NONE, acquiredOn: d("2026-01-15") };
const SOLD: ProjectTimeline = { ...ACQ, saleSignedOn: d("2026-04-10") };
const SETTLED: ProjectTimeline = { ...SOLD, settledOn: d("2026-05-02") };

function project(status: ProjectStatus, timeline: ProjectTimeline): Project {
  return {
    id: asId<"Project">("prj_chacao_01"),
    code: "M2-001" as ProjectCode,
    slug: "apartamento-chacao",
    name: "Apartamento en Chacao",
    propertyId: asId<"Property">("prp_chacao_01"),
    status,
    timeline,
  };
}

function expectInconsistent(p: Project): void {
  const result = checkProjectConsistency(p);
  expect(result.ok).toBe(false);
  if (!result.ok) expect(result.error.code).toBe("INCONSISTENT_TIMELINE");
}

describe("checkProjectConsistency", () => {
  describe("opportunity / due_diligence / discarded ⇒ sin acquiredOn", () => {
    it.each(["opportunity", "due_diligence", "discarded"] as const)(
      "%s sin fechas es válido",
      (status) => {
        const p = project(status, NONE);
        expect(checkProjectConsistency(p)).toEqual({ ok: true, value: p });
      },
    );
    it.each(["opportunity", "due_diligence", "discarded"] as const)(
      "%s con acquiredOn es inválido",
      (status) => {
        expectInconsistent(project(status, ACQ));
      },
    );
  });

  describe("acquired…on_sale y stalled ⇒ acquiredOn y sin saleSignedOn", () => {
    const statuses = ["acquired", "funding", "renovation", "on_sale", "stalled"] as const;
    it.each(statuses)("%s con acquiredOn es válido", (status) => {
      expect(checkProjectConsistency(project(status, ACQ)).ok).toBe(true);
    });
    it.each(statuses)("%s sin acquiredOn es inválido", (status) => {
      expectInconsistent(project(status, NONE));
    });
    it.each(statuses)("%s con saleSignedOn es inválido", (status) => {
      expectInconsistent(project(status, SOLD));
    });
  });

  describe("sold ⇒ compra y venta, sin liquidación", () => {
    it("sold con compra y venta es válido", () => {
      expect(checkProjectConsistency(project("sold", SOLD)).ok).toBe(true);
    });
    it("sold sin saleSignedOn es inválido", () => {
      expectInconsistent(project("sold", ACQ));
    });
    it("sold con settledOn es inválido", () => {
      expectInconsistent(project("sold", SETTLED));
    });
  });

  describe("settled ⇒ las tres fechas", () => {
    it("settled con las tres fechas es válido", () => {
      expect(checkProjectConsistency(project("settled", SETTLED)).ok).toBe(true);
    });
    it("settled sin settledOn es inválido", () => {
      expectInconsistent(project("settled", SOLD));
    });
  });

  describe("orden acquiredOn ≤ saleSignedOn ≤ settledOn", () => {
    it("fechas iguales son válidas", () => {
      const same = d("2026-01-15");
      expect(
        checkProjectConsistency(
          project("settled", { acquiredOn: same, saleSignedOn: same, settledOn: same }),
        ).ok,
      ).toBe(true);
    });
    it("venta antes de la compra es inválida", () => {
      expectInconsistent(project("sold", { ...ACQ, saleSignedOn: d("2026-01-14") }));
    });
    it("liquidación antes de la venta es inválida", () => {
      expectInconsistent(project("settled", { ...SOLD, settledOn: d("2026-04-09") }));
    });
  });
});

describe("checkProperty (W-1)", () => {
  const base: Property = {
    id: asId<"Property">("prop_prueba_01"),
    city: "Caracas",
    zone: "Chacao",
    kind: "apartment",
    areaM2: 80,
  };

  it("acepta un inmueble completo", () => {
    expect(checkProperty(base).ok).toBe(true);
  });

  it.each([
    [{ city: "  " }],
    [{ zone: "" }],
    [{ areaM2: 0 }],
    [{ areaM2: 12.5 }],
    [{ areaM2: -3 }],
  ])("rechaza %o", (change) => {
    const r = checkProperty({ ...base, ...change });
    expect(r.ok).toBe(false);
    expect(!r.ok && r.error.code).toBe("INVALID_PROPERTY");
  });
});
