import type { ListingPhase, ProjectListing } from "./marketplace-listing";

export const MARKETPLACE_FILTERS = ["all", "open", "renovation", "on_sale", "finished"] as const;
export type MarketplaceFilter = (typeof MARKETPLACE_FILTERS)[number];

/** Fases que deja pasar cada filtro de etapa. placement_complete solo aparece con "all" (P3-Q5). */
const PHASES_BY_FILTER: Readonly<
  Record<Exclude<MarketplaceFilter, "all">, readonly ListingPhase[]>
> = Object.freeze({
  open: ["open"],
  renovation: ["renovation"],
  on_sale: ["on_sale"],
  finished: ["sold", "finished"],
});

export function matchesStageFilter(listing: ProjectListing, filter: MarketplaceFilter): boolean {
  return filter === "all" || PHASES_BY_FILTER[filter].includes(listing.phase);
}

export type LocationFilter =
  | { readonly kind: "all" }
  | { readonly kind: "city"; readonly city: string }
  | { readonly kind: "zone"; readonly city: string; readonly zone: string };
export type LocationOption = { readonly key: string; readonly filter: LocationFilter };

const ALL_LOCATIONS: LocationFilter = Object.freeze({ kind: "all" });

function kebab(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** "todas" | kebab(city) | `${kebab(city)}-${kebab(zone)}`. */
export function locationKey(filter: LocationFilter): string {
  switch (filter.kind) {
    case "all":
      return "todas";
    case "city":
      return kebab(filter.city);
    case "zone":
      return `${kebab(filter.city)}-${kebab(filter.zone)}`;
  }
}

const byLocale = (a: string, b: string) => a.localeCompare(b, "es");

function option(filter: LocationFilter): LocationOption {
  return { key: locationKey(filter), filter };
}

/** [todas, ciudad A, zonas de A…, ciudad B, zonas de B…], ordenadas con localeCompare("es"), sin duplicados. */
export function listLocationOptions(
  listings: readonly ProjectListing[],
): readonly LocationOption[] {
  const zonesByCity = new Map<string, Set<string>>();
  for (const { city, zone } of listings) {
    const zones = zonesByCity.get(city) ?? new Set<string>();
    zones.add(zone);
    zonesByCity.set(city, zones);
  }
  const options: LocationOption[] = [option(ALL_LOCATIONS)];
  for (const city of [...zonesByCity.keys()].sort(byLocale)) {
    options.push(option({ kind: "city", city }));
    for (const zone of [...zonesByCity.get(city)!].sort(byLocale))
      options.push(option({ kind: "zone", city, zone }));
  }
  return options;
}

/** Clave desconocida → { kind: "all" }. */
export function resolveLocation(options: readonly LocationOption[], key: string): LocationFilter {
  return options.find((o) => o.key === key)?.filter ?? ALL_LOCATIONS;
}

function matchesLocation(listing: ProjectListing, location: LocationFilter): boolean {
  switch (location.kind) {
    case "all":
      return true;
    case "city":
      return listing.city === location.city;
    case "zone":
      return listing.city === location.city && listing.zone === location.zone;
  }
}

export type MarketplaceCriteria = {
  readonly stage: MarketplaceFilter;
  readonly location: LocationFilter;
};

export const DEFAULT_CRITERIA: MarketplaceCriteria = Object.freeze({
  stage: "all",
  location: ALL_LOCATIONS,
});

/** Conserva el orden de entrada. */
export function filterListings(
  listings: readonly ProjectListing[],
  criteria: MarketplaceCriteria,
): readonly ProjectListing[] {
  return listings.filter(
    (l) => matchesStageFilter(l, criteria.stage) && matchesLocation(l, criteria.location),
  );
}
