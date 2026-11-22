import { describe, expect, it, vi } from "vitest";
import { isoDate } from "@/shared/domain/calendar-date";
import { fixedClock } from "@/shared/domain/clock";
import { ok, type DomainError } from "@/shared/domain/result";
import type { Project } from "../domain/project";
import type { ProjectStatus } from "../domain/project-status";
import { createChangeProjectStage, type PublishGuard } from "./change-project-stage";
import { contractProject } from "./projects-repository.contract";

const TODAY = isoDate("2026-11-22");
const PRE = { acquiredOn: null, saleSignedOn: null, settledOn: null };

function setup(stored: Project | null, missing: readonly DomainError[] = []) {
  const projects = {
    findById: vi.fn(() => Promise.resolve(stored)),
    save: vi.fn((p: Project) => Promise.resolve(ok(p))),
  };
  const publishGuard = vi.fn<PublishGuard>(() => Promise.resolve(missing));
  const change = createChangeProjectStage({ projects, clock: fixedClock(TODAY), publishGuard });
  return { projects, publishGuard, change };
}

const at = (status: ProjectStatus, timeline: Project["timeline"] = PRE): Project => ({
  ...contractProject,
  status,
  timeline,
});

describe("changeProjectStage (W-3)", () => {
  it("opportunity → due_diligence guarda sin sellar fechas ni pedir requisitos", async () => {
    const { change, projects, publishGuard } = setup(at("opportunity"));
    const r = await change(contractProject.id, "due_diligence");
    expect(r).toEqual(ok(at("due_diligence")));
    expect(projects.save).toHaveBeenCalledOnce();
    expect(publishGuard).not.toHaveBeenCalled();
  });

  it("due_diligence → acquired sella la fecha de compra con hoy", async () => {
    const { change } = setup(at("due_diligence"));
    const r = await change(contractProject.id, "acquired");
    expect(r.ok && r.value.timeline.acquiredOn).toBe(TODAY);
  });

  it("due_diligence → discarded es válido (L4)", async () => {
    const { change } = setup(at("due_diligence"));
    expect((await change(contractProject.id, "discarded")).ok).toBe(true);
  });

  it("acquired → funding pide los requisitos para publicar y guarda si no falta nada", async () => {
    const acquired = at("acquired", { ...PRE, acquiredOn: isoDate("2026-10-01") });
    const { change, publishGuard, projects } = setup(acquired);
    const r = await change(contractProject.id, "funding");
    expect(r.ok && r.value.status).toBe("funding");
    expect(publishGuard).toHaveBeenCalledWith({ ...acquired, status: "funding" });
    expect(projects.save).toHaveBeenCalledOnce();
  });

  it("acquired → funding con requisitos pendientes → NOT_READY_TO_PUBLISH y no guarda", async () => {
    const acquired = at("acquired", { ...PRE, acquiredOn: isoDate("2026-10-01") });
    const { change, projects } = setup(acquired, [
      { code: "REQUIRED_FOR_PUBLISHED", detail: "falta el proceso" },
      { code: "MISSING_REQUIRED_IMAGES" },
    ]);
    const r = await change(contractProject.id, "funding");
    expect(r).toEqual({
      ok: false,
      error: { code: "NOT_READY_TO_PUBLISH", detail: "falta el proceso; MISSING_REQUIRED_IMAGES" },
    });
    expect(projects.save).not.toHaveBeenCalled();
  });

  it("entre etapas ya publicadas no vuelve a pedir requisitos", async () => {
    const { change, publishGuard } = setup(contractProject); // funding
    expect((await change(contractProject.id, "renovation")).ok).toBe(true);
    expect(publishGuard).not.toHaveBeenCalled();
  });

  it.each(["sold", "settled"] as const)("→ %s queda para W-5", async (to) => {
    const { change, projects } = setup(at("on_sale", { ...PRE, acquiredOn: isoDate("2026-10-01") }));
    const r = await change(contractProject.id, to);
    expect(!r.ok && r.error.code).toBe("STAGE_RESERVED_FOR_SETTLEMENT");
    expect(projects.findById).not.toHaveBeenCalled();
  });

  it("transición inválida → INVALID_TRANSITION sin guardar", async () => {
    const { change, projects } = setup(at("opportunity"));
    const r = await change(contractProject.id, "acquired");
    expect(!r.ok && r.error.code).toBe("INVALID_TRANSITION");
    expect(projects.save).not.toHaveBeenCalled();
  });

  it("proyecto inexistente → PROJECT_NOT_FOUND", async () => {
    const { change } = setup(null);
    const r = await change(contractProject.id, "renovation");
    expect(!r.ok && r.error.code).toBe("PROJECT_NOT_FOUND");
  });

  it("compra con fecha futura frente a hoy → DATE_OUT_OF_ORDER", async () => {
    const future = at("on_sale", { ...PRE, acquiredOn: isoDate("2026-12-15") });
    const { change } = setup(future);
    const r = await change(contractProject.id, "stalled");
    expect(!r.ok && r.error.code).toBe("DATE_OUT_OF_ORDER");
  });

  it("pasa tal cual el error del repositorio", async () => {
    const { projects, change } = setup(at("opportunity"));
    projects.save.mockResolvedValueOnce({ ok: false, error: { code: "INVALID_RECORD" } } as never);
    const r = await change(contractProject.id, "due_diligence");
    expect(!r.ok && r.error.code).toBe("INVALID_RECORD");
  });
});
