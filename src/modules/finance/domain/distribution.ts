import {
  addMoney,
  applyPercentageFloor,
  divideFloor,
  isPositive,
  multiplyMoney,
  subtractMoney,
  type Money,
} from "@/shared/domain/money";
import { percentage, type Percentage } from "@/shared/domain/percentage";
import { ok, type DomainError, type Result } from "@/shared/domain/result";
import { validateDistributionInput } from "./validate-distribution-input";

/** Rotula el origen de los números: la UI muestra "proyección" o "realizado" a partir de aquí (regla 2 de CLAUDE.md). */
export type ValueBasis = "projection" | "realized";

export type DistributionShares = { readonly fund: Percentage; readonly company: Percentage };

/** Defaults del maestro: 25 % al fondo de los inversionistas, 75 % a la empresa. */
export const DEFAULT_DISTRIBUTION_SHARES: DistributionShares = Object.freeze({
  fund: percentage(2500),
  company: percentage(7500),
});

export type ParticipationTerms = {
  readonly total: number; // entero ≥ 1 (ref. 100)
  readonly placed: number; // entero 0..total
  readonly unitPrice: Money; // > 0 (ref. USD 100)
};

export type DistributionInput = {
  readonly basis: ValueBasis;
  readonly salePrice: Money; // P
  readonly acquisitionCost: Money; // C
  readonly recoveryBudget: Money; // F
  readonly saleCosts: Money; // O
  readonly participations: ParticipationTerms;
  readonly shares?: DistributionShares; // por defecto DEFAULT_DISTRIBUTION_SHARES
};

export type DistributionInputErrorCode =
  | "NEGATIVE_AMOUNT"
  | "AMOUNT_TOO_LARGE"
  | "INVALID_PARTICIPATION_TOTAL"
  | "PLACED_OUT_OF_RANGE"
  | "NON_POSITIVE_UNIT_PRICE"
  | "INVALID_SHARES";

export type CapitalReturn = {
  readonly external: Money; // placed × unitPrice
  readonly company: Money; // C + (total − placed) × unitPrice
};

export type Distribution = {
  readonly kind: "distributed";
  readonly basis: ValueBasis;
  readonly participations: ParticipationTerms & { readonly retained: number };
  readonly surplus: Money; // excedente = P − C − F − O (> 0)
  readonly fund: Money; // floor(25 % × excedente) — [SUPUESTO L1]
  readonly perParticipation: Money; // floor(fund / total) — K1
  readonly roundingResidue: Money; // fund − perParticipation × total; va a la empresa (AuditEntry en B5)
  readonly toExternal: Money; // perParticipation × placed
  readonly companyFromFund: Money; // perParticipation × retained + roundingResidue
  readonly companyDirect: Money; // excedente − fund — [SUPUESTO L1]
  readonly companyTotal: Money; // companyDirect + companyFromFund
  readonly capital: CapitalReturn; // se devuelve aparte de la ganancia
};

export type NoDistribution = {
  readonly kind: "no_distribution";
  readonly basis: ValueBasis;
  readonly surplus: Money; // ≤ 0
  readonly reason: "NON_POSITIVE_SURPLUS";
  readonly lossPolicy: "to_be_defined"; // UI: "Política de pérdidas: por definir" (docs/02 §4, H2)
};

export type DistributionOutcome = Distribution | NoDistribution;

function surplusOf(input: DistributionInput): Money {
  const costs = addMoney(addMoney(input.acquisitionCost, input.recoveryBudget), input.saleCosts);
  return subtractMoney(input.salePrice, costs);
}

function capitalOf(input: DistributionInput, retained: number): CapitalReturn {
  const { placed, unitPrice } = input.participations;
  return {
    external: multiplyMoney(unitPrice, placed),
    company: addMoney(input.acquisitionCost, multiplyMoney(unitPrice, retained)),
  };
}

/** Reparte un excedente positivo. Precondición: entrada validada y surplus > 0. */
function distribute(input: DistributionInput, surplus: Money): Distribution {
  const shares = input.shares ?? DEFAULT_DISTRIBUTION_SHARES;
  const { total, placed } = input.participations;
  const retained = total - placed;

  const fund = applyPercentageFloor(surplus, shares.fund);
  const { quotient: perParticipation, remainder: roundingResidue } = divideFloor(fund, total);
  const toExternal = multiplyMoney(perParticipation, placed);
  const companyFromFund = addMoney(multiplyMoney(perParticipation, retained), roundingResidue);
  const companyDirect = subtractMoney(surplus, fund);

  return {
    kind: "distributed",
    basis: input.basis,
    participations: { ...input.participations, retained },
    surplus,
    fund,
    perParticipation,
    roundingResidue,
    toExternal,
    companyFromFund,
    companyDirect,
    companyTotal: addMoney(companyDirect, companyFromFund),
    capital: capitalOf(input, retained),
  };
}

/** Motor único de reparto 25/75 (docs/02 §4). Valida primero; nunca lanza. */
export function calculateDistribution(
  input: DistributionInput,
): Result<DistributionOutcome, DomainError<DistributionInputErrorCode>> {
  const valid = validateDistributionInput(input);
  if (!valid.ok) return valid;

  const surplus = surplusOf(input);
  if (!isPositive(surplus)) {
    return ok({
      kind: "no_distribution",
      basis: input.basis,
      surplus,
      reason: "NON_POSITIVE_SURPLUS",
      lossPolicy: "to_be_defined",
    });
  }
  return ok(distribute(input, surplus));
}
