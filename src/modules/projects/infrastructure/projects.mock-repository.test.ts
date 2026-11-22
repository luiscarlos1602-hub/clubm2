import { describe, expect, it } from "vitest";
import { asId } from "@/shared/domain/id";
import { isoDate } from "@/shared/domain/calendar-date";
import { fixedClock } from "@/shared/domain/clock";
import type { ProjectId, PropertyId } from "../domain/project";
import { createProjectMockRepository, createPropertyMockRepository } from "./projects.mock-repository";
import { buildProjectsSeed } from "./seed";

const slice = buildProjectsSeed(fixedClock(isoDate("2026-11-22")));
const source = { read: () => slice };

describe("Repos mock de projects", () => {
  it("list ordena por código y no muta el slice", async () => {
    const shuffled = { read: () => ({ ...slice, projects: [...slice.projects].reverse() }) };
    const list = await createProjectMockRepository(shuffled).list();
    expect(list.map((p) => p.code)).toEqual([...list.map((p) => p.code)].sort());
    expect(list).toHaveLength(7);
    expect(shuffled.read().projects[0].code).toBe("M2-007");
  });

  it("findBySlug encuentra y lo desconocido da null", async () => {
    const repo = createProjectMockRepository(source);
    expect((await repo.findBySlug("m2-003-chacao"))?.code).toBe("M2-003");
    expect(await repo.findBySlug("nada")).toBeNull();
    expect(await repo.findById(asId<"Project">("prj_nada_01") as ProjectId)).toBeNull();
    expect((await repo.findById(slice.projects[0].id))?.id).toBe(slice.projects[0].id);
  });

  it("inmuebles: list y findById", async () => {
    const repo = createPropertyMockRepository(source);
    expect(await repo.list()).toHaveLength(7);
    expect((await repo.findById(slice.properties[0].id))?.id).toBe(slice.properties[0].id);
    expect(await repo.findById(asId<"Property">("prop_nada_01") as PropertyId)).toBeNull();
  });
});
