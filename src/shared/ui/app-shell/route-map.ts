import type { Zone } from "./demo-role";

export type RouteId =
  | "p1" | "p2" | "p3" | "p4" | "p5" | "p6" | "p7" | "p8"
  | "b1" | "b2" | "b3" | "b4" | "b5" | "b6";

export type AppPath = `/${string}`;

export type RouteEntry = {
  readonly id: RouteId;
  readonly zone: Zone;
  /** URL concreta que se navega (en las rutas dinámicas, con el proyecto de ejemplo). */
  readonly href: AppPath;
  /** Patrón del árbol app/ (documental; lo comprueba un test contra href). */
  readonly pattern: string;
  /** Paso siguiente del flujo de negocio (docs/planes/000 §El flujo). */
  readonly next: RouteId;
};

/** [SUPUESTO S3] Proyecto de ejemplo para P4, P5 y B3 mientras no haya datos. */
export const EXAMPLE_PROJECT_SLUG = "m2-001";

const SLUG = EXAMPLE_PROJECT_SLUG;

export const ROUTES: Readonly<Record<RouteId, RouteEntry>> = {
  p1: { id: "p1", zone: "public", pattern: "(publico)/page.tsx", href: "/", next: "p2" },
  p2: { id: "p2", zone: "public", pattern: "(publico)/registro", href: "/registro", next: "p3" },
  p3: { id: "p3", zone: "investor", pattern: "(inversionista)/proyectos", href: "/proyectos", next: "p4" },
  p4: { id: "p4", zone: "investor", pattern: "(inversionista)/proyectos/[slug]", href: `/proyectos/${SLUG}`, next: "p5" },
  p5: { id: "p5", zone: "investor", pattern: "(inversionista)/proyectos/[slug]/participar", href: `/proyectos/${SLUG}/participar`, next: "p6" },
  p6: { id: "p6", zone: "investor", pattern: "(inversionista)/portafolio", href: "/portafolio", next: "p3" },
  p7: { id: "p7", zone: "investor", pattern: "(inversionista)/club", href: "/club", next: "p3" },
  p8: { id: "p8", zone: "investor", pattern: "(inversionista)/cuenta", href: "/cuenta", next: "p6" },
  b1: { id: "b1", zone: "admin", pattern: "admin/page.tsx", href: "/admin", next: "b2" },
  b2: { id: "b2", zone: "admin", pattern: "admin/adquisiciones", href: "/admin/adquisiciones", next: "b3" },
  b3: { id: "b3", zone: "admin", pattern: "admin/proyectos/[id]", href: `/admin/proyectos/${SLUG}`, next: "b4" },
  b4: { id: "b4", zone: "admin", pattern: "admin/comercializacion", href: "/admin/comercializacion", next: "b5" },
  b5: { id: "b5", zone: "admin", pattern: "admin/finanzas", href: "/admin/finanzas", next: "p6" },
  b6: { id: "b6", zone: "admin", pattern: "admin/crm", href: "/admin/crm", next: "b1" },
};

export const ROUTE_IDS: readonly RouteId[] = [
  "p1", "p2", "p3", "p4", "p5", "p6", "p7", "p8", "b1", "b2", "b3", "b4", "b5", "b6",
];

export const NAV_ITEMS: Readonly<Record<Zone, readonly RouteId[]>> = {
  public: ["p1", "p3", "p7", "p2"],
  investor: ["p3", "p6", "p7", "p8"],
  admin: ["b1", "b2", "b3", "b4", "b5", "b6"],
};

/** CTA destacado de la navegación pública (botón Verde Profundo). */
export const PUBLIC_NAV_CTA: RouteId = "p2";

export function routeHref(id: RouteId): AppPath {
  return ROUTES[id].href;
}

/** Ruta activa: coincidencia exacta o el prefijo más largo de NAV_ITEMS de la zona. */
export function activeRouteId(pathname: string, zone: Zone): RouteId | null {
  const items = NAV_ITEMS[zone];
  const exact = items.find((id) => ROUTES[id].href === pathname);
  if (exact) return exact;
  let best: RouteId | null = null;
  let bestLen = 0;
  for (const id of items) {
    const href = ROUTES[id].href;
    if (href === "/") continue;
    if (pathname.startsWith(`${href}/`) && href.length > bestLen) {
      best = id;
      bestLen = href.length;
    }
  }
  return best;
}
