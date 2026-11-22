import { isoDate } from "@/shared/domain/calendar-date";
import { fixedClock } from "@/shared/domain/clock";
import { memorySlice, type SliceStore } from "@/shared/infrastructure/demo-store";
import { describeProjectsRepositoryContract } from "../application/projects-repository.contract";
import { createProjectMockRepository, createPropertyMockRepository } from "./projects.mock-repository";
import { createProjectMockWriter, createPropertyMockWriter } from "./projects.mock-writer";
import { buildProjectsSeed, type ProjectsSlice } from "./seed";

const EMPTY: ProjectsSlice = { properties: [], projects: [], profiles: [], processes: [], updates: [], risks: [] };

function subject(slice: SliceStore<ProjectsSlice>) {
  return {
    projects: { ...createProjectMockRepository(slice), ...createProjectMockWriter(slice) },
    properties: { ...createPropertyMockRepository(slice), ...createPropertyMockWriter(slice) },
  };
}

describeProjectsRepositoryContract("mock vacío", () => subject(memorySlice(EMPTY)));
describeProjectsRepositoryContract("mock con semillas", () =>
  subject(memorySlice(buildProjectsSeed(fixedClock(isoDate("2026-11-22"))))),
);
