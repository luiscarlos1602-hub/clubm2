import { addDays, type IsoDate } from "@/shared/domain/calendar-date";
import type { Clock } from "@/shared/domain/clock";

export type RelativeDates = {
  readonly today: IsoDate;
  daysAgo(days: number): IsoDate;
  daysAfter(base: IsoDate, days: number): IsoDate;
};

function assertDays(days: number): void {
  if (!Number.isInteger(days) || days < 0) {
    throw new RangeError(`días: se esperaba un entero ≥ 0, llegó ${days}`);
  }
}

export function relativeDates(clock: Clock): RelativeDates {
  const today = clock.today();
  return {
    today,
    daysAgo(days) {
      assertDays(days);
      return addDays(today, -days);
    },
    daysAfter(base, days) {
      assertDays(days);
      return addDays(base, days);
    },
  };
}
