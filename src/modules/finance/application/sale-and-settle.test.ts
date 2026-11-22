import { describe, expect, it } from "vitest";
import type { Project, ProjectCode, ProjectStatus } from "@/modules/projects";
import { isoDate } from "@/shared/domain/calendar-date";
import { fixedClock } from "@/shared/domain/clock";
import { asId, type IdGenerator } from "@/shared/domain/id";
import { usdUnits, type Money } from "@/shared/domain/money";
import { ok } from "@/shared/domain/result";
import type { ProjectEconomics } from "../domain/project-economics";
import type { ProjectSale } from "../domain/project-sale";
import type { Settlement } from "../domain/settlement";
import { createRecordProjectSale } from "./record-project-sale";
import { createSettleProject } from "./settle-project";

const TODAY = isoDate("2026-11-22");
const clock = fixedClock(TODAY);
const ID = asId<"Project">("prj_prueba_01");
const PRE = { acquiredOn: isoDate("2026-06-01"), saleSignedOn: null, settledOn: null };

const at = (status: ProjectStatus, timeline: Project["timeline"] = PRE): Project => ({
  id: ID,
  code: "QA-902" as ProjectCode,
  slug: "qa-902-prueba",
  name: "Prueba",
  propertyId: asId<"Property">("prp_prueba_01"),
  status,
  timeline,
});

const ECONOMICS: ProjectEconomics = {
  projectId: ID,
  acquisitionCost: usdUnits(30_000),
  recoveryBudget: usdUnits(20_000),
  targetSalePrice: usdUnits(60_000),
  estimatedSaleCosts: usdUnits(1_000),
};
const CLASS = { id: asId<"ParticipationClass">("cls_prueba_01"), projectId: ID, total: 100, placed: 100, unitPrice: usdUnits(100) };

/** Mundo en memoria: el escritor guarda proyecto y venta/liquidación juntos, como el real. */
function world(initial: Project | null) {
  const state = { project: initial, sales: [] as ProjectSale[], settlements: [] as Settlement[], writes: 0 };
  const projects = { findById: () => Promise.resolve(state.project) };
  const saleWriter = {
    record: ({ project, sale }: { project: Project; sale: ProjectSale }) => {
      state.project = project;
      state.sales.push(sale);
      state.writes += 1;
      return Promise.resolve(ok(sale));
    },
  };
  const settlements = {
    list: () => Promise.resolve(state.settlements),
    findByProject: () => Promise.resolve(state.settlements[0] ?? null),
    settle: ({ project, settlement }: { project: Project; settlement: Settlement }) => {
      state.project = project;
      state.settlements.push(settlement);
      state.writes += 1;
      return Promise.resolve(ok(settlement));
    },
  };
  const sales = { list: () => Promise.resolve(state.sales), findByProject: () => Promise.resolve(state.sales[0] ?? null) };
  const ids: IdGenerator = { next: <T extends string>(prefix: string) => asId<T>(`${prefix}_prueba_01`) };
  const record = createRecordProjectSale({ projects, sales: saleWriter, clock });
  const settle = createSettleProject({
    projects,
    sales,
    settlements,
    economics: { findByProject: () => Promise.resolve(ECONOMICS) },
    classes: { findByProject: () => Promise.resolve(CLASS) },
    clock,
    ids,
  });
  return { state, record, settle };
}

const input = (over: { salePrice?: Money; saleCosts?: Money; signedOn?: ReturnType<typeof isoDate> } = {}) => ({
  projectId: ID,
  salePrice: usdUnits(47_000),
  saleCosts: usdUnits(1_000),
  signedOn: TODAY,
  ...over,
});

describe("recordProjectSale (W-5)", () => {
  it.each(["on_sale", "stalled"] as const)("desde %s registra la venta y sella saleSignedOn", async (from) => {
    const w = world(at(from));
    const r = await w.record(input({ signedOn: isoDate("2026-11-20") }));
    expect(r.ok && r.value.signedOn).toBe("2026-11-20");
    expect(w.state.project?.status).toBe("sold");
    expect(w.state.project?.timeline.saleSignedOn).toBe("2026-11-20");
    expect(w.state.writes).toBe(1);
  });

  it("desde renovation → INVALID_TRANSITION y no guarda", async () => {
    const w = world(at("renovation"));
    const r = await w.record(input());
    expect(!r.ok && r.error.code).toBe("INVALID_TRANSITION");
    expect(w.state.writes).toBe(0);
  });

  it("proyecto inexistente → PROJECT_NOT_FOUND", async () => {
    const r = await world(null).record(input());
    expect(!r.ok && r.error.code).toBe("PROJECT_NOT_FOUND");
  });

  it("fecha futura → SALE_DATE_IN_FUTURE", async () => {
    const w = world(at("on_sale"));
    const r = await w.record(input({ signedOn: isoDate("2026-11-23") }));
    expect(!r.ok && r.error.code).toBe("SALE_DATE_IN_FUTURE");
    expect(w.state.writes).toBe(0);
  });

  it("fecha anterior a la compra → DATE_OUT_OF_ORDER", async () => {
    const w = world(at("on_sale"));
    const r = await w.record(input({ signedOn: isoDate("2026-05-31") }));
    expect(!r.ok && r.error.code).toBe("DATE_OUT_OF_ORDER");
    expect(w.state.writes).toBe(0);
  });

  it("O > P → SALE_COSTS_EXCEED_PRICE; P = 0 → NON_POSITIVE_SALE_PRICE", async () => {
    const w = world(at("on_sale"));
    const a = await w.record(input({ salePrice: usdUnits(1_000), saleCosts: usdUnits(1_001) }));
    expect(!a.ok && a.error.code).toBe("SALE_COSTS_EXCEED_PRICE");
    const b = await w.record(input({ salePrice: usdUnits(0), saleCosts: usdUnits(0) }));
    expect(!b.ok && b.error.code).toBe("NON_POSITIVE_SALE_PRICE");
    expect(w.state.writes).toBe(0);
  });
});

describe("settleProject (W-5)", () => {
  it("liquidar un proyecto vendido con pérdida (C5: P 47.000, C 30.000, F 20.000, O 1.000) lo deja settled", async () => {
    const w = world(at("on_sale"));
    await w.record(input());
    const r = await w.settle(ID);
    expect(r.ok && r.value.settledOn).toBe(TODAY);
    expect(r.ok && r.value.distribution.kind).toBe("loss");
    expect(w.state.project?.status).toBe("settled");
    expect(w.state.project?.timeline.settledOn).toBe(TODAY);
  });

  it("con ganancia usa P y O de la venta, C y F de la economía y la clase al liquidar", async () => {
    const w = world(at("on_sale"));
    await w.record(input({ salePrice: usdUnits(70_000), saleCosts: usdUnits(0) }));
    const r = await w.settle(ID);
    expect(r.ok && r.value.distribution.kind).toBe("distributed");
    expect(r.ok && r.value.input).toEqual({
      basis: "realized",
      salePrice: usdUnits(70_000),
      acquisitionCost: usdUnits(30_000),
      recoveryBudget: usdUnits(20_000),
      saleCosts: usdUnits(0),
      participations: { total: 100, placed: 100, unitPrice: usdUnits(100) },
    });
  });

  it("proyecto no vendido (on_sale) → NOT_SOLD y no guarda", async () => {
    const w = world(at("on_sale"));
    const r = await w.settle(ID);
    expect(!r.ok && r.error.code).toBe("NOT_SOLD");
    expect(w.state.writes).toBe(0);
  });

  it("dos veces → ALREADY_SETTLED", async () => {
    const w = world(at("on_sale"));
    await w.record(input());
    await w.settle(ID);
    const again = await w.settle(ID);
    expect(!again.ok && again.error.code).toBe("ALREADY_SETTLED");
    expect(w.state.settlements).toHaveLength(1);
  });

  it("proyecto inexistente → PROJECT_NOT_FOUND", async () => {
    const r = await world(null).settle(ID);
    expect(!r.ok && r.error.code).toBe("PROJECT_NOT_FOUND");
  });

  it("sold sin venta guardada → SALE_NOT_FOUND", async () => {
    const w = world(at("sold", { ...PRE, saleSignedOn: isoDate("2026-11-01") }));
    const r = await w.settle(ID);
    expect(!r.ok && r.error.code).toBe("SALE_NOT_FOUND");
  });
});
