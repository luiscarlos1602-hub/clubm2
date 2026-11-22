import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { addDays, isoDate } from "@/shared/domain/calendar-date";
import { classifyWheel, type Wheel } from "./classify-wheel";

describe("propiedades de las ruedas", () => {
  const RANK: Record<Wheel, number> = { good: 0, medium: 1, bad: 2, in_progress: -1 };
  const BASE = isoDate("2000-01-01");

  it("atrasar la venta nunca mejora la rueda (good < medium < bad)", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 20_000 }),
        fc.integer({ min: 0, max: 400 }),
        fc.integer({ min: 0, max: 400 }),
        fc.integer({ min: 0, max: 400 }),
        (acqOffset, firstSale, delay, todayExtra) => {
          const acquiredOn = addDays(BASE, acqOffset);
          const early = addDays(acquiredOn, firstSale);
          const late = addDays(early, delay);
          const today = addDays(late, todayExtra);
          const a = classifyWheel({ acquiredOn, saleSignedOn: early }, today);
          const b = classifyWheel({ acquiredOn, saleSignedOn: late }, today);
          expect(a.ok && b.ok).toBe(true);
          if (a.ok && b.ok) {
            expect(a.value.sold && b.value.sold).toBe(true);
            expect(RANK[a.value.wheel]).toBeLessThanOrEqual(RANK[b.value.wheel]);
          }
        },
      ),
      { numRuns: 1000 },
    );
  });

  it("measuredUntil es la venta si hay venta, o hoy si no la hay", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 20_000 }),
        fc.integer({ min: 0, max: 400 }),
        fc.boolean(),
        (acqOffset, span, hasSale) => {
          const acquiredOn = addDays(BASE, acqOffset);
          const end = addDays(acquiredOn, span);
          const today = addDays(end, 10);
          const result = classifyWheel({ acquiredOn, saleSignedOn: hasSale ? end : null }, today);
          expect(result.ok && result.value.measuredFrom).toBe(acquiredOn);
          expect(result.ok && result.value.measuredUntil).toBe(hasSale ? end : today);
          expect(result.ok && result.value.sold).toBe(hasSale);
        },
      ),
      { numRuns: 1000 },
    );
  });
});
