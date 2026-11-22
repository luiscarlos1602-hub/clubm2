import { describe, expect, it } from "vitest";
import { isoDate } from "@/shared/domain/calendar-date";
import { fixedClock } from "@/shared/domain/clock";
import { usdUnits } from "@/shared/domain/money";
import { memoryStorage } from "@/shared/infrastructure/browser-storage";
import { contractBudget, contractEconomics } from "@/modules/finance/application/finance-repository.contract";
import { contractClass } from "@/modules/participations/application/participations-repository.contract";
import { contractProject, contractProperty } from "@/modules/projects/application/projects-repository.contract";
import { createContainer } from "./container";

const clock = fixedClock(isoDate("2026-11-22"));

describe("Escrituras W-1 a través del contenedor", () => {
  it("un inmueble nuevo completo sobrevive a recargar (contenedor nuevo, mismo almacenamiento)", async () => {
    const storage = memoryStorage();
    const c = createContainer({ clock, storage });
    expect((await c.projects.saveProperty(contractProperty)).ok).toBe(true);
    expect((await c.projects.saveProject(contractProject)).ok).toBe(true);
    expect((await c.finance.saveProjectEconomics({ economics: contractEconomics, budget: contractBudget })).ok).toBe(true);
    expect((await c.participations.saveParticipationClass(contractClass)).ok).toBe(true);

    const reloaded = createContainer({ clock, storage });
    expect(await reloaded.projects.projectRepository.findById(contractProject.id)).toEqual(contractProject);
    expect(await reloaded.projects.propertyRepository.findById(contractProperty.id)).toEqual(contractProperty);
    expect(await reloaded.finance.economicsRepository.findByProject(contractProject.id)).toEqual(contractEconomics);
    expect(await reloaded.finance.budgetRepository.findByProject(contractProject.id)).toEqual(contractBudget);
    expect(await reloaded.participations.classRepository.findByProject(contractProject.id)).toEqual(contractClass);
    // las semillas siguen ahí: se añadió, no se reemplazó el snapshot
    expect(await reloaded.projects.projectRepository.list()).toHaveLength(8);
    // y se refleja en la cara pública
    const listed = await reloaded.participations.listMarketplace();
    expect(listed.map((l) => l.code)).toContain(contractProject.code);
  });

  it("una escritura rechazada por el dominio no toca el almacenamiento", async () => {
    const storage = memoryStorage();
    const c = createContainer({ clock, storage });
    await c.projects.projectRepository.list();
    const before = storage.getItem(c.demo.storageKey);
    const r = await c.projects.saveProject({ ...contractProject, status: "settled" });
    expect(!r.ok && r.error.code).toBe("INCONSISTENT_TIMELINE");
    expect(storage.getItem(c.demo.storageKey)).toBe(before);
  });

  it("reiniciar los datos simulados borra lo escrito", async () => {
    const storage = memoryStorage();
    const c = createContainer({ clock, storage });
    await c.projects.saveProperty(contractProperty);
    c.demo.reset();
    expect(await createContainer({ clock, storage }).projects.propertyRepository.findById(contractProperty.id)).toBeNull();
  });
});

describe("Cambio de etapa W-3 a través del contenedor", () => {
  const byCode = async (c: ReturnType<typeof createContainer>, code: string) => {
    const found = (await c.projects.projectRepository.list()).find((p) => p.code === code);
    if (found === undefined) throw new Error(`sin ${code}`);
    return found;
  };

  it("comprar la oportunidad en due diligence sobrevive a recargar y sella la fecha de hoy", async () => {
    const storage = memoryStorage();
    const c = createContainer({ clock, storage });
    const dd = await byCode(c, "M2-007");
    const r = await c.projects.changeProjectStage(dd.id, "acquired");
    expect(r.ok).toBe(true);
    const reloaded = await byCode(createContainer({ clock, storage }), "M2-007");
    expect(reloaded.status).toBe("acquired");
    expect(reloaded.timeline.acquiredOn).toBe(clock.today());
  });

  it("publicar sin la ficha completa se rechaza con lo que falta y no toca el almacenamiento", async () => {
    const storage = memoryStorage();
    const c = createContainer({ clock, storage });
    const dd = await byCode(c, "M2-007");
    await c.projects.changeProjectStage(dd.id, "acquired");
    const before = storage.getItem(c.demo.storageKey);
    const r = await c.projects.changeProjectStage(dd.id, "funding");
    expect(!r.ok && r.error.code).toBe("NOT_READY_TO_PUBLISH");
    expect(storage.getItem(c.demo.storageKey)).toBe(before);
  });

  it("poner en venta un proyecto en obra se refleja en la cara pública tras recargar", async () => {
    const storage = memoryStorage();
    const c = createContainer({ clock, storage });
    const works = await byCode(c, "M2-005");
    expect((await c.projects.changeProjectStage(works.id, "on_sale")).ok).toBe(true);
    const listed = await createContainer({ clock, storage }).participations.listMarketplace();
    expect(listed.find((l) => l.code === "M2-005")?.stage).toBe("on_sale");
  });
});

describe("Venta y liquidación W-5 a través del contenedor", () => {
  const onSale = async (c: ReturnType<typeof createContainer>) => {
    const found = (await c.projects.projectRepository.list()).find((p) => p.code === "M2-004");
    if (found === undefined) throw new Error("sin M2-004");
    return found;
  };

  it("la venta y la liquidación (con pérdida) sobreviven a un contenedor nuevo sobre el mismo almacenamiento", async () => {
    const storage = memoryStorage();
    const c = createContainer({ clock, storage });
    const project = await onSale(c);
    expect(project.status).toBe("on_sale");

    const sale = await c.finance.recordProjectSale({
      projectId: project.id,
      salePrice: usdUnits(47_000),
      saleCosts: usdUnits(1_000),
      signedOn: clock.today(),
    });
    expect(sale.ok).toBe(true);
    const afterSale = createContainer({ clock, storage });
    expect((await afterSale.projects.projectRepository.findById(project.id))?.status).toBe("sold");
    expect((await afterSale.finance.saleRepository.findByProject(project.id))?.salePrice).toEqual(usdUnits(47_000));

    const settled = await afterSale.finance.settleProject(project.id);
    expect(settled.ok && settled.value.distribution.kind).toBe("loss");
    const reloaded = createContainer({ clock, storage });
    expect((await reloaded.projects.projectRepository.findById(project.id))?.status).toBe("settled");
    expect(await reloaded.finance.settlementRepository.findByProject(project.id)).toEqual(settled.ok ? settled.value : null);
    expect(await reloaded.finance.saleRepository.list()).toHaveLength(3);
  });

  it("una venta rechazada no toca el almacenamiento", async () => {
    const storage = memoryStorage();
    const c = createContainer({ clock, storage });
    const project = await onSale(c);
    await c.projects.projectRepository.list();
    const before = storage.getItem(c.demo.storageKey);
    const r = await c.finance.recordProjectSale({
      projectId: project.id,
      salePrice: usdUnits(1_000),
      saleCosts: usdUnits(2_000),
      signedOn: clock.today(),
    });
    expect(!r.ok && r.error.code).toBe("SALE_COSTS_EXCEED_PRICE");
    expect(storage.getItem(c.demo.storageKey)).toBe(before);
  });
});
