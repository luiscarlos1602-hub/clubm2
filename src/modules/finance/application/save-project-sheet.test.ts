import { describe, expect, it, vi } from "vitest";
import { isoDate } from "@/shared/domain/calendar-date";
import { fixedClock } from "@/shared/domain/clock";
import { asId, type IdGenerator } from "@/shared/domain/id";
import { usdUnits } from "@/shared/domain/money";
import { ok } from "@/shared/domain/result";
import { buildProjectSheet } from "../domain/build-project-sheet";
import type { ProjectSheet } from "../domain/project-sheet";
import { CREATE_CTX, PUBLISHABLE_INPUT, SEED_CODES, TODAY } from "../domain/project-sheet.test-fixtures";
import { createSaveProjectSheet, type SaveProjectSheetDeps } from "./save-project-sheet";

let counter = 0;
const testIds: IdGenerator = { next: (prefix) => asId(`${prefix}_t${(counter += 1)}`) };

const existingBuilt = buildProjectSheet(PUBLISHABLE_INPUT, CREATE_CTX);
if (!existingBuilt.ok) throw new Error("fixture inválida");
const EXISTING = existingBuilt.value;

function setup(over: Partial<SaveProjectSheetDeps> = {}) {
  const save = vi.fn((s: ProjectSheet) => Promise.resolve(ok(s)));
  const deps: SaveProjectSheetDeps = {
    getSheet: (slug) => Promise.resolve(slug === EXISTING.project.slug ? EXISTING : null),
    projects: { list: () => Promise.resolve(SEED_CODES.map((code) => ({ code }) as never)) },
    writer: { save },
    ids: testIds,
    clock: fixedClock(TODAY),
    codePrefix: "M2",
    checkParticipationClass: (c) => ok(c),
    ...over,
  };
  return { run: createSaveProjectSheet(deps), save };
}

describe("saveProjectSheet", () => {
  it("alta: asigna el código siguiente, genera ids y escribe una vez", async () => {
    const { run, save } = setup();
    const r = await run(PUBLISHABLE_INPUT, null);
    expect(r.ok && r.value.project.code).toBe("M2-008");
    expect(r.ok && r.value.project.id).toMatch(/^prj_/);
    expect(save).toHaveBeenCalledTimes(1);
  });

  it("errores de negocio: devuelve todos con su campo y no escribe", async () => {
    const { run, save } = setup();
    const r = await run(
      { ...PUBLISHABLE_INPUT, economics: { ...PUBLISHABLE_INPUT.economics, recoveryBudget: usdUnits(9_000) } },
      null,
    );
    expect(!r.ok && r.error.some((e) => "field" in e && e.field === "economics.recoveryBudget")).toBe(true);
    expect(save).not.toHaveBeenCalled();
  });

  it("edición: conserva código y slug; compra futura se rechaza con el reloj inyectado", async () => {
    const { run } = setup({ clock: fixedClock(isoDate("2026-11-01")) });
    const r = await run(
      { ...PUBLISHABLE_INPUT, projectId: EXISTING.project.id, project: { ...PUBLISHABLE_INPUT.project, name: "Otro" } },
      EXISTING.project.slug,
    );
    expect(!r.ok && r.error.some((e) => e.code === "ACQUIRED_IN_FUTURE")).toBe(true);
    const ok2 = await setup().run(
      { ...PUBLISHABLE_INPUT, projectId: EXISTING.project.id, project: { ...PUBLISHABLE_INPUT.project, name: "Otro" } },
      EXISTING.project.slug,
    );
    expect(ok2.ok && [ok2.value.project.code, ok2.value.project.slug, ok2.value.project.name]).toEqual([
      "M2-008",
      EXISTING.project.slug,
      "Otro",
    ]);
  });

  it("slug inexistente: REFERENCE_NOT_FOUND sin escribir", async () => {
    const { run, save } = setup();
    const r = await run(PUBLISHABLE_INPUT, "no-existe");
    expect(!r.ok && r.error[0]?.code).toBe("REFERENCE_NOT_FOUND");
    expect(save).not.toHaveBeenCalled();
  });

  it("rechazo del escritor: se devuelve como error", async () => {
    const { run } = setup({
      writer: { save: () => Promise.resolve({ ok: false, error: { code: "DUPLICATE" } }) },
    });
    const r = await run(PUBLISHABLE_INPUT, null);
    expect(!r.ok && r.error).toEqual([{ code: "DUPLICATE" }]);
  });
});
