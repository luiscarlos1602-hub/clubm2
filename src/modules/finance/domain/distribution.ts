import {
  ZERO_USD,
  addMoney,
  applyPercentageFloor,
  compareMoney,
  divideFloor,
  isNegative,
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
  readonly surplus: Money; // excedente = P − C − F − O (≥ 0; 0 = todo en 0, C10)
  readonly fund: Money; // floor(25 % × excedente) — [SUPUESTO L1]
  readonly perParticipation: Money; // floor(fund / total) — K1
  readonly roundingResidue: Money; // fund − perParticipation × total; va a la empresa (AuditEntry en B5)
  readonly toExternal: Money; // perParticipation × placed
  readonly companyFromFund: Money; // perParticipation × retained + roundingResidue
  readonly companyDirect: Money; // excedente − fund — [SUPUESTO L1]
  readonly companyTotal: Money; // companyDirect + companyFromFund
  readonly capital: CapitalReturn; // se devuelve aparte de la ganancia
};

/**
 * Pérdida espejo 25/75 (ADR-019): excedente < 0. Los inversionistas absorben el 25 % de L repartido entre
 * las `total` participaciones (las no colocadas son de la empresa), con tope en `unitPrice`; el resto, la empresa.
 * Sin prelación de cobro (§4): externos y empresa cobran en la misma liquidación.
 */
export type LossDistribution = {
  readonly kind: "loss";
  readonly basis: ValueBasis;
  readonly participations: ParticipationTerms & { readonly retained: number };
  readonly surplus: Money; // < 0 (P − C − F − O)
  readonly loss: Money; // L = −surplus > 0
  readonly investorsLossPool: Money; // floor(25 % × L): redondeo a favor del inversionista
  readonly lossPerParticipation: Money; // min(floor(pool / total), unitPrice), o lo que deje el borde W5-1
  readonly roundingResidue: Money; // pool − floor(pool / total) × total → empresa (análogo K1)
  readonly capExcess: Money; // (floor(pool / total) − tope) × total → empresa
  readonly proceedsShortfall: Money; // borde W5-1: devolución espejo de externos que P − O no alcanzó a cubrir
  readonly externalLoss: Money; // lossPerParticipation × placed
  readonly companyLoss: Money; // L − externalLoss
  readonly returnPerParticipation: Money; // unitPrice − lossPerParticipation (0..unitPrice)
  readonly capital: CapitalReturn; // lo aportado (mismo sentido que en ganancia)
  readonly returned: { readonly external: Money; readonly company: Money }; // external + company = P − O
};

export type DistributionOutcome = Distribution | LossDistribution;

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

/** Reparte un excedente ≥ 0. Precondición: entrada validada y surplus ≥ 0. */
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

/**
 * Borde W5-1 = (b) (ADR-019 §5): si P − O no alcanza para la devolución espejo de los externos, estos reciben
 * todo P − O repartido por colocada (redondeo hacia abajo, residuo a la empresa). Nadie pone dinero que no
 * salió de la venta. Único punto a cambiar si la regla cambia. Con P − O < 0 (solo en proyecciones; la venta
 * real lo rechaza, W5-2) los externos reciben 0 y la empresa asume esos costos.
 */
function capReturnToProceeds(mirrorReturn: Money, proceeds: Money, placed: number): Money {
  if (placed === 0 || compareMoney(multiplyMoney(mirrorReturn, placed), proceeds) <= 0) return mirrorReturn;
  if (isNegative(proceeds)) return ZERO_USD;
  return divideFloor(proceeds, placed).quotient;
}

/** Reparte una pérdida (ADR-019). Precondición: entrada validada y surplus < 0. */
function distributeLoss(input: DistributionInput, surplus: Money): LossDistribution {
  const shares = input.shares ?? DEFAULT_DISTRIBUTION_SHARES;
  const { total, placed, unitPrice } = input.participations;
  const retained = total - placed;
  const loss = subtractMoney(ZERO_USD, surplus);

  const pool = applyPercentageFloor(loss, shares.fund);
  const { quotient: mirrorLoss, remainder: roundingResidue } = divideFloor(pool, total);
  const cappedLoss = compareMoney(mirrorLoss, unitPrice) > 0 ? unitPrice : mirrorLoss;
  const mirrorReturn = subtractMoney(unitPrice, cappedLoss);
  const proceeds = subtractMoney(input.salePrice, input.saleCosts);
  const returnPerParticipation = capReturnToProceeds(mirrorReturn, proceeds, placed);
  const lossPerParticipation = subtractMoney(unitPrice, returnPerParticipation);
  const externalLoss = multiplyMoney(lossPerParticipation, placed);
  const external = multiplyMoney(returnPerParticipation, placed);

  return {
    kind: "loss",
    basis: input.basis,
    participations: { ...input.participations, retained },
    surplus,
    loss,
    investorsLossPool: pool,
    lossPerParticipation,
    roundingResidue,
    capExcess: multiplyMoney(subtractMoney(mirrorLoss, cappedLoss), total),
    proceedsShortfall: multiplyMoney(subtractMoney(mirrorReturn, returnPerParticipation), placed),
    externalLoss,
    companyLoss: subtractMoney(loss, externalLoss),
    returnPerParticipation,
    capital: capitalOf(input, retained),
    returned: { external, company: subtractMoney(proceeds, external) },
  };
}

/** Motor único de reparto 25/75 (docs/02 §4). Ganancia o cero → reparto; pérdida → espejo (ADR-019). Nunca lanza. */
export function calculateDistribution(
  input: DistributionInput,
): Result<DistributionOutcome, DomainError<DistributionInputErrorCode>> {
  const valid = validateDistributionInput(input);
  if (!valid.ok) return valid;

  const surplus = surplusOf(input);
  return ok(isNegative(surplus) ? distributeLoss(input, surplus) : distribute(input, surplus));
}
