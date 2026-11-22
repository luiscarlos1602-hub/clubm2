import { describe, expect, it } from "vitest";
import type { ProjectCode } from "@/modules/projects";
import { isoDate } from "@/shared/domain/calendar-date";
import { asId } from "@/shared/domain/id";
import { usdUnits } from "@/shared/domain/money";
import type { ListingPhase, ProjectListing } from "./marketplace-listing";
import {
  DEFAULT_CRITERIA,
  MARKETPLACE_FILTERS,
  filterListings,
  listLocationOptions,
  locationKey,
  matchesStageFilter,
  resolveLocation,
  type MarketplaceFilter,
} from "./marketplace-filters";

function listing(
  code: string,
  phase: ListingPhase,
  city = "Caracas",
  zone = "Chacao",
): ProjectListing {
  const historic = phase === "sold" || phase === "finished";
  return {
    projectId: asId(`prj_t_${code}`),
    code: code as ProjectCode,
    slug: `slug-${code}`,
    name: `Proyecto ${code}`,
    city,
    zone,
    acquiredOn: isoDate("2026-01-01"),
    stage:
      phase === "open" || phase === "placement_complete"
        ? "funding"
        : phase === "finished"
          ? "settled"
          : phase,
    phase,
    participations: { total: 100, available: phase === "open" ? 10 : 0 },
    unitPrice: usdUnits(100),
    targetTermMonths: historic ? null : 3,
    settledOn: phase === "finished" ? isoDate("2026-06-01") : null,
    images: [],
  };
}

const ALL_PHASES: readonly ListingPhase[] = [
  "open",
  "placement_complete",
  "renovation",
  "on_sale",
  "sold",
  "finished",
];

describe("matchesStageFilter", () => {
  const EXPECTED: Record<MarketplaceFilter, readonly ListingPhase[]> = {
    all: ALL_PHASES,
    open: ["open"],
    renovation: ["renovation"],
    on_sale: ["on_sale"],
    finished: ["sold", "finished"],
  };

  it("las 5 opciones del contrato, en orden", () => {
    expect(MARKETPLACE_FILTERS).toEqual(["all", "open", "renovation", "on_sale", "finished"]);
  });

  it("tabla fase × filtro (finished incluye sold; P3-Q5 placement_complete solo con all)", () => {
    for (const filter of MARKETPLACE_FILTERS) {
      const matched = ALL_PHASES.filter((p) => matchesStageFilter(listing("M2-001", p), filter));
      expect(matched).toEqual(EXPECTED[filter]);
    }
  });
});

describe("ubicación", () => {
  const listings = [
    listing("M2-004", "on_sale", "Valencia", "El Viñedo"),
    listing("M2-005", "renovation", "Caracas", "El Hatillo"),
    listing("M2-006", "open", "Caracas", "Chacao"),
    listing("M2-003", "finished", "Caracas", "Chacao"),
  ];

  it("locationKey: kebab sin diacríticos", () => {
    expect(locationKey({ kind: "all" })).toBe("todas");
    expect(locationKey({ kind: "city", city: "Caracas" })).toBe("caracas");
    expect(locationKey({ kind: "zone", city: "Caracas", zone: "Chacao" })).toBe("caracas-chacao");
    expect(locationKey({ kind: "zone", city: "Valencia", zone: "El Viñedo" })).toBe(
      "valencia-el-vinedo",
    );
    expect(locationKey({ kind: "zone", city: " Caracas ", zone: "Los  Palos-Grandes!" })).toBe(
      "caracas-los-palos-grandes",
    );
  });

  it("listLocationOptions: todas, ciudad y sus zonas, ordenadas y sin duplicados", () => {
    const options = listLocationOptions(listings);
    expect(options.map((o) => o.key)).toEqual([
      "todas",
      "caracas",
      "caracas-chacao",
      "caracas-el-hatillo",
      "valencia",
      "valencia-el-vinedo",
    ]);
    expect(options[0]!.filter).toEqual({ kind: "all" });
    expect(options[1]!.filter).toEqual({ kind: "city", city: "Caracas" });
    expect(options[5]!.filter).toEqual({ kind: "zone", city: "Valencia", zone: "El Viñedo" });
  });

  it("listLocationOptions sin tarjetas → solo todas", () => {
    expect(listLocationOptions([]).map((o) => o.key)).toEqual(["todas"]);
  });

  it("resolveLocation: clave conocida → su filtro; desconocida → all", () => {
    const options = listLocationOptions(listings);
    expect(resolveLocation(options, "caracas-el-hatillo")).toEqual({
      kind: "zone",
      city: "Caracas",
      zone: "El Hatillo",
    });
    expect(resolveLocation(options, "maracaibo")).toEqual({ kind: "all" });
    expect(resolveLocation([], "caracas")).toEqual({ kind: "all" });
  });

  it("filterListings combina etapa y ubicación y conserva el orden", () => {
    const codes = (r: readonly ProjectListing[]) => r.map((l) => l.code);
    expect(
      codes(
        filterListings(listings, { stage: "all", location: { kind: "city", city: "Caracas" } }),
      ),
    ).toEqual(["M2-005", "M2-006", "M2-003"]);
    expect(
      codes(
        filterListings(listings, {
          stage: "all",
          location: { kind: "zone", city: "Caracas", zone: "Chacao" },
        }),
      ),
    ).toEqual(["M2-006", "M2-003"]);
    expect(
      codes(
        filterListings(listings, {
          stage: "finished",
          location: { kind: "zone", city: "Caracas", zone: "Chacao" },
        }),
      ),
    ).toEqual(["M2-003"]);
    expect(
      filterListings(listings, { stage: "open", location: { kind: "city", city: "Valencia" } }),
    ).toEqual([]);
  });

  it("la zona solo coincide dentro de su ciudad", () => {
    const twin = [
      listing("M2-010", "open", "Valencia", "Chacao"),
      listing("M2-011", "open", "Caracas", "Chacao"),
    ];
    const result = filterListings(twin, {
      stage: "all",
      location: { kind: "zone", city: "Caracas", zone: "Chacao" },
    });
    expect(result.map((l) => l.code)).toEqual(["M2-011"]);
  });

  it("DEFAULT_CRITERIA devuelve todo", () => {
    expect(DEFAULT_CRITERIA).toEqual({ stage: "all", location: { kind: "all" } });
    expect(filterListings(listings, DEFAULT_CRITERIA)).toEqual(listings);
  });
});
