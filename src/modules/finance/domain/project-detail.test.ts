import { describe, expect, it } from "vitest";
import { usd, usdUnits } from "@/shared/domain/money";
import { asId } from "@/shared/domain/id";
import type { PropertyId } from "@/modules/projects";
import { calculateHolderPayout } from "./holder-payout";
import { buildProjectDetail } from "./project-detail";
import type { ProjectDetailSource } from "./project-detail-types";
import { OTHER, PROCESS, source, update } from "./project-detail.test-fixtures";

function build(s: ProjectDetailSource) {
  const r = buildProjectDetail(s);
  if (!r.ok) throw new Error(r.error.code);
  return r.value;
}

const codeOf = (s: ProjectDetailSource) => {
  const r = buildProjectDetail(s);
  return r.ok ? null : r.error.code;
};

describe("buildProjectDetail (D5)", () => {
  it("modos por fase: open · fixed_projection · realized", () => {
    expect(build(source("open")).mode).toBe("open");
    for (const p of ["placement_complete", "renovation", "on_sale", "sold"] as const) {
      expect(build(source(p, 100)).mode).toBe("fixed_projection");
    }
    expect(build(source("finished", 100)).mode).toBe("realized");
  });

  it("open: base del simulador desde la economía y la clase; maxHeld = min(20, disponibles)", () => {
    const d = build(source("open"));
    expect(d.simulation.base).toEqual({
      salePrice: usdUnits(76_000),
      acquisitionCost: usdUnits(50_000),
      recoveryBudget: usdUnits(10_000),
      saleCosts: usdUnits(2_280),
      total: 100,
      unitPrice: usdUnits(100),
      placed: 63,
      targetTermMonths: 3,
    });
    expect(d.simulation.maxHeld).toBe(20);
    expect(build(source("open", 95)).simulation.maxHeld).toBe(5);
    expect(d.simulation.heldRange).toEqual({ min: 1, max: 20 });
    expect(d.budget.total).toEqual(usdUnits(62_280));
    expect(d.scenarios.map((s) => s.id)).toEqual(["conservative", "base", "optimistic"]);
    expect(d.realized).toBeNull();
  });

  it("fuera de open: maxHeld = min(20, colocadas); sin cupos → 0 y heldRange.max ≥ 1", () => {
    expect(build(source("on_sale", 100)).simulation.maxHeld).toBe(20);
    expect(build(source("on_sale", 7)).simulation.maxHeld).toBe(7);
    const none = build(source("on_sale", 0));
    expect(none.simulation.maxHeld).toBe(0);
    expect(none.simulation.heldRange.max).toBe(1);
  });

  it("realized: sin escenarios y realized = calculateHolderPayout(dist, 1) → USD 34,30 sobre USD 100", () => {
    const s = source("finished", 100);
    const d = build(s);
    expect(d.scenarios).toEqual([]);
    const expected = calculateHolderPayout(s.settlement!.distribution, 1);
    expect(expected.ok && d.realized).toEqual(expected.ok ? expected.value : null);
    expect(d.realized?.capital).toEqual(usdUnits(100));
    expect(d.realized?.gain).toEqual(usd(3_430));
  });

  it("finished sin liquidación → MISSING_SETTLEMENT", () => {
    expect(codeOf({ ...source("finished", 100), settlement: null })).toBe("MISSING_SETTLEMENT");
  });

  it("un id ajeno → PROJECT_MISMATCH", () => {
    const s = source("open");
    expect(
      codeOf({ ...s, participationClass: { ...s.participationClass, projectId: OTHER } }),
    ).toBe("PROJECT_MISMATCH");
    expect(
      codeOf({
        ...s,
        profile: { ...s.profile, propertyId: asId<"Property">("prp_x_1") as PropertyId },
      }),
    ).toBe("PROJECT_MISMATCH");
    expect(codeOf({ ...s, updates: [{ ...update(3, "2026-11-12"), projectId: OTHER }] })).toBe(
      "PROJECT_MISMATCH",
    );
    expect(codeOf({ ...s, listing: { ...s.listing, projectId: OTHER } })).toBe("PROJECT_MISMATCH");
    expect(codeOf({ ...s, economics: { ...s.economics, projectId: OTHER } })).toBe(
      "PROJECT_MISMATCH",
    );
  });

  it("presupuesto que no suma F → BUDGET_TOTAL_MISMATCH; proceso inválido → INVALID_PROCESS", () => {
    const s = source("open");
    expect(codeOf({ ...s, budget: { ...s.budget, lines: s.budget.lines.slice(1) } })).toBe(
      "BUDGET_TOTAL_MISMATCH",
    );
    const broken = {
      ...PROCESS,
      steps: { ...PROCESS.steps, works_50: { ...PROCESS.steps.works_50, offsetDays: 1 } },
    };
    expect(codeOf({ ...s, process: broken })).toBe("INVALID_PROCESS");
  });

  it("proceso con fechas; sin proceso → null; actualizaciones ordenadas y riesgos normalizados", () => {
    const d = build(source("open"));
    expect(d.process?.[0]).toEqual({
      stage: "works_start",
      status: "current",
      date: "2026-12-01",
      estimated: true,
    });
    expect(build({ ...source("open"), process: null }).process).toBeNull();
    expect(d.updates.map((u) => u.id)).toEqual(["upd_chacao_02_2", "upd_chacao_02_1"]);
    expect(d.risks).toEqual([
      "sale_below_target",
      "works_overrun",
      "slow_sale",
      "incomplete_placement",
    ]);
    expect(build({ ...source("open"), risks: null }).risks).toEqual([]);
  });

  it("ninguna clave del detalle habla de ruedas (ADR-004)", () => {
    for (const phase of ["open", "finished"] as const) {
      const d = build(source(phase, phase === "open" ? 63 : 100));
      expect(JSON.stringify(d)).not.toMatch(/wheel|rueda|stalled/i);
    }
  });
});
