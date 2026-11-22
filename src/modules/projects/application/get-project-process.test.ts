import { describe, expect, it } from "vitest";
import { isoDate } from "@/shared/domain/calendar-date";
import { asId } from "@/shared/domain/id";
import type { Project, ProjectCode, ProjectId, PropertyId } from "../domain/project";
import type { ProcessStep, ProjectProcess } from "../domain/process";
import { createGetProjectProcess } from "./get-project-process";

const d = (offsetDays: number): ProcessStep => ({ status: "done", offsetDays, started: true });
const c = (offsetDays: number): ProcessStep => ({ status: "current", offsetDays, started: true });
const u = (offsetDays: number): ProcessStep => ({ status: "upcoming", offsetDays, started: false });

const ID = asId<"Project">("prj_el_hatillo_01") as ProjectId;

function project(acquiredOn: string | null): Project {
  return {
    id: ID,
    code: "M2-005" as ProjectCode,
    slug: "m2-005-el-hatillo",
    name: "Casa El Hatillo",
    propertyId: asId<"Property">("prp_el_hatillo_01") as PropertyId,
    status: "on_sale",
    timeline: {
      acquiredOn: acquiredOn === null ? null : isoDate(acquiredOn),
      saleSignedOn: null,
      settledOn: null,
    },
  };
}

const PROCESS: ProjectProcess = {
  projectId: ID,
  steps: {
    works_start: d(10),
    works_50: d(50),
    works_80: d(100),
    sale_start: d(120),
    on_sale: c(135),
    sold: u(300),
  },
};

function deps(p: Project | null, process: ProjectProcess | null) {
  return {
    projects: { list: async () => (p === null ? [] : [p]) },
    content: {
      processOf: async (id: ProjectId) =>
        process !== null && id === process.projectId ? process : null,
    },
  };
}

describe("getProjectProcess", () => {
  it("devuelve la línea de tiempo por código, con fechas desde la compra", async () => {
    const get = createGetProjectProcess(deps(project("2026-01-01"), PROCESS));
    const timeline = await get("M2-005");
    expect(timeline?.map((s) => s.stage)).toEqual([
      "works_start",
      "works_50",
      "works_80",
      "sale_start",
      "on_sale",
      "sold",
    ]);
    expect(timeline?.[0]?.date).toBe("2026-01-11");
    expect(timeline?.[5]?.estimated).toBe(true);
  });

  it("código inexistente, acquiredOn null o sin proceso → null", async () => {
    expect(
      await createGetProjectProcess(deps(project("2026-01-01"), PROCESS))("M2-999"),
    ).toBeNull();
    expect(await createGetProjectProcess(deps(project(null), PROCESS))("M2-005")).toBeNull();
    expect(await createGetProjectProcess(deps(project("2026-01-01"), null))("M2-005")).toBeNull();
  });

  it("un proceso que no pasa checkProjectProcess rechaza", async () => {
    const broken: ProjectProcess = { ...PROCESS, steps: { ...PROCESS.steps, works_50: d(1) } };
    await expect(
      createGetProjectProcess(deps(project("2026-01-01"), broken))("M2-005"),
    ).rejects.toThrow(/DECREASING_OFFSETS/);
  });

  it("un repositorio que lanza en síncrono se convierte en rechazo", async () => {
    const get = createGetProjectProcess({
      projects: {
        list: () => {
          throw new Error("repo roto");
        },
      },
      content: { processOf: async () => null },
    });
    await expect(get("M2-005")).rejects.toThrow("repo roto");
  });
});
