import { describe, expect, it } from "vitest";
import { isoDate } from "@/shared/domain/calendar-date";
import { fixedClock } from "@/shared/domain/clock";
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
    const before = storage.getItem("club-demo:v2");
    const r = await c.projects.saveProject({ ...contractProject, status: "settled" });
    expect(!r.ok && r.error.code).toBe("INCONSISTENT_TIMELINE");
    expect(storage.getItem("club-demo:v2")).toBe(before);
  });

  it("reiniciar los datos simulados borra lo escrito", async () => {
    const storage = memoryStorage();
    const c = createContainer({ clock, storage });
    await c.projects.saveProperty(contractProperty);
    c.demo.reset();
    expect(await createContainer({ clock, storage }).projects.propertyRepository.findById(contractProperty.id)).toBeNull();
  });
});
