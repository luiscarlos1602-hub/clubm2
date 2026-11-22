import { err, ok, type DomainError, type Result } from "./result";

/** Fecha civil sin hora ni zona: "YYYY-MM-DD", años 1900–9999. Se compara lexicográficamente. */
export type IsoDate = string & { readonly __brand: "IsoDate" };

const ISO_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const MIN_YEAR = 1900;
const MAX_YEAR = 9999;

type CivilDate = { readonly year: number; readonly month: number; readonly day: number };

export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

const DAYS_PER_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31] as const;

/** month 1..12. */
export function daysInMonth(year: number, month: number): number {
  if (!Number.isInteger(month) || month < 1 || month > 12) throw new RangeError(`daysInMonth: mes inválido (${month})`);
  return month === 2 && isLeapYear(year) ? 29 : DAYS_PER_MONTH[month - 1];
}

function toCivil(raw: string): CivilDate | null {
  const match = ISO_PATTERN.exec(raw);
  if (match === null) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (year < MIN_YEAR || year > MAX_YEAR || month < 1 || month > 12) return null;
  if (day < 1 || day > daysInMonth(year, month)) return null;
  return { year, month, day };
}

function fromCivil({ year, month, day }: CivilDate): IsoDate {
  if (year < MIN_YEAR || year > MAX_YEAR) throw new RangeError(`calendar-date: año fuera de 1900–9999 (${year})`);
  const pad = (n: number, width: number) => String(n).padStart(width, "0");
  return `${pad(year, 4)}-${pad(month, 2)}-${pad(day, 2)}` as IsoDate;
}

function civilOf(d: IsoDate): CivilDate {
  const civil = toCivil(d);
  if (civil === null) throw new RangeError(`calendar-date: fecha inválida (${d})`);
  return civil;
}

/** Literal. Precondición: formato válido; si no, RangeError (SUPUESTO T1). */
export function isoDate(raw: string): IsoDate {
  return fromCivil(civilOf(raw as IsoDate));
}

/** Frontera: valida formato, mes, día y bisiestos. Nunca lanza. */
export function parseIsoDate(raw: unknown): Result<IsoDate, DomainError<"INVALID_DATE">> {
  const civil = typeof raw === "string" ? toCivil(raw) : null;
  if (civil === null) return err("INVALID_DATE", "formato esperado: YYYY-MM-DD válido, años 1900–9999");
  return ok(fromCivil(civil));
}

export function compareIsoDate(a: IsoDate, b: IsoDate): -1 | 0 | 1 {
  if (a < b) return -1;
  return a > b ? 1 : 0;
}

/** K2: mes calendario. Si el día no existe en el mes destino, se toma el último día (SUPUESTO L2). months entero ≥ 0. */
export function addCalendarMonths(d: IsoDate, months: number): IsoDate {
  if (!Number.isSafeInteger(months) || months < 0) throw new RangeError(`addCalendarMonths: meses inválidos (${months})`);
  const { year, month, day } = civilOf(d);
  const monthIndex = month - 1 + months;
  const targetYear = year + Math.floor(monthIndex / 12);
  const targetMonth = (monthIndex % 12) + 1;
  if (targetYear > MAX_YEAR) throw new RangeError(`addCalendarMonths: año fuera de rango (${targetYear})`);
  return fromCivil({ year: targetYear, month: targetMonth, day: Math.min(day, daysInMonth(targetYear, targetMonth)) });
}

// Días desde 1970-01-01 en el calendario gregoriano proléptico (algoritmo days_from_civil de H. Hinnant).
function daysFromCivil({ year, month, day }: CivilDate): number {
  const y = month <= 2 ? year - 1 : year;
  const era = Math.floor(y / 400);
  const yearOfEra = y - era * 400;
  const dayOfYear = Math.floor((153 * (month + (month > 2 ? -3 : 9)) + 2) / 5) + day - 1;
  const dayOfEra = yearOfEra * 365 + Math.floor(yearOfEra / 4) - Math.floor(yearOfEra / 100) + dayOfYear;
  return era * 146_097 + dayOfEra - 719_468;
}

function civilFromDays(days: number): CivilDate {
  const z = days + 719_468;
  const era = Math.floor(z / 146_097);
  const dayOfEra = z - era * 146_097;
  const yearOfEra = Math.floor(
    (dayOfEra - Math.floor(dayOfEra / 1460) + Math.floor(dayOfEra / 36_524) - Math.floor(dayOfEra / 146_096)) / 365,
  );
  const dayOfYear = dayOfEra - (365 * yearOfEra + Math.floor(yearOfEra / 4) - Math.floor(yearOfEra / 100));
  const mp = Math.floor((5 * dayOfYear + 2) / 153);
  const day = dayOfYear - Math.floor((153 * mp + 2) / 5) + 1;
  const month = mp < 10 ? mp + 3 : mp - 9;
  const year = yearOfEra + era * 400 + (month <= 2 ? 1 : 0);
  return { year, month, day };
}

/** days entero (puede ser negativo). El resultado debe quedar en 1900–9999; si no, RangeError. */
export function addDays(d: IsoDate, days: number): IsoDate {
  if (!Number.isSafeInteger(days)) throw new RangeError(`addDays: días inválidos (${days})`);
  return fromCivil(civilFromDays(daysFromCivil(civilOf(d)) + days));
}
