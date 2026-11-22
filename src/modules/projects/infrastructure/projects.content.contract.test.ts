import { isoDate } from "@/shared/domain/calendar-date";
import { fixedClock } from "@/shared/domain/clock";
import { memorySlice, type SliceStore } from "@/shared/infrastructure/demo-store";
import { describeProjectContentContract } from "../application/project-content.contract";
import { createProjectContentMockWriter } from "./projects.content-writer";
import { createProjectMediaMockRepository, createProjectMediaMockWriter } from "./projects.media";
import {
  createProjectContentMockRepository,
  createProjectMockRepository,
  createPropertyMockRepository,
} from "./projects.mock-repository";
import { createProjectMockWriter, createPropertyMockWriter } from "./projects.mock-writer";
import { buildProjectsSeed, projectsSliceSchema, type ProjectsSlice } from "./seed";

const EMPTY: ProjectsSlice = { properties: [], projects: [], profiles: [], processes: [], updates: [], risks: [], images: [] };

function subject(slice: SliceStore<ProjectsSlice>) {
  return {
    projects: { ...createProjectMockRepository(slice), ...createProjectMockWriter(slice) },
    properties: { ...createPropertyMockRepository(slice), ...createPropertyMockWriter(slice) },
    content: { ...createProjectContentMockRepository(slice), ...createProjectContentMockWriter(slice) },
    media: { ...createProjectMediaMockRepository(slice), ...createProjectMediaMockWriter(slice) },
  };
}

describeProjectContentContract("mock vacío", () => subject(memorySlice(EMPTY)));
describeProjectContentContract("mock con semillas", () =>
  subject(memorySlice(buildProjectsSeed(fixedClock(isoDate("2026-11-22"))))),
);
