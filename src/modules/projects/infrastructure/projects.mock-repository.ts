import type { SliceReader } from "@/shared/infrastructure/demo-store";
import type { ProjectRepository, PropertyRepository } from "../application/ports";
import type { ProjectsSlice } from "./seed";

export function createProjectMockRepository(source: SliceReader<ProjectsSlice>): ProjectRepository {
  return {
    list: () =>
      Promise.resolve(
        [...source.read().projects].sort((a, b) => (a.code < b.code ? -1 : a.code > b.code ? 1 : 0)),
      ),
    findById: (id) => Promise.resolve(source.read().projects.find((p) => p.id === id) ?? null),
    findBySlug: (slug) => Promise.resolve(source.read().projects.find((p) => p.slug === slug) ?? null),
  };
}

export function createPropertyMockRepository(source: SliceReader<ProjectsSlice>): PropertyRepository {
  return {
    list: () => Promise.resolve([...source.read().properties]),
    findById: (id) => Promise.resolve(source.read().properties.find((p) => p.id === id) ?? null),
  };
}
