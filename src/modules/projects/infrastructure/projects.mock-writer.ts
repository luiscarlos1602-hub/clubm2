import { err, ok } from "@/shared/domain/result";
import { upsertBy, type SliceStore } from "@/shared/infrastructure/demo-store";
import { parseRecord } from "@/shared/infrastructure/zod-schemas";
import type { ProjectWriter, PropertyWriter } from "../application/ports";
import type { Project, Property } from "../domain/project";
import { projectSchema, propertySchema, type ProjectsSlice } from "./seed";

const sameId = (a: { readonly id: string }, b: { readonly id: string }) => a.id === b.id;

/** W-1. Escribe en el slice `projects` del snapshot local; mismas reglas que el contrato del puerto. */
export function createProjectMockWriter(source: SliceStore<ProjectsSlice>): ProjectWriter {
  return {
    save(project) {
      const parsed = parseRecord<Project>(projectSchema, project);
      if (!parsed.ok) return Promise.resolve(parsed);
      const next = parsed.value;
      const current = source.read();
      if (!current.properties.some((p) => p.id === next.propertyId)) {
        return Promise.resolve(err("REFERENCE_NOT_FOUND", `no existe el inmueble ${next.propertyId}`));
      }
      const clash = current.projects.find((p) => p.id !== next.id && (p.code === next.code || p.slug === next.slug));
      if (clash !== undefined) {
        const field = clash.code === next.code ? `el código ${next.code}` : `el slug ${next.slug}`;
        return Promise.resolve(err("DUPLICATE", `${field} ya lo usa otro proyecto`));
      }
      source.update((s) => ({ ...s, projects: upsertBy(s.projects, next, sameId) }));
      return Promise.resolve(ok(next));
    },
  };
}

export function createPropertyMockWriter(source: SliceStore<ProjectsSlice>): PropertyWriter {
  return {
    save(property) {
      const parsed = parseRecord<Property>(propertySchema, property);
      if (!parsed.ok) return Promise.resolve(parsed);
      const next = parsed.value;
      source.update((s) => ({ ...s, properties: upsertBy(s.properties, next, sameId) }));
      return Promise.resolve(ok(next));
    },
  };
}
