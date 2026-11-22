import type { SliceReader } from "@/shared/infrastructure/demo-store";
import type { ProjectContentRepository, ProjectRepository, PropertyRepository } from "../application/ports";
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

export function createProjectContentMockRepository(source: SliceReader<ProjectsSlice>): ProjectContentRepository {
  return {
    profileOf: (propertyId) =>
      Promise.resolve(source.read().profiles.find((p) => p.propertyId === propertyId) ?? null),
    processOf: (projectId) =>
      Promise.resolve(source.read().processes.find((p) => p.projectId === projectId) ?? null),
    updatesOf: (projectId) =>
      Promise.resolve(source.read().updates.filter((u) => u.projectId === projectId)),
    risksOf: (projectId) => Promise.resolve(source.read().risks.find((r) => r.projectId === projectId) ?? null),
  };
}
