import { BPS_PER_WHOLE, type Percentage } from "./percentage";
import { err, ok, type DomainError, type Result } from "./result";

export type Currency = "USD";
/** Dinero siempre en centavos enteros (docs/01 §5). */
export type Money = { readonly cents: number; readonly currency: Currency };

/** Techo: cents × 10_000 (pb) debe caber en Number.MAX_SAFE_INTEGER. 9e11 ¢ = USD 9.000 millones. */
export const MAX_MONEY_CENTS = 900_000_000_000;

const CENTS_PER_UNIT = 100;

function requireSafeInteger(n: number, what: string): number {
  if (!Number.isSafeInteger(n)) throw new RangeError(`money: ${what} debe ser entero seguro (${n})`);
  return n + 0; // normaliza -0
}

function make(cents: number, what: string): Money {
  return { cents: requireSafeInteger(cents, what), currency: "USD" };
}

/** Literal en centavos. Precondición: entero seguro; si no, RangeError (SUPUESTO T1). */
export function usd(cents: number): Money {
  return make(cents, "cents");
}

/** Literal en dólares enteros (usdUnits(100) = 10.000 ¢). Precondición: entero seguro. */
export function usdUnits(units: number): Money {
  requireSafeInteger(units, "units");
  return make(units * CENTS_PER_UNIT, "units × 100");
}

/** Frontera (Zod, semillas, formularios): entero con |valor| ≤ MAX_MONEY_CENTS. Nunca lanza. */
export function parseUsdCents(value: unknown): Result<Money, DomainError<"INVALID_MONEY">> {
  if (typeof value !== "number" || !Number.isInteger(value) || Math.abs(value) > MAX_MONEY_CENTS) {
    return err("INVALID_MONEY", `se esperaba un entero de centavos con |valor| ≤ ${MAX_MONEY_CENTS}`);
  }
  return ok(usd(value));
}

export const ZERO_USD: Money = Object.freeze(usd(0));

export function addMoney(a: Money, b: Money): Money {
  return make(a.cents + b.cents, "suma");
}

export function sumMoney(items: readonly Money[]): Money {
  return items.reduce(addMoney, ZERO_USD);
}

/** Puede ser negativo. */
export function subtractMoney(a: Money, b: Money): Money {
  return make(a.cents - b.cents, "resta");
}

/** Factor entero (p. ej. n.º de participaciones). */
export function multiplyMoney(m: Money, factor: number): Money {
  requireSafeInteger(factor, "factor");
  return make(m.cents * factor, "producto");
}

export function compareMoney(a: Money, b: Money): -1 | 0 | 1 {
  if (a.cents < b.cents) return -1;
  return a.cents > b.cents ? 1 : 0;
}

export function equalsMoney(a: Money, b: Money): boolean {
  return a.currency === b.currency && a.cents === b.cents;
}

export function isPositive(m: Money): boolean {
  return m.cents > 0;
}

export function isNegative(m: Money): boolean {
  return m.cents < 0;
}

export function isZero(m: Money): boolean {
  return m.cents === 0;
}

// ── Únicos puntos de redondeo del proyecto (docs/01 §5) ──

/**
 * División entera exacta hacia abajo para dividendo ≥ 0 y divisor ≥ 1, ambos enteros seguros.
 * Corrige el posible error de la división en coma flotante cuando el cociente es grande.
 */
function floorDivide(dividend: number, divisor: number): { quotient: number; remainder: number } {
  let quotient = Math.floor(dividend / divisor);
  let remainder = dividend - quotient * divisor;
  while (remainder < 0) {
    quotient -= 1;
    remainder += divisor;
  }
  while (remainder >= divisor) {
    quotient += 1;
    remainder -= divisor;
  }
  return { quotient, remainder };
}

/** floor(cents × bps / 10_000). Precondición: m.cents ≥ 0 y producto entero seguro; si no, RangeError. */
export function applyPercentageFloor(m: Money, p: Percentage): Money {
  if (m.cents < 0) throw new RangeError(`applyPercentageFloor: monto negativo (${m.cents})`);
  if (p.bps < 0) throw new RangeError(`applyPercentageFloor: porcentaje negativo (${p.bps})`);
  const product = requireSafeInteger(m.cents * p.bps, "cents × bps");
  return usd(floorDivide(product, BPS_PER_WHOLE).quotient);
}

/** m = quotient × divisor + remainder, 0 ≤ remainder < divisor ¢. Precondición: m.cents ≥ 0, divisor entero ≥ 1. */
export function divideFloor(m: Money, divisor: number): { readonly quotient: Money; readonly remainder: Money } {
  if (m.cents < 0) throw new RangeError(`divideFloor: monto negativo (${m.cents})`);
  if (!Number.isSafeInteger(divisor) || divisor < 1) throw new RangeError(`divideFloor: divisor inválido (${divisor})`);
  const { quotient, remainder } = floorDivide(m.cents, divisor);
  return { quotient: usd(quotient), remainder: usd(remainder) };
}
