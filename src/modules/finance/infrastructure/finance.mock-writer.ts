import { err, ok, type Result } from "@/shared/domain/result";
import type { RepositoryWriteError } from "@/shared/domain/repository-write";
import { upsertBy, type SliceStore } from "@/shared/infrastructure/demo-store";
import { parseRecord } from "@/shared/infrastructure/zod-schemas";
import type { ProjectBudgetWriter, ProjectEconomicsWriter } from "../application/ports";
import type { ProjectBudget } from "../domain/budget";
import type { ProjectEconomics } from "../domain/project-economics";
import type { ProjectSale } from "../domain/project-sale";
import type { Settlement } from "../domain/settlement";
import { budgetSchema, economicsSchema, saleSchema, settlementSchema, type FinanceSlice } from "./seed";

const sameProject = (a: { readonly projectId: string }, b: { readonly projectId: string }) =>
  a.projectId === b.projectId;

/** W-1. Escribe en el slice `finance` del snapshot local; mismas reglas que el contrato del puerto. */
export function createProjectEconomicsMockWriter(source: SliceStore<FinanceSlice>): ProjectEconomicsWriter {
  return {
    save(economics) {
      const parsed = parseRecord<ProjectEconomics>(economicsSchema, economics);
      if (!parsed.ok) return Promise.resolve(parsed);
      source.update((s) => ({ ...s, economics: upsertBy(s.economics, parsed.value, sameProject) }));
      return Promise.resolve(ok(parsed.value));
    },
  };
}

export function createProjectBudgetMockWriter(source: SliceStore<FinanceSlice>): ProjectBudgetWriter {
  return {
    save(budget) {
      const parsed = parseRecord<ProjectBudget>(budgetSchema, budget);
      if (!parsed.ok) return Promise.resolve(parsed);
      if (!source.read().economics.some((e) => e.projectId === parsed.value.projectId)) {
        return Promise.resolve(err("REFERENCE_NOT_FOUND", `el proyecto ${parsed.value.projectId} no tiene economía`));
      }
      source.update((s) => ({ ...s, budgets: upsertBy(s.budgets, parsed.value, sameProject) }));
      return Promise.resolve(ok(parsed.value));
    },
  };
}

/**
 * W-5. Parte "finance" del guardado atómico de la venta: valida y añade la venta al slice `finance.sales`.
 * DUPLICATE si el proyecto ya tiene venta; INVALID_RECORD por esquema. El proyecto lo escribe el escritor de composition.
 */
export function recordSaleInSlice(
  source: SliceStore<FinanceSlice>,
  sale: ProjectSale,
): Result<ProjectSale, RepositoryWriteError> {
  const parsed = parseRecord<ProjectSale>(saleSchema, sale);
  if (!parsed.ok) return parsed;
  if (source.read().sales.some((x) => x.projectId === parsed.value.projectId)) {
    return err("DUPLICATE", `el proyecto ${parsed.value.projectId} ya tiene venta registrada`);
  }
  source.update((s) => ({ ...s, sales: [...s.sales, parsed.value] }));
  return ok(parsed.value);
}

/**
 * W-5. Parte "finance" del guardado atómico de la liquidación: valida y añade la liquidación al slice.
 * REFERENCE_NOT_FOUND si el proyecto no tiene venta; DUPLICATE si ya hay liquidación; INVALID_RECORD por esquema.
 */
export function recordSettlementInSlice(
  source: SliceStore<FinanceSlice>,
  settlement: Settlement,
): Result<Settlement, RepositoryWriteError> {
  const parsed = parseRecord<Settlement>(settlementSchema, settlement);
  if (!parsed.ok) return parsed;
  const current = source.read();
  if (!current.sales.some((x) => x.projectId === parsed.value.projectId)) {
    return err("REFERENCE_NOT_FOUND", `el proyecto ${parsed.value.projectId} no tiene venta registrada`);
  }
  if (current.settlements.some((x) => x.projectId === parsed.value.projectId)) {
    return err("DUPLICATE", `el proyecto ${parsed.value.projectId} ya está liquidado`);
  }
  source.update((s) => ({ ...s, settlements: [...s.settlements, parsed.value] }));
  return ok(parsed.value);
}
