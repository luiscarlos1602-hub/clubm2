import { err, ok, type DomainError, type Result } from "./result";

/** Porcentaje en puntos básicos: 2500 = 25 %. */
export type Percentage = { readonly bps: number };

export const BPS_PER_WHOLE = 10_000;

/** Literal. Precondición: entero seguro; si no, RangeError (error de programación, SUPUESTO T1). */
export function percentage(bps: number): Percentage {
  if (!Number.isSafeInteger(bps)) throw new RangeError(`percentage: bps debe ser entero seguro (${bps})`);
  return { bps: bps + 0 };
}

/** Frontera: entero 0..10.000. Nunca lanza. */
export function parsePercentage(value: unknown): Result<Percentage, DomainError<"INVALID_PERCENTAGE">> {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 0 || value > BPS_PER_WHOLE) {
    return err("INVALID_PERCENTAGE", `se esperaba un entero entre 0 y ${BPS_PER_WHOLE} pb`);
  }
  return ok(percentage(value));
}

export function complementPercentage(p: Percentage): Percentage {
  return percentage(BPS_PER_WHOLE - p.bps);
}

export const PERCENT_0: Percentage = Object.freeze(percentage(0));
export const PERCENT_100: Percentage = Object.freeze(percentage(BPS_PER_WHOLE));
