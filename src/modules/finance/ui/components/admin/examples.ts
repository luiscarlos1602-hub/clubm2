import { usd, type Money } from "@/shared/domain/money";

// Ejemplos del backoffice de finanzas (ADR-012). Montos en centavos, con origen citado.

/** Capital externo colocado = colocadas × USD 100, en centavos (semilla de participaciones). */
export const EXTERNAL_CAPITAL_BY_CODE: Readonly<Record<string, Money>> = {
  "M2-001": usd(880_000),
  "M2-002": usd(810_000),
  "M2-003": usd(1_000_000),
  "M2-004": usd(940_000),
  "M2-005": usd(1_000_000),
  "M2-006": usd(630_000),
};

/** Resumen de capital (literales sumados a mano de las dos tablas anteriores y de la semilla de finanzas). */
export const OWN_CAPITAL_TOTAL: Money = usd(28_700_000); // C de M2-001…006: 55.000 + 62.000 + 48.000 + 38.000 + 34.000 + 50.000 = 287.000
export const EXTERNAL_CAPITAL_TOTAL: Money = usd(5_260_000); // 880.000 + 810.000 + 1.000.000 + 940.000 + 1.000.000 + 630.000 ¢
