import { describe, expect, it } from "vitest";
import type { Project, ProjectCode, ProjectStatus, Property } from "@/modules/projects";
import { isoDate, type IsoDate } from "@/shared/domain/calendar-date";
import { asId } from "@/shared/domain/id";
import { usdUnits } from "@/shared/domain/money";
import type { ParticipationClass } from "./participation";
import {
  LISTING_PHASES,
  buildMarketplaceListing,
  type MarketplaceSource,
} from "./marketplace-listing";

type Fixture = {
  readonly n: string;
  readonly status: ProjectStatus;
  readonly placed?: number;
  readonly acquiredOn?: IsoDate | null;
  readonly settledOn?: IsoDate | null;
};

function project({
  n,
  status,
  acquiredOn = isoDate("2026-01-10"),
  settledOn = null,
}: Fixture): Project {
  return {
    id: asId(`prj_t_${n}`),
    code: `M2-${n}` as ProjectCode,
    slug: `m2-${n}-zona`,
    name: `Proyecto ${n}`,
    propertyId: asId(`ppt_t_${n}`),
    status,
    timeline: { acquiredOn, saleSignedOn: null, settledOn },
  };
}

function property(n: string): Property {
  return {
    id: asId(`ppt_t_${n}`),
    city: "Caracas",
    zone: `Zona ${n}`,
    kind: "apartment",
    areaM2: 80,
  };
}

function participationClass(n: string, placed = 100): ParticipationClass {
  return {
    id: asId(`pcl_t_${n}`),
    projectId: asId(`prj_t_${n}`),
    total: 100,
    placed,
    unitPrice: usdUnits(100),
  };
}

function sourceOf(fixtures: readonly Fixture[]): MarketplaceSource {
  return {
    projects: fixtures.map(project),
    properties: fixtures.map((f) => property(f.n)),
    classes: fixtures.map((f) => participationClass(f.n, f.placed)),
  };
}

const only = (f: Fixture) => {
  const result = buildMarketplaceListing(sourceOf([f]));
  expect(result).toHaveLength(1);
  return result[0]!;
};

describe("buildMarketplaceListing · fases y disponibles", () => {
  it("funding 63/100 → open con 37 disponibles y plazo objetivo", () => {
    const l = only({ n: "006", status: "funding", placed: 63 });
    expect(l).toMatchObject({
      stage: "funding",
      phase: "open",
      targetTermMonths: 3,
      settledOn: null,
    });
    expect(l.participations).toEqual({ total: 100, available: 37 });
  });

  it("funding 100/100 → placement_complete con 0 disponibles", () => {
    const l = only({ n: "008", status: "funding", placed: 100 });
    expect(l.phase).toBe("placement_complete");
    expect(l.participations.available).toBe(0);
  });

  it("P3-3 · renovation, on_sale y stalled → 0 disponibles aunque queden sin colocar", () => {
    for (const status of ["renovation", "on_sale", "stalled"] as const) {
      const l = only({ n: "005", status, placed: 80 });
      expect(l.participations.available).toBe(0);
      expect(l.targetTermMonths).toBe(3);
    }
  });

  it("L5 · stalled → stage on_sale y phase on_sale", () => {
    const l = only({ n: "002", status: "stalled" });
    expect(l.stage).toBe("on_sale");
    expect(l.phase).toBe("on_sale");
    expect(JSON.stringify(l)).not.toContain("stalled");
  });

  it("CA4 · settled → finished, sin plazo objetivo y con fecha de liquidación", () => {
    const l = only({ n: "001", status: "settled", settledOn: isoDate("2026-05-20") });
    expect(l).toMatchObject({
      stage: "settled",
      phase: "finished",
      targetTermMonths: null,
      settledOn: "2026-05-20",
    });
  });

  it("P3-5 · sold → sold, sin plazo objetivo y sin fecha de liquidación", () => {
    const l = only({ n: "009", status: "sold" });
    expect(l).toMatchObject({ phase: "sold", targetTermMonths: null, settledOn: null });
  });

  it("copia datos de proyecto e inmueble sin dirección exacta (D6)", () => {
    const l = only({ n: "006", status: "funding", placed: 63, acquiredOn: isoDate("2026-10-01") });
    expect(l).toMatchObject({
      projectId: "prj_t_006",
      code: "M2-006",
      slug: "m2-006-zona",
      name: "Proyecto 006",
      city: "Caracas",
      zone: "Zona 006",
      acquiredOn: "2026-10-01",
    });
    expect(Object.keys(l)).not.toContain("address");
  });

  it("CA7 · unitPrice es la misma referencia que la de la clase (no se recalcula)", () => {
    const source = sourceOf([{ n: "006", status: "funding", placed: 63 }]);
    expect(buildMarketplaceListing(source)[0]!.unitPrice).toBe(source.classes[0]!.unitPrice);
  });

  it("LISTING_PHASES tiene las 6 fases del contrato", () => {
    expect(LISTING_PHASES).toEqual([
      "open",
      "placement_complete",
      "renovation",
      "on_sale",
      "sold",
      "finished",
    ]);
  });
});

describe("buildMarketplaceListing · omisiones", () => {
  it("N7 / P3-4 · omite estados no publicables sin lanzar", () => {
    for (const status of ["opportunity", "due_diligence", "acquired", "discarded"] as const) {
      expect(buildMarketplaceListing(sourceOf([{ n: "007", status }]))).toEqual([]);
    }
  });

  it("omite un proyecto sin clase, sin inmueble o sin fecha de compra", () => {
    const base = sourceOf([
      { n: "001", status: "renovation" },
      { n: "002", status: "renovation" },
      { n: "003", status: "renovation", acquiredOn: null },
      { n: "004", status: "renovation" },
    ]);
    const source: MarketplaceSource = {
      projects: base.projects,
      properties: base.properties.filter((p) => p.id !== "ppt_t_002"),
      classes: base.classes.filter((c) => c.projectId !== "prj_t_001"),
    };
    expect(buildMarketplaceListing(source).map((l) => l.code)).toEqual(["M2-004"]);
  });

  it("con dos clases del mismo proyecto usa la primera", () => {
    const source = sourceOf([{ n: "006", status: "funding", placed: 63 }]);
    const second = {
      ...participationClass("006", 10),
      id: asId<"ParticipationClass">("pcl_t_006_b"),
    };
    const [l] = buildMarketplaceListing({ ...source, classes: [...source.classes, second] });
    expect(l!.participations.available).toBe(37);
  });

  it("fuente vacía → lista vacía", () => {
    expect(buildMarketplaceListing({ projects: [], properties: [], classes: [] })).toEqual([]);
  });
});
