import { describe, expect, it } from "vitest";
import { fixedClock } from "@/shared/domain/clock";
import { isoDate } from "@/shared/domain/calendar-date";
import { relativeDates } from "./relative-dates";

describe("relativeDates", () => {
  it("daysAgo(0) = today", () => {
    const d = relativeDates(fixedClock(isoDate("2026-11-22")));
    expect(d.today).toBe("2026-11-22");
    expect(d.daysAgo(0)).toBe("2026-11-22");
  });

  it("daysAgo(1) cruza el fin de año", () => {
    expect(relativeDates(fixedClock(isoDate("2027-01-01"))).daysAgo(1)).toBe("2026-12-31");
  });

  it("daysAgo(45) retrocede 45 días", () => {
    expect(relativeDates(fixedClock(isoDate("2026-11-22"))).daysAgo(45)).toBe("2026-10-08");
  });

  it("daysAfter suma a una base", () => {
    const d = relativeDates(fixedClock(isoDate("2026-11-22")));
    expect(d.daysAfter(isoDate("2026-02-27"), 3)).toBe("2026-03-02");
  });

  it("rechaza días negativos o no enteros", () => {
    const d = relativeDates(fixedClock(isoDate("2026-11-22")));
    expect(() => d.daysAgo(-1)).toThrow(RangeError);
    expect(() => d.daysAgo(1.5)).toThrow(RangeError);
  });
});
