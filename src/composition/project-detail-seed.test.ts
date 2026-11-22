import { describe, expect, it } from "vitest";
import { isoDate } from "@/shared/domain/calendar-date";
import { fixedClock } from "@/shared/domain/clock";
import { usd } from "@/shared/domain/money";
import { createContainer } from "./container";

const clock = fixedClock(isoDate("2026-11-22"));
const make = () => createContainer({ clock, storage: null });

const SLUGS = [
  "m2-001-palos-grandes",
  "m2-002-el-hatillo",
  "m2-003-chacao",
  "m2-004-el-vinedo",
  "m2-005-el-paraiso",
  "m2-006-chacao",
];

describe("Ficha con semillas v2", () => {
  it("los 6 slugs publicados dan detalle; M2-007 y un slug ausente dan null", async () => {
    const c = make();
    for (const slug of SLUGS) expect(await c.finance.getProjectDetail(slug)).not.toBeNull();
    expect(await c.finance.getProjectDetail("m2-007-palos-grandes")).toBeNull();
    expect(await c.finance.getProjectDetail("no-existe")).toBeNull();
  });

  it("M2-006: abierto, presupuesto 62.280 y escenario base 34,30", async () => {
    const d = await make().finance.getProjectDetail("m2-006-chacao");
    expect(d?.mode).toBe("open");
    expect(d?.simulation.maxHeld).toBe(20);
    expect(d?.budget.total).toEqual(usd(6_228_000));
    expect(d?.budget.works).toHaveLength(4);
    expect(d?.budget.fees).toHaveLength(3);
    const base = d?.scenarios[1].outcome;
    expect(base?.kind).toBe("payout");
    if (base?.kind === "payout") expect(base.payout.gain).toEqual(usd(3_430));
  });

  it("M2-002 y M2-005: proyección fija", async () => {
    const c = make();
    expect((await c.finance.getProjectDetail("m2-002-el-hatillo"))?.mode).toBe("fixed_projection");
    expect((await c.finance.getProjectDetail("m2-005-el-paraiso"))?.mode).toBe("fixed_projection");
  });

  it("finalizados: resultado realizado", async () => {
    const c = make();
    expect((await c.finance.getProjectDetail("m2-003-chacao"))?.realized?.gain).toEqual(usd(3_450));
    expect((await c.finance.getProjectDetail("m2-001-palos-grandes"))?.realized?.gain).toEqual(usd(3_024));
  });

  it("getProjectProcess coincide con detail.process y sobrevive a reset", async () => {
    const c = make();
    const detail = await c.finance.getProjectDetail("m2-005-el-paraiso");
    expect(await c.projects.getProjectProcess("M2-005")).toEqual(detail?.process);
    c.demo.reset();
    expect(await c.projects.getProjectProcess("M2-005")).toEqual(detail?.process);
    expect(await c.finance.getProjectDetail("m2-005-el-paraiso")).toEqual(detail);
  });
});
