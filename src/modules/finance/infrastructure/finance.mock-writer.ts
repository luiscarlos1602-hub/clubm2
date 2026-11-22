import { err, ok } from "@/shared/domain/result";
import { upsertBy, type SliceStore } from "@/shared/infrastructure/demo-store";
import { parseRecord } from "@/shared/infrastructure/zod-schemas";
import type { ProjectBudgetWriter, ProjectEconomicsWriter } from "../application/ports";
import type { ProjectBudget } from "../domain/budget";
import type { ProjectEconomics } from "../domain/project-economics";
import { budgetSchema, economicsSchema, type FinanceSlice } from "./seed";

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
