import { beforeEach, describe, expect, it, vi } from "vitest";

const mem = vi.hoisted(() => {
  const m = new Map<string, string>();
  vi.stubGlobal("window", { localStorage: {
    getItem: (k: string) => m.get(k) ?? null,
    setItem: (k: string, v: string) => void m.set(k, v),
    removeItem: (k: string) => void m.delete(k),
  } });
  return m;
});

import { ROLE_STORAGE_KEY, useDemoRoleStore } from "./role-store";

describe("role-store", () => {
  beforeEach(() => {
    mem.clear();
    useDemoRoleStore.setState({ role: null });
  });
  it("usa la clave club-ui:v1", () => {
    expect(ROLE_STORAGE_KEY).toBe("club-ui:v1");
  });
  it("setRole cambia el rol", () => {
    useDemoRoleStore.getState().setRole("admin");
    expect(useDemoRoleStore.getState().role).toBe("admin");
  });
  it("descarta un valor persistido inválido", async () => {
    mem.set(ROLE_STORAGE_KEY, JSON.stringify({ state: { role: "dueño" }, version: 0 }));
    await useDemoRoleStore.persist.rehydrate();
    expect(useDemoRoleStore.getState().role).toBeNull();
  });
  it("rehidrata un valor válido", async () => {
    mem.set(ROLE_STORAGE_KEY, JSON.stringify({ state: { role: "investor" }, version: 0 }));
    await useDemoRoleStore.persist.rehydrate();
    expect(useDemoRoleStore.getState().role).toBe("investor");
  });
});
