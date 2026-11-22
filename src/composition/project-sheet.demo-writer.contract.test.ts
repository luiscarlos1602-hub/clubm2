import { describe, expect, it } from "vitest";
import { buildProjectSheet } from "@/modules/finance/domain/build-project-sheet";
import { CREATE_CTX, PUBLISHABLE_INPUT } from "@/modules/finance/domain/project-sheet.test-fixtures";
import { describeProjectSheetWriterContract } from "@/modules/finance/application/project-sheet-writer.contract";
import { isoDate } from "@/shared/domain/calendar-date";
import { fixedClock } from "@/shared/domain/clock";
import { usdUnits } from "@/shared/domain/money";
import { createDemoStore } from "@/shared/infrastructure/demo-store";
import { randomIdGenerator } from "@/shared/infrastructure/id-generator";
import { buildDemoSnapshot, parseDemoSnapshot, type DemoSnapshot } from "./demo-snapshot";
import { createDemoProjectSheetWriter } from "./project-sheet.demo-writer";
import { registerFinance } from "./modules/finance";
import { registerParticipations } from "./modules/participations";
import { registerProjects } from "./modules/projects";

const clock = fixedClock(isoDate("2026-11-22"));

function newStore() {
  return createDemoStore<DemoSnapshot>({
    key: "test-sheet-writer",
    storage: null,
    buildSeed: () => buildDemoSnapshot(clock),
    parse: parseDemoSnapshot,
  });
}

function wire(store: ReturnType<typeof newStore>) {
  const projects = registerProjects(store, { clock, publishGuard: () => Promise.resolve([]) });
  const participations = registerParticipations(store, projects);
  const finance = registerFinance(store, { projects, participations, clock, ids: randomIdGenerator() });
  return { projects, participations, finance };
}

describeProjectSheetWriterContract("demo (atómico sobre el almacén local)", () => {
  const store = newStore();
  const { projects, participations, finance } = wire(store);
  return {
    writer: createDemoProjectSheetWriter(store),
    projects: projects.projectRepository,
    properties: projects.propertyRepository,
    content: projects.contentRepository,
    media: projects.mediaRepository,
    classes: participations.classRepository,
    economics: finance.economicsRepository,
    budgets: finance.budgetRepository,
  };
});

describe("escritor de ficha demo · atomicidad (CA14)", () => {
  it("si una parte se rechaza no cambia nada del almacén", () => {
    const store = newStore();
    const writer = createDemoProjectSheetWriter(store);
    const built = buildProjectSheet(PUBLISHABLE_INPUT, CREATE_CTX);
    if (!built.ok) throw new Error("fixture inválida");
    const before = JSON.stringify(store.read());
    // Presupuesto con rubro desconocido: pasa propiedad, proyecto, contenido, clase y economía antes de fallar.
    const broken = {
      ...built.value,
      budget: { ...built.value.budget, lines: [{ item: "pool", amount: usdUnits(10_000) }] },
    } as unknown as typeof built.value;
    return writer.save(broken).then((r) => {
      expect(!r.ok && r.error.code).toBe("INVALID_RECORD");
      expect(JSON.stringify(store.read())).toBe(before);
    });
  });

  it("al aceptar escribe una sola vez", async () => {
    const store = newStore();
    let writes = 0;
    const original = store.write;
    store.write = (next) => {
      writes += 1;
      original(next);
    };
    const built = buildProjectSheet(PUBLISHABLE_INPUT, CREATE_CTX);
    if (!built.ok) throw new Error("fixture inválida");
    const r = await createDemoProjectSheetWriter(store).save(built.value);
    expect(r.ok).toBe(true);
    expect(writes).toBe(1);
  });
});
