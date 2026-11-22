import type { ProjectSheetWriter } from "@/modules/finance/application/ports";
import {
  createProjectBudgetMockWriter,
  createProjectEconomicsMockWriter,
} from "@/modules/finance/infrastructure/finance.mock-writer";
import { createParticipationClassMockWriter } from "@/modules/participations/infrastructure/participations.mock-writer";
import { createProjectContentMockWriter } from "@/modules/projects/infrastructure/projects.content-writer";
import { createProjectMediaMockWriter } from "@/modules/projects/infrastructure/projects.media";
import { createProjectMockWriter, createPropertyMockWriter } from "@/modules/projects/infrastructure/projects.mock-writer";
import { ok, type DomainError, type Result } from "@/shared/domain/result";
import type { RepositoryWriteError } from "@/shared/domain/repository-write";
import { memorySlice, type DemoStore } from "@/shared/infrastructure/demo-store";
import type { DemoSnapshot } from "./demo-snapshot";

/**
 * Escritor de ficha de la demo (plan 011 §3, CA14). Aplica los writers de W-1 y de contenido/imágenes sobre
 * copias en memoria de los tres slices y, solo si TODOS aceptan, hace un único `store.write`: si cualquier
 * parte se rechaza, el almacén queda como estaba. Reemplazado en DB-4 por la RPC transaccional.
 */
export function createDemoProjectSheetWriter(store: DemoStore<DemoSnapshot>): ProjectSheetWriter {
  return {
    async save(sheet) {
      const base = store.read();
      const projects = memorySlice(base.projects);
      const participations = memorySlice(base.participations);
      const finance = memorySlice(base.finance);
      const projectWriter = createProjectMockWriter(projects);
      const propertyWriter = createPropertyMockWriter(projects);
      const content = createProjectContentMockWriter(projects);
      const media = createProjectMediaMockWriter(projects);
      const classes = createParticipationClassMockWriter(participations);
      const economics = createProjectEconomicsMockWriter(finance);
      const budgets = createProjectBudgetMockWriter(finance);

      const fail = (r: Result<unknown, DomainError>): Result<never, RepositoryWriteError> | null =>
        r.ok ? null : { ok: false, error: r.error as RepositoryWriteError };

      // Orden por dependencias: inmueble → proyecto → contenido → clase → economía → presupuesto → imágenes.
      const steps: readonly (() => Promise<Result<unknown, DomainError>>)[] = [
        () => propertyWriter.save(sheet.property),
        () => projectWriter.save(sheet.project),
        ...(sheet.profile === null ? [] : [() => content.saveProfile(sheet.profile!)]),
        ...(sheet.process === null ? [] : [() => content.saveProcess(sheet.process!)]),
        ...(sheet.risks === null ? [] : [() => content.saveRisks(sheet.risks!)]),
        ...(sheet.participationClass === null ? [] : [() => classes.save(sheet.participationClass!)]),
        () => economics.save(sheet.economics),
        () => budgets.save(sheet.budget),
        () => media.replaceImages(sheet.project.id, sheet.images),
      ];
      for (const step of steps) {
        const failure = fail(await step());
        if (failure !== null) return failure;
      }
      store.write({
        ...store.read(),
        projects: projects.read(),
        participations: participations.read(),
        finance: finance.read(),
      });
      return ok(sheet);
    },
  };
}
