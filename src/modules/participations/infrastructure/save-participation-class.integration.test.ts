import { describe, expect, it } from "vitest";
import type { Project } from "@/modules/projects";
import { memorySlice } from "@/shared/infrastructure/demo-store";
import { contractClass } from "../application/participations-repository.contract";
import { createSaveParticipationClass } from "../application/save-participation-class";
import { createParticipationClassMockWriter } from "./participations.mock-writer";
import type { ParticipationsSlice } from "./seed";

function setup(projectExists = true) {
  const slice = memorySlice<ParticipationsSlice>({ classes: [], participations: [] });
  const save = createSaveParticipationClass({
    projects: { findById: (id) => Promise.resolve(projectExists ? ({ id } as Project) : null) },
    classes: createParticipationClassMockWriter(slice),
  });
  return { save, slice };
}

describe("saveParticipationClass (W-1)", () => {
  it("guarda una clase válida", async () => {
    const s = setup();
    expect((await s.save(contractClass)).ok).toBe(true);
    expect(s.slice.read().classes).toEqual([contractClass]);
  });

  it("acepta una clase totalmente colocada (placed = total)", async () => {
    const s = setup();
    expect((await s.save({ ...contractClass, placed: 100 })).ok).toBe(true);
  });

  it.each([{ placed: 101 }, { total: 0 }, { placed: -1 }])("rechaza %o con INVALID_PARTICIPATION_CLASS", async (change) => {
    const s = setup();
    const r = await s.save({ ...contractClass, ...change });
    expect(!r.ok && r.error.code).toBe("INVALID_PARTICIPATION_CLASS");
    expect(s.slice.read().classes).toEqual([]);
  });

  it("sin proyecto → PROJECT_NOT_FOUND", async () => {
    const r = await setup(false).save(contractClass);
    expect(!r.ok && r.error.code).toBe("PROJECT_NOT_FOUND");
  });
});
