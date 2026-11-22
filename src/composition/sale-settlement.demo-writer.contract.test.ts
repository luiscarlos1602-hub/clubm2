import { describe, expect, it } from "vitest";
import { describeSaleSettlementWriterContract } from "@/modules/finance/application/sale-settlement-writer.contract";
import { isoDate } from "@/shared/domain/calendar-date";
import { fixedClock } from "@/shared/domain/clock";
import { createDemoStore } from "@/shared/infrastructure/demo-store";
import { randomIdGenerator } from "@/shared/infrastructure/id-generator";
import { buildDemoSnapshot, parseDemoSnapshot, type DemoSnapshot } from "./demo-snapshot";
import { registerFinance } from "./modules/finance";
import { registerParticipations } from "./modules/participations";
import { registerProjects } from "./modules/projects";
import { createDemoSaleSettlementWriter } from "./sale-settlement.demo-writer";

const clock = fixedClock(isoDate("2026-11-22"));

function newStore() {
  return createDemoStore<DemoSnapshot>({
    key: "test-sale-writer",
    storage: null,
    buildSeed: () => buildDemoSnapshot(clock),
    parse: parseDemoSnapshot,
  });
}

describeSaleSettlementWriterContract("demo (atómico sobre el almacén local)", () => {
  const store = newStore();
  const projects = registerProjects(store, { clock, publishGuard: () => Promise.resolve([]) });
  const participations = registerParticipations(store, projects);
  const finance = registerFinance(store, { projects, participations, clock, ids: randomIdGenerator() });
  const project = store.read().projects.projects.find((p) => p.status === "on_sale");
  if (project === undefined) throw new Error("la semilla no tiene un proyecto on_sale");
  return {
    writer: createDemoSaleSettlementWriter(store),
    projects: projects.projectRepository,
    sales: finance.saleRepository,
    settlements: finance.settlementRepository,
    project,
  };
});

describe("escritor de venta y liquidación demo · atomicidad", () => {
  it("al aceptar escribe una sola vez; al rechazar, ninguna", async () => {
    const store = newStore();
    const project = store.read().projects.projects.find((p) => p.status === "on_sale")!;
    const writer = createDemoSaleSettlementWriter(store);
    let writes = 0;
    const original = store.write;
    store.write = (next) => {
      writes += 1;
      original(next);
    };
    const sold = { ...project, status: "sold" as const, timeline: { ...project.timeline, saleSignedOn: isoDate("2026-11-20") } };
    const sale = { projectId: project.id, salePrice: { cents: 4_700_000, currency: "USD" as const }, saleCosts: { cents: 100_000, currency: "USD" as const }, signedOn: isoDate("2026-11-20") };
    expect((await writer.record({ project: sold, sale })).ok).toBe(true);
    expect(writes).toBe(1);
    const dup = await writer.record({ project: sold, sale });
    expect(dup.ok).toBe(false);
    expect(writes).toBe(1);
  });
});
