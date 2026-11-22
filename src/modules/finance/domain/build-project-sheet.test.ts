import { describe, expect, it } from "vitest";
import { isoDate } from "@/shared/domain/calendar-date";
import { usdUnits } from "@/shared/domain/money";
import { buildProjectSheet } from "./build-project-sheet";
import type { ProjectSheet, ProjectSheetContext, ProjectSheetInput } from "./project-sheet";
import { CREATE_CTX, MINIMAL_INPUT, PUBLISHABLE_INPUT } from "./project-sheet.test-fixtures";

function sheetOf(input: ProjectSheetInput, ctx: ProjectSheetContext = CREATE_CTX): ProjectSheet {
  const r = buildProjectSheet(input, ctx);
  if (!r.ok) throw new Error(JSON.stringify(r.error));
  return r.value;
}

function issuesOf(input: ProjectSheetInput, ctx: ProjectSheetContext = CREATE_CTX) {
  const r = buildProjectSheet(input, ctx);
  if (r.ok) throw new Error("se esperaban errores");
  return r.error.map((i) => ({ code: i.code, field: i.field }));
}

/** Ficha existente (alta canónica) con ajustes, como contexto de edición. */
function editCtx(patch: (s: ProjectSheet) => ProjectSheet = (s) => s): ProjectSheetContext {
  return { ...CREATE_CTX, existing: patch(sheetOf(PUBLISHABLE_INPUT)), existingCodes: [] };
}

const EDIT_INPUT: ProjectSheetInput = { ...PUBLISHABLE_INPUT, projectId: CREATE_CTX.ids.projectId };

describe("buildProjectSheet · alta", () => {
  it("caso canónico ref. 100 × USD 100 = F 10.000 en funding → ficha completa", () => {
    const s = sheetOf(PUBLISHABLE_INPUT);
    expect(s.project).toMatchObject({
      id: "prj_new_01",
      code: "M2-008",
      slug: "m2-008-los-palos-grandes",
      status: "funding",
    });
    expect(s.project.timeline).toEqual({
      acquiredOn: "2026-11-10",
      saleSignedOn: null,
      settledOn: null,
    });
    expect(s.property).toMatchObject({ id: "prop_new_01", zone: "Los Palos Grandes", areaM2: 85 });
    expect(s.participationClass).toEqual({
      id: "pcl_new_01",
      projectId: "prj_new_01",
      total: 100,
      placed: 0,
      unitPrice: usdUnits(100),
    });
    expect(s.economics).toMatchObject({
      projectId: "prj_new_01",
      recoveryBudget: usdUnits(10_000),
    });
    expect(s.budget.projectId).toBe("prj_new_01");
    expect(s.risks?.kinds).toEqual([
      "sale_below_target",
      "works_overrun",
      "slow_sale",
      "local_market",
    ]);
    expect(s.profile?.propertyId).toBe("prop_new_01");
    expect(s.process?.projectId).toBe("prj_new_01");
    expect(s.images.map((i) => [i.kind, i.isReference])).toEqual([
      ["before", true],
      ["projection", true],
    ]);
    expect(s.images.every((i) => i.projectId === "prj_new_01" && i.alt !== "")).toBe(true);
  });

  it("alta mínima en due_diligence sin perfil, clase ni imágenes → ok", () => {
    const s = sheetOf(MINIMAL_INPUT);
    expect(s.project.status).toBe("due_diligence");
    expect(s.project.timeline.acquiredOn).toBeNull();
    expect([s.profile, s.process, s.risks, s.participationClass]).toEqual([null, null, null, null]);
    expect(s.images).toEqual([]);
  });

  it("funding sin fecha, perfil, proceso, clase, riesgos comunes ni imágenes → todos los issues a la vez", () => {
    const input: ProjectSheetInput = {
      ...MINIMAL_INPUT,
      project: { ...MINIMAL_INPUT.project, status: "funding" },
      riskKinds: ["local_market"],
    };
    expect(issuesOf(input)).toEqual([
      { code: "REQUIRED_FOR_PUBLISHED", field: "project.acquiredOn" },
      { code: "REQUIRED_FOR_PUBLISHED", field: "profile" },
      { code: "REQUIRED_FOR_PUBLISHED", field: "processSteps" },
      { code: "REQUIRED_FOR_PUBLISHED", field: "participationClass" },
      { code: "MISSING_COMMON_RISKS", field: "riskKinds" },
      { code: "MISSING_REQUIRED_IMAGES", field: "images" },
    ]);
  });

  it("errores del inmueble y del nombre: uno por campo, todos juntos", () => {
    const input: ProjectSheetInput = {
      ...MINIMAL_INPUT,
      property: { city: " ", zone: "", kind: "house", areaM2: 0 },
      project: { ...MINIMAL_INPUT.project, name: "  " },
    };
    expect(issuesOf(input)).toEqual([
      { code: "INVALID_PROPERTY", field: "property.city" },
      { code: "INVALID_PROPERTY", field: "property.zone" },
      { code: "INVALID_PROPERTY", field: "property.areaM2" },
      { code: "REQUIRED_FIELD", field: "project.name" },
    ]);
  });

  it("zona sin letras → INVALID_SLUG en la zona", () => {
    const input = { ...MINIMAL_INPUT, property: { ...MINIMAL_INPUT.property, zone: "¿?" } };
    expect(issuesOf(input)).toEqual([{ code: "INVALID_SLUG", field: "property.zone" }]);
  });

  it("F ≠ total × precio → RECOVERY_BUDGET_MISMATCH en economics.recoveryBudget", () => {
    const input = {
      ...PUBLISHABLE_INPUT,
      participationClass: { total: 100, unitPrice: usdUnits(90) },
    };
    expect(issuesOf(input)).toEqual([
      { code: "RECOVERY_BUDGET_MISMATCH", field: "economics.recoveryBudget" },
    ]);
  });

  it("total × precio fuera de rango no lanza: RECOVERY_BUDGET_MISMATCH", () => {
    const input = {
      ...PUBLISHABLE_INPUT,
      participationClass: { total: 1_000_000, unitPrice: usdUnits(9_000_000_000) },
    };
    expect(issuesOf(input)).toEqual([
      { code: "RECOVERY_BUDGET_MISMATCH", field: "economics.recoveryBudget" },
    ]);
  });

  it("clase inválida → INVALID_PARTICIPATION_CLASS (y no se compara F)", () => {
    const input = {
      ...PUBLISHABLE_INPUT,
      participationClass: { total: 0, unitPrice: usdUnits(100) },
    };
    expect(issuesOf(input)).toEqual([
      { code: "INVALID_PARTICIPATION_CLASS", field: "participationClass" },
    ]);
  });

  it("Σ rubros ≠ F → BUDGET_TOTAL_MISMATCH en budgetLines", () => {
    const input = { ...PUBLISHABLE_INPUT, budgetLines: PUBLISHABLE_INPUT.budgetLines.slice(1) };
    expect(issuesOf(input)).toEqual([{ code: "BUDGET_TOTAL_MISMATCH", field: "budgetLines" }]);
  });

  it("economía inválida → INVALID_ECONOMICS en economics", () => {
    const input = {
      ...MINIMAL_INPUT,
      economics: { ...MINIMAL_INPUT.economics, targetSalePrice: usdUnits(0) },
    };
    expect(issuesOf(input)).toEqual([{ code: "INVALID_ECONOMICS", field: "economics" }]);
  });

  it("settled o stalled al crear → STATUS_NOT_CREATABLE (W2-1)", () => {
    for (const status of ["settled", "stalled", "renovation"] as const) {
      const input = { ...PUBLISHABLE_INPUT, project: { ...PUBLISHABLE_INPUT.project, status } };
      expect(issuesOf(input)).toContainEqual({
        code: "STATUS_NOT_CREATABLE",
        field: "project.status",
      });
    }
  });

  it("compra posterior a hoy → ACQUIRED_IN_FUTURE", () => {
    const input = {
      ...PUBLISHABLE_INPUT,
      project: { ...PUBLISHABLE_INPUT.project, acquiredOn: isoDate("2026-11-23") },
    };
    expect(issuesOf(input)).toEqual([{ code: "ACQUIRED_IN_FUTURE", field: "project.acquiredOn" }]);
    const today = {
      ...PUBLISHABLE_INPUT,
      project: { ...PUBLISHABLE_INPUT.project, acquiredOn: CREATE_CTX.today },
    };
    expect(buildProjectSheet(today, CREATE_CTX).ok).toBe(true);
  });

  it("fecha de compra incoherente con la etapa → INCONSISTENT_TIMELINE en project.acquiredOn", () => {
    const withDate = {
      ...MINIMAL_INPUT,
      project: { ...MINIMAL_INPUT.project, acquiredOn: isoDate("2026-11-01") },
    };
    expect(issuesOf(withDate)).toEqual([
      { code: "INCONSISTENT_TIMELINE", field: "project.acquiredOn" },
    ]);
    const acquired = {
      ...MINIMAL_INPUT,
      project: { ...MINIMAL_INPUT.project, status: "acquired" as const },
    };
    expect(issuesOf(acquired)).toEqual([
      { code: "INCONSISTENT_TIMELINE", field: "project.acquiredOn" },
    ]);
  });

  it("perfil, proceso e imágenes inválidos → su código en su campo", () => {
    const input: ProjectSheetInput = {
      ...PUBLISHABLE_INPUT,
      profile: { description: "Texto", highlights: ["1", "2", "3", "4", "5", "6"] },
      processSteps: {
        ...PUBLISHABLE_INPUT.processSteps!,
        works_50: { status: "upcoming", offsetDays: 1, started: false },
      },
      images: [
        ...PUBLISHABLE_INPUT.images,
        { kind: "before", url: "/images/proyectos/m2-001/antes.svg" },
      ],
    };
    expect(issuesOf(input)).toEqual([
      { code: "INVALID_PROFILE", field: "profile" },
      { code: "DECREASING_OFFSETS", field: "processSteps" },
      { code: "INVALID_IMAGES", field: "images" },
    ]);
  });

  it("sin códigos libres → CODE_SPACE_EXHAUSTED en project.code", () => {
    const ctx = {
      ...CREATE_CTX,
      existingCodes: CREATE_CTX.existingCodes.concat(["M2-999" as never]),
    };
    expect(issuesOf(MINIMAL_INPUT, ctx)).toEqual([
      { code: "CODE_SPACE_EXHAUSTED", field: "project.code" },
    ]);
  });
});

describe("buildProjectSheet · edición", () => {
  it("conserva id, código, slug, inmueble, clase y colocadas aunque cambie la zona", () => {
    const ctx = editCtx((s) => ({
      ...s,
      participationClass: { ...s.participationClass!, placed: 37 },
    }));
    const input = {
      ...EDIT_INPUT,
      property: { ...EDIT_INPUT.property, zone: "Altamira" },
      project: { ...EDIT_INPUT.project, name: "Nuevo nombre" },
    };
    const s = sheetOf(input, {
      ...ctx,
      ids: {
        ...ctx.ids,
        projectId: "otro" as never,
        propertyId: "otra" as never,
        classId: "otra" as never,
      },
    });
    expect(s.project).toMatchObject({
      id: "prj_new_01",
      code: "M2-008",
      slug: "m2-008-los-palos-grandes",
      name: "Nuevo nombre",
    });
    expect(s.property).toMatchObject({ id: "prop_new_01", zone: "Altamira" });
    expect(s.participationClass).toMatchObject({ id: "pcl_new_01", placed: 37 });
  });

  it("conserva estado y started de cada etapa: solo se editan los días", () => {
    const ctx = editCtx((s) => ({
      ...s,
      process: {
        ...s.process!,
        steps: {
          ...s.process!.steps,
          works_start: { status: "current", offsetDays: 15, started: true },
        },
      },
    }));
    const input = {
      ...EDIT_INPUT,
      processSteps: {
        ...EDIT_INPUT.processSteps!,
        works_start: { status: "upcoming" as const, offsetDays: 20, started: false },
      },
    };
    expect(sheetOf(input, ctx).process?.steps.works_start).toEqual({
      status: "current",
      offsetDays: 20,
      started: true,
    });
  });

  it("otra etapa → STATUS_CHANGE_NOT_ALLOWED", () => {
    const input = {
      ...EDIT_INPUT,
      project: { ...EDIT_INPUT.project, status: "renovation" as const },
    };
    expect(issuesOf(input, editCtx())).toEqual([
      { code: "STATUS_CHANGE_NOT_ALLOWED", field: "project.status" },
    ]);
  });

  it("una etapa no creable ya existente (renovation) se edita sin STATUS_NOT_CREATABLE", () => {
    const ctx = editCtx((s) => ({ ...s, project: { ...s.project, status: "renovation" } }));
    const input = {
      ...EDIT_INPUT,
      project: { ...EDIT_INPUT.project, status: "renovation" as const },
    };
    expect(sheetOf(input, ctx).project.status).toBe("renovation");
  });

  it("W2-2 · con colocadas > 0, cambiar total o precio → CLASS_LOCKED_BY_PLACEMENTS", () => {
    const ctx = editCtx((s) => ({
      ...s,
      participationClass: { ...s.participationClass!, placed: 1 },
    }));
    const total = { ...EDIT_INPUT, participationClass: { total: 50, unitPrice: usdUnits(200) } };
    expect(issuesOf(total, ctx)).toEqual([
      { code: "CLASS_LOCKED_BY_PLACEMENTS", field: "participationClass" },
    ]);
    const removed = { ...EDIT_INPUT, participationClass: null };
    expect(issuesOf(removed, ctx)).toContainEqual({
      code: "CLASS_LOCKED_BY_PLACEMENTS",
      field: "participationClass",
    });
    expect(buildProjectSheet(EDIT_INPUT, ctx).ok).toBe(true);
  });

  it("W2-2 · sin colocadas, total y precio se pueden cambiar", () => {
    const input: ProjectSheetInput = {
      ...EDIT_INPUT,
      participationClass: { total: 50, unitPrice: usdUnits(200) },
    };
    expect(sheetOf(input, editCtx()).participationClass).toMatchObject({
      total: 50,
      unitPrice: usdUnits(200),
      placed: 0,
    });
  });

  it("W2-3 · sold o settled → solo SHEET_LOCKED", () => {
    for (const status of ["sold", "settled"] as const) {
      const ctx = editCtx((s) => ({ ...s, project: { ...s.project, status } }));
      const input = { ...EDIT_INPUT, project: { ...EDIT_INPUT.project, status, name: "" } };
      expect(issuesOf(input, ctx)).toEqual([{ code: "SHEET_LOCKED", field: "project.status" }]);
    }
  });
});
