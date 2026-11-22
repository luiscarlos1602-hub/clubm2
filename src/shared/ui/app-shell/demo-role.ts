import type { AppPath } from "./route-map";

export type Zone = "public" | "investor" | "admin";
export type DemoRole = "visitor" | "investor" | "admin";

export const DEMO_ROLES: readonly DemoRole[] = ["visitor", "investor", "admin"];

/** Adónde lleva el selector al elegir cada rol. */
export const ROLE_HOME: Readonly<Record<DemoRole, AppPath>> = {
  visitor: "/",
  investor: "/proyectos",
  admin: "/admin",
};

/** Rol que muestra el selector mientras no haya uno guardado (y en el render del servidor). */
export const ZONE_DEFAULT_ROLE: Readonly<Record<Zone, DemoRole>> = {
  public: "visitor",
  investor: "investor",
  admin: "admin",
};

export function isDemoRole(value: unknown): value is DemoRole {
  return typeof value === "string" && (DEMO_ROLES as readonly string[]).includes(value);
}
