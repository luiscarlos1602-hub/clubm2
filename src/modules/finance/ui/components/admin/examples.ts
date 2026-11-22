import { usd, usdUnits, type Money } from "@/shared/domain/money";

// Ejemplos del backoffice de finanzas (ADR-012). Montos en centavos, con origen citado.

/** Participaciones colocadas por código, de 100 (semilla de participaciones, USD 100 cada una). */
export const PLACED_BY_CODE: Readonly<Record<string, number>> = {
  "M2-001": 88,
  "M2-002": 81,
  "M2-003": 100,
  "M2-004": 94,
  "M2-005": 100,
  "M2-006": 63,
};

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

/** Precio unitario de la participación (ref. maestro: USD 100). */
export const UNIT_PRICE: Money = usdUnits(100);
export const TOTAL_PARTICIPATIONS = 100;
