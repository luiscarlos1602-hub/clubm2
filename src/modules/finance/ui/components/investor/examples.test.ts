import { describe, expect, it } from "vitest";
import { createContainer } from "@/composition/container";
import { fixedClock } from "@/shared/domain/clock";
import type { IsoDate } from "@/shared/domain/calendar-date";
import { sumMoney, usdUnits } from "@/shared/domain/money";
import { PROJECT_EXAMPLES, PUBLISHED_PROJECT_SLUGS, isPublishedProjectSlug } from "./examples";

describe("examples de la ficha", () => {
  it.each(PUBLISHED_PROJECT_SLUGS)("%s: obra 5.000 + bolsa 5.000 = F 10.000", (slug) => {
    const e = PROJECT_EXAMPLES[slug];
    expect(sumMoney(e.works.map((l) => l.amount))).toEqual(usdUnits(5_000));
    expect(sumMoney(e.fees.map((l) => l.amount))).toEqual(usdUnits(5_000));
  });
  it("M2-007 y slugs ajenos no tienen ficha", () => {
    expect(isPublishedProjectSlug("m2-007-palos-grandes")).toBe(false);
    expect(isPublishedProjectSlug("toString")).toBe(false);
    expect(PUBLISHED_PROJECT_SLUGS).toHaveLength(6);
  });
  it("PUBLISHED_PROJECT_SLUGS coincide con los slugs publicables del marketplace", async () => {
    const container = createContainer({ clock: fixedClock("2026-11-22" as IsoDate), storage: null });
    const slugs = (await container.participations.listMarketplace()).map((l) => l.slug);
    expect([...slugs].sort()).toEqual([...PUBLISHED_PROJECT_SLUGS].sort());
  });
});
