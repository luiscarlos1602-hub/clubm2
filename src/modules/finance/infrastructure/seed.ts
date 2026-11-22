import { z } from "zod";
import type { IsoDate } from "@/shared/domain/calendar-date";
import { asId } from "@/shared/domain/id";
import { usd, usdUnits } from "@/shared/domain/money";
import { idSchema, isoDateSchema, moneySchema } from "@/shared/infrastructure/zod-schemas";
import type { Distribution, ParticipationTerms } from "../domain/distribution";
import type { ProjectEconomics } from "../domain/project-economics";
import { createSettlement, type Settlement } from "../domain/settlement";

export type FinanceSlice = {
  readonly economics: readonly ProjectEconomics[];
  readonly settlements: readonly Settlement[];
};

const termsSchema = z.object({
  total: z.number().int().min(1),
  placed: z.number().int().min(0),
  unitPrice: moneySchema,
});

const percentageSchema = z.object({ bps: z.number() });

const inputSchema = z.object({
  basis: z.literal("realized"),
  salePrice: moneySchema,
  acquisitionCost: moneySchema,
  recoveryBudget: moneySchema,
  saleCosts: moneySchema,
  participations: termsSchema,
  shares: z.object({ fund: percentageSchema, company: percentageSchema }).optional(),
});

const distributionSchema: z.ZodType<Distribution> = z.object({
  kind: z.literal("distributed"),
  basis: z.enum(["projection", "realized"]),
  participations: termsSchema.extend({ retained: z.number().int().min(0) }),
  surplus: moneySchema,
  fund: moneySchema,
  perParticipation: moneySchema,
  roundingResidue: moneySchema,
  toExternal: moneySchema,
  companyFromFund: moneySchema,
  companyDirect: moneySchema,
  companyTotal: moneySchema,
  capital: z.object({ external: moneySchema, company: moneySchema }),
});

export const financeSliceSchema: z.ZodType<FinanceSlice> = z.object({
  economics: z.array(
    z.object({
      projectId: idSchema<"Project">(),
      acquisitionCost: moneySchema,
      recoveryBudget: moneySchema,
      targetSalePrice: moneySchema,
      estimatedSaleCosts: moneySchema,
    }),
  ),
  settlements: z.array(
    z.object({
      id: idSchema<"Settlement">(),
      projectId: idSchema<"Project">(),
      settledOn: isoDateSchema,
      input: inputSchema,
      distribution: distributionSchema,
    }),
  ),
});

export type FinanceSeedContext = {
  /** Proyectos liquidados: fecha y términos de la clase (los pone composition). */
  readonly settled: readonly {
    readonly projectId: Settlement["projectId"];
    readonly settledOn: IsoDate;
    readonly terms: ParticipationTerms;
  }[];
};

// F = 100 × USD 100 en todos los proyectos (ref. del maestro). Montos en USD enteros.
const F = usdUnits(10_000);
const ECONOMICS = [
  { key: "palos_grandes_01", c: 55_000, p: 82_000, o: 2_460 },
  { key: "hatillo_01", c: 62_000, p: 88_000, o: 2_640 },
  { key: "chacao_01", c: 48_000, p: 72_000, o: 2_160 },
  { key: "valencia_01", c: 38_000, p: 58_000, o: 1_740 },
  { key: "paraiso_01", c: 34_000, p: 52_000, o: 1_560 },
  { key: "chacao_02", c: 50_000, p: 76_000, o: 2_280 },
  { key: "palos_grandes_02", c: 58_000, p: 84_000, o: 2_520 },
] as const;

/** Venta realizada de los liquidados; O de palos_grandes_01 con centavos fuerza un residuo K1. */
const REALIZED = {
  palos_grandes_01: { id: "stl_palos_grandes_01", salePrice: usdUnits(79_500), saleCosts: usd(240_037) },
  chacao_01: { id: "stl_chacao_01", salePrice: usdUnits(74_000), saleCosts: usdUnits(2_200) },
} as const;

/** Construye cada liquidación con createSettlement. Si el motor devuelve err, lanza: es un fallo de la semilla. */
export function buildFinanceSeed(ctx: FinanceSeedContext): FinanceSlice {
  const economics: ProjectEconomics[] = ECONOMICS.map((e) => ({
    projectId: asId<"Project">(`prj_${e.key}`),
    acquisitionCost: usdUnits(e.c),
    recoveryBudget: F,
    targetSalePrice: usdUnits(e.p),
    estimatedSaleCosts: usdUnits(e.o),
  }));

  const settlements: Settlement[] = ctx.settled.map((s) => {
    const key = s.projectId.replace(/^prj_/, "") as keyof typeof REALIZED;
    const realized = REALIZED[key];
    const base = economics.find((e) => e.projectId === s.projectId);
    if (realized === undefined || base === undefined) {
      throw new Error(`semilla de finanzas: sin venta realizada para ${s.projectId}`);
    }
    const result = createSettlement({
      id: asId<"Settlement">(realized.id),
      projectId: s.projectId,
      settledOn: s.settledOn,
      input: {
        basis: "realized",
        salePrice: realized.salePrice,
        acquisitionCost: base.acquisitionCost,
        recoveryBudget: base.recoveryBudget,
        saleCosts: realized.saleCosts,
        participations: { total: s.terms.total, placed: s.terms.placed, unitPrice: s.terms.unitPrice },
      },
    });
    if (!result.ok) {
      throw new Error(`semilla de finanzas: ${result.error.code} en ${s.projectId}`);
    }
    return result.value;
  });

  return financeSliceSchema.parse({ economics, settlements });
}
