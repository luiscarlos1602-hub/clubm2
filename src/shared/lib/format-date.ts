export type DateStyle = "numeric" | "short";

const MONTHS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"] as const;
const ISO_PREFIX = /^(\d{4})-(\d{2})-(\d{2})(?:$|T)/;

function daysInMonth(year: number, monthIndex: number): number {
  if (monthIndex === 1) {
    const leap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    return leap ? 29 : 28;
  }
  return [3, 5, 8, 10].includes(monthIndex) ? 30 : 31;
}

/**
 * Acepta "YYYY-MM-DD" o un ISO completo (usa los 10 primeros caracteres, sin cambiar de zona horaria).
 * "numeric" → "03.11.2026" (sello, Plex Mono) · "short" → "3 nov 2026" (tabla de meses fija en español).
 * No usa Intl, para que servidor y cliente coincidan. Lanza RangeError si el formato es inválido.
 */
export function formatIsoDate(iso: string, style: DateStyle = "numeric"): string {
  const match = ISO_PREFIX.exec(iso);
  if (!match) throw new RangeError(`formatIsoDate: formato inválido "${iso}"`);
  const [, year, month, day] = match;
  const monthIndex = Number(month) - 1;
  const dayNumber = Number(day);
  if (monthIndex < 0 || monthIndex > 11 || dayNumber < 1 || dayNumber > daysInMonth(Number(year), monthIndex)) {
    throw new RangeError(`formatIsoDate: fecha fuera de rango "${iso}"`);
  }
  return style === "numeric" ? `${day}.${month}.${year}` : `${dayNumber} ${MONTHS[monthIndex]} ${year}`;
}
