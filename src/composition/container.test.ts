import { describe, expect, it } from "vitest";
import { isoDate } from "@/shared/domain/calendar-date";
import { fixedClock } from "@/shared/domain/clock";
import { memoryStorage } from "@/shared/infrastructure/browser-storage";
import { createContainer } from "./container";

const clock = fixedClock(isoDate("2026-11-22"));

describe("Container", () => {
  it("los repositorios sirven las 7 semillas", async () => {
    const c = createContainer({ clock, storage: memoryStorage() });
    expect(await c.projects.projectRepository.list()).toHaveLength(7);
    expect(await c.projects.propertyRepository.list()).toHaveLength(7);
    expect(await c.participations.classRepository.list()).toHaveLength(6);
    expect(await c.finance.economicsRepository.list()).toHaveLength(7);
    expect(await c.finance.settlementRepository.list()).toHaveLength(2);
    expect(c.demo.seededOn()).toBe("2026-11-22");
    expect(c.demo.storageKey).toBe("club-demo:v1");
  });

  it("reset descarta cambios escritos", async () => {
    const storage = memoryStorage();
    const c = createContainer({ clock, storage });
    await c.projects.projectRepository.list(); // la primera lectura siembra y persiste
    const stored = JSON.parse(storage.getItem("club-demo:v1") ?? "null") as { projects: { projects: unknown[] } } | null;
    expect(stored).not.toBeNull();
    // simula un cambio persistido por otra sesión: se borra un proyecto
    const changed = { ...stored, projects: { ...stored?.projects, projects: stored?.projects.projects.slice(1) } };
    storage.setItem("club-demo:v1", JSON.stringify(changed));
    const c2 = createContainer({ clock, storage });
    expect(await c2.projects.projectRepository.list()).toHaveLength(6);
    c2.demo.reset();
    expect(await c2.projects.projectRepository.list()).toHaveLength(7);
    const after = JSON.parse(storage.getItem("club-demo:v1") ?? "null") as { projects: { projects: unknown[] } } | null;
    expect(after?.projects.projects).toHaveLength(7);
  });

  it("holderId es inv_demo", () => {
    expect(createContainer({ clock, storage: null }).demo.holderId).toBe("inv_demo");
  });

  it("funciona sin storage (memoria)", async () => {
    const c = createContainer({ clock, storage: null });
    expect(await c.projects.projectRepository.list()).toHaveLength(7);
  });

  it("no expone backoffice", () => {
    const names: string[] = [];
    const walk = (v: unknown, depth: number): void => {
      if (depth > 4 || typeof v !== "object" || v === null) return;
      for (const [k, child] of Object.entries(v)) {
        names.push(k);
        walk(child, depth + 1);
      }
    };
    walk(createContainer({ clock, storage: null }), 0);
    expect(names.filter((n) => /wheel|rueda/i.test(n))).toEqual([]);
  });
});
