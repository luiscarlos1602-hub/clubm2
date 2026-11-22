import type { IsoDate } from "./calendar-date";

/** Puerto del "hoy" de la demo (permite viajar en el tiempo). */
export interface Clock {
  /** Fecha civil en America/Caracas (SUPUESTO L9). */
  today(): IsoDate;
}

/** Implementación pura para tests y para la demo con fecha fija. El reloj del sistema es de F1-4 (infrastructure). */
export function fixedClock(today: IsoDate): Clock {
  return { today: () => today };
}
