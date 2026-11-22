import { describe, expect, it, vi } from "vitest";
import { isoDate } from "@/shared/domain/calendar-date";
import { ok } from "@/shared/domain/result";
import type { Project } from "../domain/project";
import { contractProject, contractProperty } from "./projects-repository.contract";
import { createSaveProject, createSaveProperty } from "./save-project";

describe("saveProject (W-1)", () => {
  const writer = () => ({ save: vi.fn((p: Project) => Promise.resolve(ok(p))) });

  it("guarda un proyecto coherente", async () => {
    const projects = writer();
    expect(await createSaveProject({ projects })(contractProject)).toEqual(ok(contractProject));
    expect(projects.save).toHaveBeenCalledOnce();
  });

  it.each([
    ["INCONSISTENT_TIMELINE", { status: "sold" }],
    ["INCONSISTENT_TIMELINE", { status: "opportunity" }],
    ["INVALID_PROJECT_SLUG", { slug: "Mal Slug" }],
    ["INVALID_PROJECT_NAME", { name: "   " }],
  ] as const)("rechaza con %s sin llamar al repositorio", async (code, change) => {
    const projects = writer();
    const r = await createSaveProject({ projects })({ ...contractProject, ...change } as Project);
    expect(!r.ok && r.error.code).toBe(code);
    expect(projects.save).not.toHaveBeenCalled();
  });

  it("pasa tal cual el error del repositorio", async () => {
    const save = vi.fn(() => Promise.resolve({ ok: false as const, error: { code: "DUPLICATE" as const } }));
    const r = await createSaveProject({ projects: { save } })({
      ...contractProject,
      timeline: { ...contractProject.timeline, acquiredOn: isoDate("2026-10-02") },
    });
    expect(!r.ok && r.error.code).toBe("DUPLICATE");
  });
});

describe("saveProperty (W-1)", () => {
  it("valida con checkProperty antes de guardar", async () => {
    const save = vi.fn((p: typeof contractProperty) => Promise.resolve(ok(p)));
    const saveProperty = createSaveProperty({ properties: { save } });
    expect((await saveProperty(contractProperty)).ok).toBe(true);
    const bad = await saveProperty({ ...contractProperty, zone: "" });
    expect(!bad.ok && bad.error.code).toBe("INVALID_PROPERTY");
    expect(save).toHaveBeenCalledOnce();
  });
});
