import type { MoneyLike } from "@/shared/lib/format-money";

/** Valores de ejemplo ilustrativos. Nada se calcula: son literales. */
// C1 docs/02: capital 10.000 · ganancia proyectada 5.000 · cobro proyectado 15.000
export const SAMPLE_CAPITAL: MoneyLike = { cents: 1_000_000, currency: "USD" }; // C1 docs/02 · USD 10.000
export const SAMPLE_REALIZED: MoneyLike = { cents: 125_050, currency: "USD" }; // ilustrativo · USD 1.250,50
export const SAMPLE_PROJECTION: MoneyLike = { cents: 1_500_000, currency: "USD" }; // C1 docs/02 · cobro proyectado USD 15.000
export const SAMPLE_PRICE_PER_PARTICIPATION: MoneyLike = { cents: 10_000, currency: "USD" }; // C1 docs/02 · USD 100
export const SAMPLE_SEAL = { code: "M2-001", date: "2026-11-03" } as const;
