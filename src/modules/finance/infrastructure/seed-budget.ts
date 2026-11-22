import { asId } from "@/shared/domain/id";
import { usd } from "@/shared/domain/money";
import type { BudgetItem, BudgetLine, ProjectBudget } from "../domain/budget";

/**
 * Presupuesto integral F por líneas (docs/02 §6). Montos en centavos, de ejemplo y por definir.
 * Obra USD 5.000 + bolsa USD 5.000 (honorarios 2.500 · contingencia 1.500 · reserva 1.000) [SUPUESTO Q1].
 * Clave = parte final del id del proyecto (`prj_<key>`).
 */

type WorksLine = readonly [BudgetItem, number];

const FEES: readonly BudgetLine[] = [
  { item: "management_fee", amount: usd(250_000) },
  { item: "contingency", amount: usd(150_000) },
  { item: "reserve", amount: usd(100_000) },
];

const CHACAO_02: readonly WorksLine[] = [
  ["kitchen", 130_000],
  ["bathrooms", 120_000],
  ["floors_paint", 140_000],
  ["electrical_plumbing", 110_000],
];

const WORKS: Readonly<Record<string, readonly WorksLine[]>> = {
  palos_grandes_01: [["kitchen", 140_000], ["bathrooms", 120_000], ["floors_paint", 130_000], ["electrical_plumbing", 110_000]],
  hatillo_01: [["kitchen", 120_000], ["bathrooms", 90_000], ["floors_paint", 150_000], ["electrical_plumbing", 80_000], ["garden_exterior", 60_000]],
  chacao_01: [["kitchen", 130_000], ["bathrooms", 100_000], ["floors_paint", 150_000], ["electrical_plumbing", 120_000]],
  valencia_01: [["kitchen", 110_000], ["bathrooms", 110_000], ["floors_paint", 160_000], ["carpentry", 120_000]],
  paraiso_01: [["kitchen", 150_000], ["bathrooms", 100_000], ["floors_paint", 140_000], ["electrical_plumbing", 110_000]],
  chacao_02: CHACAO_02,
  // M2-007 (ejemplo de ejemplo, no se muestra): reutiliza las líneas de chacao_02.
  palos_grandes_02: CHACAO_02,
};

export function buildBudgetSeed(): ProjectBudget[] {
  return Object.entries(WORKS).map(([key, works]) => ({
    projectId: asId<"Project">(`prj_${key}`),
    lines: [...works.map(([item, cents]): BudgetLine => ({ item, amount: usd(cents) })), ...FEES],
  }));
}
