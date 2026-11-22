import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { brand } from "@/shared/config/brand";
import { compareIsoDate, isoDate, type IsoDate } from "@/shared/domain/calendar-date";
import { fixedClock } from "@/shared/domain/clock";
import { usd, usdUnits } from "@/shared/domain/money";
import { calculateDistribution, calculateHolderPayout, createSettlement } from "@/modules/finance";
import { checkHoldings, checkParticipationClass } from "@/modules/participations/domain/participation-consistency";
import { DEMO_HOLDER_ID } from "@/modules/participations/infrastructure/seed";
import { checkProjectConsistency, parseProjectCode } from "@/modules/projects";
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
    for (const m of ["projects", "participations", "finance"]) {
      const source = readFileSync(`src/modules/${m}/infrastructure/seed.ts`, "utf8");
      expect(source).not.toMatch(/\d{4}-\d{2}-\d{2}/);
    }
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
    expect(parseDemoSnapshot({ version: 2 }).ok).toBe(false);
  });
});
