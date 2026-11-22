import { err, ok } from "@/shared/domain/result";
import { upsertBy, type SliceStore } from "@/shared/infrastructure/demo-store";
import { parseRecord } from "@/shared/infrastructure/zod-schemas";
import type { ProjectContentWriter } from "../application/ports";
import type { ProjectProcess } from "../domain/process";
import type { ProjectRisks } from "../domain/project-risk";
import type { PropertyProfile } from "../domain/property-profile";
import { processSchema, profileSchema, risksSchema, type ProjectsSlice } from "./seed";

/** W-2. Upsert del contenido de la ficha en el slice `projects`; mismas reglas que el contrato del puerto. */
export function createProjectContentMockWriter(source: SliceStore<ProjectsSlice>): ProjectContentWriter {
  return {
    saveProfile(profile) {
      const parsed = parseRecord<PropertyProfile>(profileSchema, profile);
      if (!parsed.ok) return Promise.resolve(parsed);
      const next = parsed.value;
      if (!source.read().properties.some((p) => p.id === next.propertyId)) {
        return Promise.resolve(err("REFERENCE_NOT_FOUND", `no existe el inmueble ${next.propertyId}`));
      }
      source.update((s) => ({
        ...s,
        profiles: upsertBy(s.profiles, next, (a, b) => a.propertyId === b.propertyId),
      }));
      return Promise.resolve(ok(next));
    },
    saveProcess(process) {
      const parsed = parseRecord<ProjectProcess>(processSchema, process);
      if (!parsed.ok) return Promise.resolve(parsed);
      const next = parsed.value;
      if (!source.read().projects.some((p) => p.id === next.projectId)) {
        return Promise.resolve(err("REFERENCE_NOT_FOUND", `no existe el proyecto ${next.projectId}`));
      }
      source.update((s) => ({
        ...s,
        processes: upsertBy(s.processes, next, (a, b) => a.projectId === b.projectId),
      }));
      return Promise.resolve(ok(next));
    },
    saveRisks(risks) {
      const parsed = parseRecord<ProjectRisks>(risksSchema, risks);
      if (!parsed.ok) return Promise.resolve(parsed);
      const next = parsed.value;
      if (!source.read().projects.some((p) => p.id === next.projectId)) {
        return Promise.resolve(err("REFERENCE_NOT_FOUND", `no existe el proyecto ${next.projectId}`));
      }
      source.update((s) => ({
        ...s,
        risks: upsertBy(s.risks, next, (a, b) => a.projectId === b.projectId),
      }));
      return Promise.resolve(ok(next));
    },
  };
}
