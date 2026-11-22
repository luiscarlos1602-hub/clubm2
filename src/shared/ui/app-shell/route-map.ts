import type { Zone } from "./demo-role";

export type RouteId =
  | "p1"
  | "p2"
  | "p3"
  | "p4"
  | "p5"
  | "p6"
  | "p7"
  | "p8"
  | "b1"
  | "b2"
  | "b3"
  | "b4"
  | "b5"
  | "b6"
  | "b7"
  | "b8"
  | "b9"
  | "login"
  | "terminos"
  | "panel";

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

/** Proyecto de ejemplo para P4, P5 y B3 (slug real de la semilla M2-006, colocación abierta). */
export const EXAMPLE_PROJECT_SLUG = "m2-006-chacao";

const SLUG = EXAMPLE_PROJECT_SLUG;

export const ROUTES: Readonly<Record<RouteId, RouteEntry>> = {
  p1: { id: "p1", zone: "public", pattern: "(publico)/page.tsx", href: "/", next: "p2" },
  p2: { id: "p2", zone: "public", pattern: "(publico)/registro", href: "/registro", next: "panel" },
  login: {
    id: "login",
    zone: "public",
    pattern: "(publico)/ingresar",
    href: "/ingresar",
    next: "panel",
  },
  terminos: {
    id: "terminos",
    zone: "public",
    pattern: "(publico)/terminos",
    href: "/terminos",
    next: "p1",
  },
  panel: {
    id: "panel",
    zone: "investor",
    pattern: "(inversionista)/panel",
    href: "/panel",
    next: "p3",
  },
  p3: {
    id: "p3",
    zone: "investor",
    pattern: "(inversionista)/proyectos",
    href: "/proyectos",
    next: "p4",
  },
  p4: {
    id: "p4",
    zone: "investor",
    pattern: "(inversionista)/proyectos/[slug]",
    href: `/proyectos/${SLUG}`,
    next: "p5",
  },
  p5: {
    id: "p5",
    zone: "investor",
    pattern: "(inversionista)/proyectos/[slug]/participar",
    href: `/proyectos/${SLUG}/participar`,
    next: "p6",
  },
  p6: {
    id: "p6",
    zone: "investor",
    pattern: "(inversionista)/portafolio",
    href: "/portafolio",
    next: "p3",
  },
  p7: { id: "p7", zone: "investor", pattern: "(inversionista)/club", href: "/club", next: "p3" },
  p8: {
    id: "p8",
    zone: "investor",
    pattern: "(inversionista)/cuenta",
    href: "/cuenta",
    next: "p6",
  },
  b1: { id: "b1", zone: "admin", pattern: "admin/page.tsx", href: "/admin", next: "b2" },
  b2: {
    id: "b2",
    zone: "admin",
    pattern: "admin/adquisiciones",
    href: "/admin/adquisiciones",
    next: "b3",
  },
  b3: {
    id: "b3",
    zone: "admin",
    pattern: "admin/proyectos/[id]",
    href: `/admin/proyectos/${SLUG}`,
    next: "b4",
  },
  b4: {
    id: "b4",
    zone: "admin",
    pattern: "admin/comercializacion",
    href: "/admin/comercializacion",
    next: "b5",
  },
  b5: { id: "b5", zone: "admin", pattern: "admin/finanzas", href: "/admin/finanzas", next: "p6" },
  b6: { id: "b6", zone: "admin", pattern: "admin/crm", href: "/admin/crm", next: "b1" },
  b7: {
    id: "b7",
    zone: "admin",
    pattern: "admin/proyectos",
    href: "/admin/proyectos",
    next: "b8",
  },
  b8: {
    id: "b8",
    zone: "admin",
    pattern: "admin/proyectos/nuevo",
    href: "/admin/proyectos/nuevo",
    next: "b7",
  },
  b9: {
    id: "b9",
    zone: "admin",
    pattern: "admin/proyectos/[id]/editar",
    href: `/admin/proyectos/${SLUG}/editar`,
    next: "b7",
  },
};

export const ROUTE_IDS: readonly RouteId[] = [
  "p1",
  "p2",
  "login",
  "terminos",
  "panel",
  "p3",
  "p4",
  "p5",
  "p6",
  "p7",
  "p8",
  "b1",
  "b2",
  "b3",
  "b4",
  "b5",
  "b6",
  "b7",
  "b8",
  "b9",
];

export const NAV_ITEMS: Readonly<Record<Zone, readonly RouteId[]>> = {
  public: ["p1", "p3", "p7", "p2", "login"],
  investor: ["panel", "p3", "p6", "p7", "p8"],
  admin: ["b1", "b2", "b7", "b3", "b4", "b5", "b6"],
};

/** CTA destacado de la navegación pública (botón Verde Profundo): "Ingresar". */
export const PUBLIC_NAV_CTA: RouteId = "login";

export function routeHref(id: RouteId): AppPath {
  return ROUTES[id].href;
}

/** URL de la ficha P4 de un proyecto: `/proyectos/${slug}`. Debe coincidir con ROUTES.p4.pattern. */
export function projectHref(slug: string): AppPath {
  return `/proyectos/${slug}`;
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
