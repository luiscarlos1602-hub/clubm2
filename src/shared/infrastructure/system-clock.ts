import { isoDate, parseIsoDate } from "@/shared/domain/calendar-date";
import { fixedClock, type Clock } from "@/shared/domain/clock";
import { demoConfig } from "@/shared/config/demo";

/** Fecha civil del reloj del sistema en la zona indicada (por defecto America/Caracas, SUPUESTO L9). */
export function systemClock(
  options: { readonly timeZone?: string; readonly now?: () => Date } = {},
): Clock {
  const timeZone = options.timeZone ?? demoConfig.timeZone;
  const now = options.now ?? (() => new Date());
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return { today: () => isoDate(formatter.format(now())) };
}

export function demoClock(): Clock {
  const fixed = demoConfig.fixedToday;
  if (fixed !== null && fixed !== "") {
    const parsed = parseIsoDate(fixed);
    if (parsed.ok) return fixedClock(parsed.value);
    console.warn(`NEXT_PUBLIC_DEMO_TODAY inválido ("${fixed}"): se usa el reloj del sistema.`);
  }
  return systemClock({ timeZone: demoConfig.timeZone });
}
