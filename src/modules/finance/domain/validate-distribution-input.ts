import { MAX_MONEY_CENTS, type Money } from "@/shared/domain/money";
import { BPS_PER_WHOLE, type Percentage } from "@/shared/domain/percentage";
import { err, ok, type DomainError, type Result } from "@/shared/domain/result";
import type {
  DistributionInput,
  DistributionInputErrorCode,
  DistributionShares,
} from "./distribution";

type InputError = DomainError<DistributionInputErrorCode>;

/** Centavos enteros seguros dentro del techo; si no, el cálculo podría perder precisión. */
function isWithinCeiling(m: Money): boolean {
  return Number.isSafeInteger(m.cents) && m.cents <= MAX_MONEY_CENTS;
}

function validateAmounts(input: DistributionInput): InputError | null {
  const amounts = [input.salePrice, input.acquisitionCost, input.recoveryBudget, input.saleCosts];
  if (amounts.some((m) => m.cents < 0)) {
    return { code: "NEGATIVE_AMOUNT", detail: "P, C, F y O deben ser ≥ 0" };
  }
  if (!amounts.every(isWithinCeiling)) {
    return {
      code: "AMOUNT_TOO_LARGE",
      detail: `cada monto debe ser un entero de centavos ≤ ${MAX_MONEY_CENTS}`,
    };
  }
  return null;
}

function validateParticipations(input: DistributionInput): InputError | null {
  const { total, placed, unitPrice } = input.participations;
  if (!Number.isSafeInteger(total) || total < 1) {
    return { code: "INVALID_PARTICIPATION_TOTAL", detail: "total debe ser un entero ≥ 1" };
  }
  if (!Number.isSafeInteger(placed) || placed < 0 || placed > total) {
    return {
      code: "PLACED_OUT_OF_RANGE",
      detail: `colocadas debe ser un entero entre 0 y ${total}`,
    };
  }
  if (!(unitPrice.cents > 0)) {
    return { code: "NON_POSITIVE_UNIT_PRICE", detail: "el precio por participación debe ser > 0" };
  }
  if (!isWithinCeiling(unitPrice) || total * unitPrice.cents > MAX_MONEY_CENTS) {
    return {
      code: "AMOUNT_TOO_LARGE",
      detail: `total × precio debe ser un entero de centavos ≤ ${MAX_MONEY_CENTS}`,
    };
  }
  return null;
}

function isValidBps(p: Percentage): boolean {
  return Number.isSafeInteger(p.bps) && p.bps >= 0 && p.bps <= BPS_PER_WHOLE;
}

function validateShares(shares: DistributionShares | undefined): InputError | null {
  if (shares === undefined) return null;
  const { fund, company } = shares;
  if (!isValidBps(fund) || !isValidBps(company) || fund.bps + company.bps !== BPS_PER_WHOLE) {
    return {
      code: "INVALID_SHARES",
      detail: `fondo y empresa deben estar en 0..${BPS_PER_WHOLE} pb y sumar ${BPS_PER_WHOLE}`,
    };
  }
  return null;
}

/** Valida las entradas del motor de reparto. Nunca lanza. */
export function validateDistributionInput(
  input: DistributionInput,
): Result<DistributionInput, InputError> {
  const error =
    validateAmounts(input) ?? validateParticipations(input) ?? validateShares(input.shares);
  return error === null ? ok(input) : err(error.code, error.detail);
}
