import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { brand } from "@/shared/config/brand";
import { compareIsoDate, isoDate, type IsoDate } from "@/shared/domain/calendar-date";
import { fixedClock } from "@/shared/domain/clock";
import { usd, usdUnits } from "@/shared/domain/money";
import {
  calculateDistribution,
  calculateHolderPayout,
  checkProjectBudget,
  createSettlement,
  worksSubtotal,
} from "@/modules/finance";
import { checkHoldings, checkParticipationClass } from "@/modules/participations/domain/participation-consistency";
import { DEMO_HOLDER_ID } from "@/modules/participations/infrastructure/seed";
import {
  PROJECT_RISK_KINDS,
  checkProjectConsistency,
  checkProjectProcess,
  parseProjectCode,
  toProcessTimeline,
} from "@/modules/projects";
import { classifyProjectWheel } from "@/modules/projects/backoffice";
import { buildDemoSnapshot, parseDemoSnapshot, type DemoSnapshot } from "./demo-snapshot";

const TODAY = isoDate("2026-11-22");
const snapshot = (today: IsoDate = TODAY): DemoSnapshot => buildDemoSnapshot(fixedClock(today));

function byCode(s: DemoSnapshot, n: number) {
  const code = `${brand.shortName}-00${n}`;
  const project = s.projects.projects.find((p) => p.code === code);
  if (!project) throw new Error(`falta ${code}`);
  return project;
}

function wheelOf(s: DemoSnapshot, n: number, today: IsoDate = TODAY) {
  const result = classifyProjectWheel(byCode(s, n), today);
  if (!result.ok) throw new Error(result.error.code);
  return result.value;
}

function settlementOf(s: DemoSnapshot, n: number) {
  const id = byCode(s, n).id;
  const found = s.finance.settlements.find((x) => x.projectId === id);
  if (!found) throw new Error(`sin liquidación M2-00${n}`);
  return found;
}

describe("Semillas", () => {
  it("7 proyectos M2-001…M2-007 con ids, códigos y slugs únicos", () => {
    const { projects } = snapshot().projects;
    expect(projects).toHaveLength(7);
    projects.forEach((p, i) => {
      expect(parseProjectCode(p.code).ok).toBe(true);
      expect(p.code).toBe(`${brand.shortName}-00${i + 1}`);
      expect(p.slug.startsWith(`${p.code.toLowerCase()}-`)).toBe(true);
    });
    expect(new Set(projects.map((p) => p.id)).size).toBe(7);
    expect(new Set(projects.map((p) => p.slug)).size).toBe(7);
    expect(byCode(snapshot(), 3).slug).toBe("m2-003-chacao");
  });

  it("cada proyecto cumple checkProjectConsistency", () => {
    for (const p of snapshot().projects.projects) {
      expect(checkProjectConsistency(p).ok).toBe(true);
    }
  });

  it("escenarios de docs/01 §6", () => {
    const s = snapshot();
    expect(s.projects.projects.map((p) => p.status)).toEqual([
      "settled",
      "on_sale",
      "settled",
      "on_sale",
      "renovation",
      "funding",
      "due_diligence",
    ]);
    const cls6 = s.participations.classes.find((c) => c.projectId === byCode(s, 6).id);
    expect(cls6?.placed).toBe(63);
    expect(cls6?.total).toBe(100);
    expect(wheelOf(s, 3).wheel).toBe("good");
    expect(wheelOf(s, 1).wheel).toBe("medium");
    expect(wheelOf(s, 2)).toMatchObject({ wheel: "bad", sold: false });
    for (const n of [4, 5, 6]) expect(wheelOf(s, n).wheel).toBe("in_progress");
  });

  it("zonas de Caracas y una en Valencia", () => {
    const { properties } = snapshot().projects;
    const zones = properties.map((p) => `${p.city}|${p.zone}`);
    for (const z of [
      "Caracas|Chacao",
      "Caracas|Los Palos Grandes",
      "Caracas|El Hatillo",
      "Caracas|El Paraíso",
      "Valencia|El Viñedo",
    ]) {
      expect(zones).toContain(z);
    }
  });

  it("cada liquidación se recalcula igual con el motor", () => {
    const s = snapshot();
    expect(s.finance.settlements).toHaveLength(2);
    for (const st of s.finance.settlements) {
      const project = s.projects.projects.find((p) => p.id === st.projectId);
      const econ = s.finance.economics.find((e) => e.projectId === st.projectId);
      const cls = s.participations.classes.find((c) => c.projectId === st.projectId);
      expect(project?.status).toBe("settled");
      expect(project?.timeline.settledOn).toBe(st.settledOn);
      expect(st.input.acquisitionCost).toEqual(econ?.acquisitionCost);
      expect(st.input.recoveryBudget).toEqual(econ?.recoveryBudget);
      expect(st.input.participations).toEqual({
        total: cls?.total,
        placed: cls?.placed,
        unitPrice: cls?.unitPrice,
      });
      const again = createSettlement({
        id: st.id,
        projectId: st.projectId,
        settledOn: st.settledOn,
        input: st.input,
      });
      expect(again.ok && again.value).toEqual(st);
    }
  });

  it("M2-001 cifras esperadas con residuo K1 de 90 ¢", () => {
    const d = settlementOf(snapshot(), 1).distribution;
    expect(d.surplus).toEqual(usd(1_209_963));
    expect(d.fund).toEqual(usd(302_490));
    expect(d.perParticipation).toEqual(usd(3_024));
    expect(d.roundingResidue).toEqual(usd(90));
    expect(d.toExternal).toEqual(usd(266_112));
    expect(d.companyFromFund).toEqual(usd(36_378));
    expect(d.companyDirect).toEqual(usd(907_473));
    expect(d.capital.external).toEqual(usd(880_000));
    expect(d.capital.company).toEqual(usd(5_620_000));
  });

  it("M2-003 cifras esperadas", () => {
    const d = settlementOf(snapshot(), 3).distribution;
    expect(d.surplus).toEqual(usd(1_380_000));
    expect(d.fund).toEqual(usd(345_000));
    expect(d.perParticipation).toEqual(usd(3_450));
    expect(d.roundingResidue).toEqual(usd(0));
    expect(d.toExternal).toEqual(usd(345_000));
    expect(d.companyFromFund).toEqual(usd(0));
    expect(d.companyDirect).toEqual(usd(1_035_000));
    expect(d.capital.external).toEqual(usd(1_000_000));
    expect(d.capital.company).toEqual(usd(4_800_000));
  });

  it("todo proyecto con clase tiene economía y F = total × precio", () => {
    const s = snapshot();
    for (const c of s.participations.classes) {
      expect(checkParticipationClass(c).ok).toBe(true);
      const econ = s.finance.economics.find((e) => e.projectId === c.projectId);
      expect(econ).toBeDefined();
      expect(econ?.recoveryBudget).toEqual(usd(c.total * c.unitPrice.cents));
    }
    const m7 = byCode(s, 7);
    expect(s.participations.classes.some((c) => c.projectId === m7.id)).toBe(false);
    expect(s.finance.economics.some((e) => e.projectId === m7.id)).toBe(true);
    expect(s.finance.economics).toHaveLength(7);
  });

  it("excedente proyectado positivo en los proyectos no liquidados", () => {
    const s = snapshot();
    for (const p of s.projects.projects.filter((x) => x.status !== "settled")) {
      const econ = s.finance.economics.find((e) => e.projectId === p.id);
      const cls = s.participations.classes.find((c) => c.projectId === p.id);
      if (!econ) throw new Error("sin economía");
      const out = calculateDistribution({
        basis: "projection",
        salePrice: econ.targetSalePrice,
        acquisitionCost: econ.acquisitionCost,
        recoveryBudget: econ.recoveryBudget,
        saleCosts: econ.estimatedSaleCosts,
        participations: cls
          ? { total: cls.total, placed: cls.placed, unitPrice: cls.unitPrice }
          : { total: 100, placed: 0, unitPrice: usdUnits(100) },
      });
      expect(out.ok && out.value.kind).toBe("distributed");
    }
  });

  it("inversionista demo: 1 liquidado y 2 en curso", () => {
    const s = snapshot();
    const mine = s.participations.participations.filter((p) => p.holderId === DEMO_HOLDER_ID);
    expect(mine).toHaveLength(3);
    const statusOf = (projectId: string) =>
      s.projects.projects.find((p) => p.id === projectId)?.status;
    expect(mine.filter((p) => statusOf(p.projectId) === "settled")).toHaveLength(1);
    expect(mine.filter((p) => statusOf(p.projectId) !== "settled")).toHaveLength(2);
    expect(mine.some((p) => p.projectId === byCode(s, 2).id)).toBe(false);

    const settled = mine.find((p) => p.projectId === byCode(s, 3).id);
    expect(settled?.quantity).toBe(5);
    const payout = calculateHolderPayout(settlementOf(s, 3).distribution, 5);
    expect(payout.ok && payout.value.capital).toEqual(usd(50_000));
    expect(payout.ok && payout.value.gain).toEqual(usd(17_250));
    expect(payout.ok && payout.value.total).toEqual(usd(67_250));
  });

  it("tenencias dentro de D4, de las colocadas y con fecha entre compra y hoy", () => {
    const s = snapshot();
    for (const cls of s.participations.classes) {
      const holdings = s.participations.participations.filter((p) => p.classId === cls.id);
      expect(checkHoldings(cls, holdings).ok).toBe(true);
      const project = s.projects.projects.find((p) => p.id === cls.projectId);
      const acquiredOn = project?.timeline.acquiredOn;
      for (const h of holdings) {
        expect(h.status).toBe("confirmed");
        expect(compareIsoDate(acquiredOn as IsoDate, h.subscribedOn)).toBeLessThanOrEqual(0);
        expect(compareIsoDate(h.subscribedOn, TODAY)).toBeLessThanOrEqual(0);
      }
    }
  });

  it("fechas relativas: desplazar hoy desplaza todo igual", () => {
    const later = isoDate("2027-03-10");
    const a = snapshot(TODAY);
    const b = snapshot(later);
    const dayNumber = (d: string) => Date.UTC(+d.slice(0, 4), +d.slice(5, 7) - 1, +d.slice(8, 10)) / 86_400_000;
    const shift = dayNumber(later) - dayNumber(TODAY);
    expect(shift).toBeGreaterThan(0);
    const dates = (s: DemoSnapshot): string[] => ([
      ...s.projects.projects.flatMap((p) => Object.values(p.timeline)),
      ...s.participations.participations.map((p) => p.subscribedOn),
      ...s.finance.settlements.map((x) => x.settledOn),
    ] as (string | null)[]).filter((d): d is string => d !== null);
    const da = dates(a);
    const db = dates(b);
    expect(db).toHaveLength(da.length);
    da.forEach((d, i) => expect(dayNumber(db[i]) - dayNumber(d)).toBe(shift));
    expect(b.projects.projects.map((p) => p.status)).toEqual(a.projects.projects.map((p) => p.status));
    for (const n of [1, 2, 3, 4, 5, 6]) {
      expect(wheelOf(b, n, later).wheel).toBe(wheelOf(a, n, TODAY).wheel);
    }
    // el motor no depende de la fecha
    expect(b.finance.settlements.map((x) => x.distribution)).toEqual(
      a.finance.settlements.map((x) => x.distribution),
    );
  });

  it("los seed.ts no contienen fechas literales", () => {
    const files = [
      "projects/infrastructure/seed.ts",
      "projects/infrastructure/seed-content.ts",
      "participations/infrastructure/seed.ts",
      "finance/infrastructure/seed.ts",
      "finance/infrastructure/seed-budget.ts",
    ];
    for (const f of files) {
      const source = readFileSync(`src/modules/${f}`, "utf8");
      expect(source).not.toMatch(/\d{4}-\d{2}-\d{2}/);
    }
  });

  it("ADR-004 · el texto del snapshot no menciona ruedas ni estancados", () => {
    expect(JSON.stringify(snapshot())).not.toMatch(/rueda|estancad|días sin vender|wheel|stalled/i);
  });

  it("ADR-004 · el snapshot no contiene ruedas ni proyectos estancados", () => {
    const keys: string[] = [];
    const walk = (v: unknown): void => {
      if (Array.isArray(v)) v.forEach(walk);
      else if (typeof v === "object" && v !== null) {
        for (const [k, child] of Object.entries(v)) {
          keys.push(k);
          walk(child);
        }
      }
    };
    const s = snapshot();
    walk(s);
    expect(keys.filter((k) => /wheel|rueda/i.test(k))).toEqual([]);
    expect(s.projects.projects.some((p) => p.status === "stalled")).toBe(false);
  });

  it("el snapshot sobrevive JSON y pasa demoSnapshotSchema", () => {
    const s = snapshot();
    const parsed = parseDemoSnapshot(JSON.parse(JSON.stringify(s)));
    expect(parsed.ok && parsed.value).toEqual(s);
    expect(parseDemoSnapshot({ ...JSON.parse(JSON.stringify(s)), version: 1 }).ok).toBe(false);
    expect(parseDemoSnapshot({ version: 1 }).ok).toBe(false);
    expect(s.version).toBe(2);
  });

  describe("contenido de la ficha (v2)", () => {
    const published = (s: DemoSnapshot) => s.projects.projects.filter((p) => p.code !== `${brand.shortName}-007`);

    it("7 presupuestos válidos: obra 5.000 y bolsa 5.000", () => {
      const s = snapshot();
      expect(s.finance.budgets).toHaveLength(7);
      for (const b of s.finance.budgets) {
        const econ = s.finance.economics.find((e) => e.projectId === b.projectId);
        if (!econ) throw new Error("sin economía");
        expect(checkProjectBudget(b, econ).ok).toBe(true);
        expect(worksSubtotal(b)).toEqual(usdUnits(5_000));
        const fees = b.lines.filter((l) => !["kitchen", "bathrooms", "floors_paint", "electrical_plumbing", "garden_exterior", "carpentry"].includes(l.item));
        expect(fees.map((l) => l.item)).toEqual(["management_fee", "contingency", "reserve"]);
        expect(fees.map((l) => l.amount)).toEqual([usdUnits(2_500), usdUnits(1_500), usdUnits(1_000)]);
      }
    });

    it("6 procesos válidos y coherentes con la fase", () => {
      const s = snapshot();
      expect(s.projects.processes).toHaveLength(6);
      for (const p of published(s)) {
        const process = s.projects.processes.find((x) => x.projectId === p.id);
        if (!process) throw new Error(`sin proceso ${p.code}`);
        expect(checkProjectProcess(process).ok).toBe(true);
        const st = process.steps;
        if (p.status === "settled") {
          expect(Object.values(st).every((x) => x.status === "done")).toBe(true);
          const acquired = p.timeline.acquiredOn as IsoDate;
          const signed = p.timeline.saleSignedOn as IsoDate;
          const days = (Date.parse(signed) - Date.parse(acquired)) / 86_400_000;
          expect(st.sold.offsetDays).toBe(days);
        }
        if (p.status === "on_sale") expect(st.on_sale.status).toBe("current");
        if (p.status === "renovation") {
          expect(["current", "upcoming"]).toContain(st.works_50.status);
          expect(st.sale_start.status).not.toBe("done");
          expect(st.sold.status).not.toBe("done");
        }
        if (p.status === "funding") expect(st.works_start.status).not.toBe("done");
      }
    });

    it("fechas del proceso: hechas ≤ hoy y estimadas ≥ hoy", () => {
      const s = snapshot();
      for (const process of s.projects.processes) {
        const project = s.projects.projects.find((p) => p.id === process.projectId);
        const timeline = toProcessTimeline(project?.timeline.acquiredOn as IsoDate, process);
        for (const t of timeline) {
          if (t.estimated) expect(compareIsoDate(t.date, TODAY)).toBeGreaterThanOrEqual(0);
          else expect(compareIsoDate(t.date, TODAY)).toBeLessThanOrEqual(0);
        }
      }
    });

    it("17 actualizaciones únicas, entre la compra y hoy (y la liquidación)", () => {
      const s = snapshot();
      expect(s.projects.updates).toHaveLength(17);
      expect(new Set(s.projects.updates.map((u) => u.id)).size).toBe(17);
      for (const u of s.projects.updates) {
        const p = s.projects.projects.find((x) => x.id === u.projectId);
        expect(compareIsoDate(p?.timeline.acquiredOn as IsoDate, u.publishedOn)).toBeLessThanOrEqual(0);
        expect(compareIsoDate(u.publishedOn, TODAY)).toBeLessThanOrEqual(0);
        if (p?.timeline.settledOn) expect(compareIsoDate(u.publishedOn, p.timeline.settledOn)).toBeLessThanOrEqual(0);
      }
    });

    it("los 6 publicados llevan los 3 riesgos comunes; M2-007 no lleva contenido", () => {
      const s = snapshot();
      expect(s.projects.risks).toHaveLength(6);
      for (const r of s.projects.risks) {
        expect(r.kinds.slice(0, 3)).toEqual(["sale_below_target", "works_overrun", "slow_sale"]);
        r.kinds.forEach((k) => expect(PROJECT_RISK_KINDS).toContain(k));
      }
      const m7 = byCode(s, 7);
      expect(s.projects.profiles).toHaveLength(6);
      expect(s.projects.profiles.some((p) => p.propertyId === m7.propertyId)).toBe(false);
      expect(s.projects.processes.some((p) => p.projectId === m7.id)).toBe(false);
      expect(s.projects.updates.some((u) => u.projectId === m7.id)).toBe(false);
      expect(s.projects.risks.some((r) => r.projectId === m7.id)).toBe(false);
    });

    it("desplazar hoy desplaza las actualizaciones", () => {
      const later = isoDate("2027-03-10");
      const day = (d: string) => Date.UTC(+d.slice(0, 4), +d.slice(5, 7) - 1, +d.slice(8, 10)) / 86_400_000;
      const shift = day(later) - day(TODAY);
      const a = snapshot(TODAY).projects.updates;
      const b = snapshot(later).projects.updates;
      expect(b).toHaveLength(a.length);
      a.forEach((u, i) => expect(day(b[i].publishedOn) - day(u.publishedOn)).toBe(shift));
    });
  });
});
