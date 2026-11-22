"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { isDemoRole, ZONE_DEFAULT_ROLE, type DemoRole, type Zone } from "./demo-role";

type DemoRoleState = {
  /** null = aún no hay un rol elegido o rehidratado; el selector usa ZONE_DEFAULT_ROLE. */
  readonly role: DemoRole | null;
  setRole(role: DemoRole): void;
};

export const ROLE_STORAGE_KEY = "club-ui:v1";

export const useDemoRoleStore = create<DemoRoleState>()(
  persist(
    (set) => ({
      role: null,
      setRole: (role) => set({ role }),
    }),
    {
      name: ROLE_STORAGE_KEY,
      storage: createJSONStorage(() => window.localStorage),
      skipHydration: true,
      partialize: (s) => ({ role: s.role }),
      merge: (persisted, current) => {
        const stored = (persisted as { role?: unknown } | null | undefined)?.role;
        return { ...current, role: isDemoRole(stored) ? stored : null };
      },
    },
  ),
);

/** Rol efectivo para la UI: el guardado o el de la zona. Seguro en SSR. */
export function useActiveRole(zone: Zone): DemoRole {
  const role = useDemoRoleStore((s) => s.role);
  return role ?? ZONE_DEFAULT_ROLE[zone];
}
