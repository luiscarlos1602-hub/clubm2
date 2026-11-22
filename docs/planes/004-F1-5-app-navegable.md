# Plan 004 · F1-5 · App navegable: layouts de 3 zonas, navegación, selector de rol, banner y las 14 rutas

Estado: borrador · Fecha: 2026-11-22 · Autor: arquitecto
Fuentes: `docs/prompts/F1-fundacion-visual.md` §F1-5 · `docs/00` §3 · `docs/planes/000-hoja-de-ruta.md` §El flujo · `docs/01` §1, §3, §4, §8.2, §8.3 · `docs/06` · ADR-004/005/008 · `docs/planes/001-F1-2-design-system.md` · `src/shared/ui/README.md` · `eslint.config.mjs` · docs de Next 16 en `node_modules/next/dist/docs/01-app/` (`route-groups.md`, `dynamic-routes.md`, `layout.md`, `link.md`, `use-pathname.md`).
Rama: `feat/app-navegacion`. Sale de `main` **después de integrar F1-2** (tiene que estar aprobado `/sistema`, según el checkpoint del prompt). Corre en paralelo con F1-4 (`datos-demo`), sin archivos compartidos (ver §6 R6).

## 1. Historia y criterios

**Historia.** Como visitante, inversionista o admin de la demo, quiero recorrer el mapa completo del producto (las 14 pantallas, en móvil y en desktop) con la navegación de cada zona, cambiar de rol sin login y ver siempre que los datos son simulados. Así entiendo el flujo de negocio de punta a punta antes de que exista la funcionalidad.

**Criterios de aceptación** (los del prompt, y los marcados [PROPUESTO], que los vuelven verificables):

- **CA1 · Tres zonas.** Existen `src/app/(publico)/layout.tsx`, `src/app/(inversionista)/layout.tsx` y `src/app/admin/layout.tsx`. Cada uno renderiza `ZoneShell` con su `zone` y nada más. [PROPUESTO] El contenedor raíz de cada zona lleva `data-testid="zona-<zone>"` y `data-zone`. `src/app/layout.tsx` (el layout raíz) **no se toca** en esta fila.
- **CA2 · Banner.** En las 14 rutas se ve `DemoBanner variant="bar"` (`data-testid="demo-banner"`), fijo arriba (`sticky top-0`), con el texto exacto de `LEGAL_COPY.demoBanner`. Se reutiliza el componente de F1-2; no se crea otro banner.
- **CA3 · Navegación responsive.** Pública e inversionista: barra horizontal desde `md` y menú `Sheet` por debajo de `md`. Admin: barra lateral desde `lg` y `Sheet` por debajo de `lg`. Los enlaces salen de `route-map.ts` (§3.2). El enlace activo lleva `aria-current="page"`. [PROPUESTO] Hay enlace "Saltar al contenido" hacia `#contenido`, `<nav aria-label>`, el botón de menú tiene un objetivo táctil de 44 px o más y, a 390 px, no hay desplazamiento horizontal.
- **CA4 · Selector de rol.** `RoleSwitcher` (Visitante · Inversionista · Admin) se ve en las 3 zonas, en móvil y en desktop, dentro de la barra de herramientas de simulación que va bajo el banner. Al elegir un rol se guarda en Zustand (`useDemoRoleStore`) y se navega al inicio de ese rol (`/`, `/proyectos`, `/admin`). [PROPUESTO] El rol persiste al recargar (`localStorage`, clave `club-ui:v1`) y no produce errores de hidratación.
- **CA5 · Las 14 rutas.** P1–P8 y B1–B6 de `docs/00 §3` existen con las URL de §3.2. Cada una muestra: encabezado `h1` (`SectionHeading level={1}`), una frase de lo que hará, `EmptyState` de marca y el enlace `siguiente-paso` al paso siguiente del flujo (§3.2, columna `next`). Cada `page.tsx` tiene menos de 60 líneas y solo compone (`01 §4 regla 4`).
- **CA6 · Flujo.** Siguiendo solo `siguiente-paso` se recorre P1 → P2 → P3 → P4 → P5 → P6 y B1 → B2 → B3 → B4 → B5 → P6 (el "momento wow": la liquidación lleva al portafolio). P6, P7 y P8 vuelven al ciclo del inversionista y B6 vuelve a B1.
- **CA7 · Copy.** Todo texto visible está en `shell-copy.ts`, `public-routes-copy.ts` o `admin-routes-copy.ts` (§3.3), o sale de `LEGAL_COPY` / `brand`. `node scripts/check-copy.mjs src` da 0 errores. **La palabra "rueda" no aparece en ninguna de las 14 rutas** (tampoco en admin: en F1 no hace falta; las ruedas llegan con B1 en F3, por `projects/backoffice.ts`). El nombre comercial solo sale de `brand.ts`, y `brand-single-source.test.ts` sigue en verde.
- **CA8 · Capas.** `pnpm lint` sin errores: `app/` solo importa `shared-ui`, `shared-lib` y `module-api`. Ningún archivo de F1-5 importa `@/modules/*/backoffice` ni `@/composition`. No se crea ningún módulo de negocio (§2, decisión D1).
- **CA9 · `data-testid`.** Están los de §5.2, en kebab-case y estables.
- **CA10 · E2E.** `tests/e2e/rutas.spec.ts` recorre las 14 rutas en `movil-390` y `desktop-1440` y verifica CA2, CA5, CA6 y CA7. `tests/e2e/navegacion.spec.ts` verifica CA3 y CA4. `andamiaje.spec.ts` se adapta a la nueva raíz. `sistema.spec.ts` sigue en verde.
- **CA11 · Verde.** `pnpm verify` pasa completo. [PROPUESTO] `pnpm build` también pasa (con `cacheComponents: true`, las rutas dinámicas exigen `Suspense` alrededor de `usePathname`, ver §6 R1). Es requisito para F1-6 (despliegue; hoy Netlify, ADR-017).

## 2. Módulos afectados

| Módulo / carpeta | Por qué | Nuevo |
|---|---|---|
| `src/shared/ui/app-shell/` | Shell de zonas, navegación, selector de rol (estado Zustand), mapa de rutas, copy del shell y de las 14 pantallas provisionales | sí |
| `src/shared/ui/README.md` | Catálogo: sección "App shell" | se amplía |
| `src/app/(publico)/**`, `src/app/(inversionista)/**`, `src/app/admin/**` | Layouts de zona y 14 `page.tsx` | sí |
| `src/app/page.tsx` | **Se elimina**: choca con `(publico)/page.tsx` (las dos resuelven `/`) | se borra |
| `tests/e2e/` | `rutas.spec.ts`, `navegacion.spec.ts`; `andamiaje.spec.ts` se adapta | sí / se cambia |

**D1 · Dónde vive el rol activo: en `src/shared/ui/app-shell/role-store.ts`, sin módulo nuevo.**
- El rol es un concepto de la **demo**, no del negocio: no tiene reglas, no lo usa ningún dominio y desaparece cuando haya auth real (F5+). `docs/01 §1` ya lo define como "estado de UI".
- Un módulo nuevo (`session` o `demo`) obligaría a registrarlo en `architecture.modules.mjs`, darle las 4 capas vacías y decidir su lugar en el orden de §4 regla 3 (tendría que ir antes de `projects` para que todos lo lean). Sería un cambio de arquitectura con ADR, y no hay regla de negocio que lo justifique.
- Con `shared-ui` las capas cumplen sin tocar `eslint.config.mjs`: `app → shared-ui` ✅, `modules/*/ui → shared-ui` ✅ (F2 podrá leer el rol con `useActiveRole`), y `shared-ui → shared-ui | shared-lib | shared-domain` ✅. `zustand`, `next/link` y `next/navigation` son paquetes externos y `boundaries` no los restringe.
- El demo-store de F1-4 (`club-demo:v1`) es otra cosa: datos de negocio simulados, en `shared/infrastructure`. El rol usa su propia clave (`club-ui:v1`) y "Reiniciar datos simulados" no lo borra ([SUPUESTO] S2).

**D2 · El copy de las 14 pantallas provisionales vive en `shared/ui/app-shell/`, no en módulos.** De los 9 módulos de §3, 7 no existen todavía (no se adelantan módulos de F3, según el prompt F1-1). En F2/F3 cada pantalla reemplaza su `RoutePlaceholder` por los componentes de su módulo y su copy pasa a `modules/<m>/ui/copy.ts`. Lo que se queda en `app-shell` son las etiquetas de navegación y el mapa de rutas. Precedente: `shared/ui/showcase/showcase-copy.ts` (plan 001 R1).

**D3 · La navegación depende de la zona; el rol solo decide adónde te lleva el selector.** No hay protección de rutas en F1 (no hay auth): un admin puede abrir `/portafolio` para ver lo que ve el inversionista, y eso es justo lo que necesita el "momento wow". El selector muestra el rol guardado y, si no hay ninguno, el rol por defecto de la zona.

No se toca: `src/app/layout.tsx` (F1-4 le añade los providers), `src/app/sistema/**`, `src/shared/ui/brand/**`, `src/shared/ui/primitives/**`, `src/modules/**`, `src/composition/**`, `eslint.config.mjs`, `architecture.modules.mjs`.

## 3. Contratos (TypeScript)

Es el acuerdo entre P1, P2, P3 y P4. Si cambia, se avisa al agente principal. Todo vive en `src/shared/ui/app-shell/` y se exporta por `src/shared/ui/app-shell/index.ts`. Los consumidores importan desde `@/shared/ui/app-shell`.

### 3.1 `demo-role.ts` (P1): tipos y tablas puros, sin React
```ts
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

export function isDemoRole(value: unknown): value is DemoRole;
```
`AppPath` se importa de `route-map.ts` (§3.2).

### 3.2 `route-map.ts` (P1): mapa único de las 14 rutas
**Sin imports con alias `@/`** (solo `./demo-role`, por tipo). Así el E2E lo importa por ruta relativa.
```ts
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

/** [SUPUESTO S3] Proyecto de ejemplo para P4, P5 y B3 mientras no haya datos. F1-4 debe usar este slug para M2-001; si elige otro, solo cambia esta constante. */
export const EXAMPLE_PROJECT_SLUG = "m2-001";

export const ROUTES: Readonly<Record<RouteId, RouteEntry>>;
export const ROUTE_IDS: readonly RouteId[];            // en el orden de la tabla de abajo
export const NAV_ITEMS: Readonly<Record<Zone, readonly RouteId[]>>;
/** CTA destacado de la navegación pública (botón Arcilla). */
export const PUBLIC_NAV_CTA: RouteId;                  // "p2"
export function routeHref(id: RouteId): AppPath;
/** Ruta activa para la navegación: coincidencia exacta o el prefijo más largo de NAV_ITEMS de la zona. */
export function activeRouteId(pathname: string, zone: Zone): RouteId | null;
```

Valores fijos (es el contrato de URL y de flujo):

| id | zona | `pattern` (carpeta en `src/app`) | `href` | `next` |
|---|---|---|---|---|
| p1 | public | `(publico)/page.tsx` | `/` | p2 |
| p2 | public | `(publico)/registro` | `/registro` | p3 |
| p3 | investor | `(inversionista)/proyectos` | `/proyectos` | p4 |
| p4 | investor | `(inversionista)/proyectos/[slug]` | `/proyectos/m2-001` | p5 |
| p5 | investor | `(inversionista)/proyectos/[slug]/participar` | `/proyectos/m2-001/participar` | p6 |
| p6 | investor | `(inversionista)/portafolio` | `/portafolio` | p3 |
| p7 | investor | `(inversionista)/club` | `/club` | p3 |
| p8 | investor | `(inversionista)/cuenta` | `/cuenta` | p6 |
| b1 | admin | `admin/page.tsx` | `/admin` | b2 |
| b2 | admin | `admin/adquisiciones` | `/admin/adquisiciones` | b3 |
| b3 | admin | `admin/proyectos/[id]` | `/admin/proyectos/m2-001` | b4 |
| b4 | admin | `admin/comercializacion` | `/admin/comercializacion` | b5 |
| b5 | admin | `admin/finanzas` | `/admin/finanzas` | p6 |
| b6 | admin | `admin/crm` | `/admin/crm` | b1 |

`NAV_ITEMS`: `public: ["p1","p3","p7","p2"]` (p2 se pinta como CTA) · `investor: ["p3","p6","p7","p8"]` · `admin: ["b1","b2","b3","b4","b5","b6"]`. P4 y P5 no van en el menú: se llega a ellas por el flujo. Para P4/P5, `activeRouteId` marca P3 por prefijo.

### 3.3 Copy (P1): solo datos, sin JSX
```ts
// shell-copy.ts
export const SHELL_COPY = {
  skipToContent: "Saltar al contenido",
  navLabel: { public: "Navegación principal", investor: "Navegación del inversionista", admin: "Navegación del backoffice" },
  menuOpen: "Abrir menú",
  menuTitle: "Menú",
  roleSwitcherLabel: "Ver como",
  roles: { visitor: "Visitante", investor: "Inversionista", admin: "Admin" },
  zoneTag: { public: "", investor: "Zona del inversionista", admin: "Backoffice" },
  footerNote: "Plataforma en construcción: lo que ves es el mapa del producto.",
} as const satisfies { roles: Record<DemoRole, string> } & Record<string, unknown>;

// public-routes-copy.ts y admin-routes-copy.ts comparten este tipo (definido en route-copy-types.ts)
export type RouteCopy = {
  readonly navLabel: string;      // etiqueta en el menú
  readonly title: string;         // h1 y <title>
  readonly phrase: string;        // una frase: qué hará esta pantalla
  readonly emptyTitle: string;
  readonly emptyDescription: string;
  readonly nextLabel: string;     // texto del enlace siguiente-paso
};
export const PUBLIC_ROUTES_COPY: Readonly<Record<"p1"|"p2"|"p3"|"p4"|"p5"|"p6"|"p7"|"p8", RouteCopy>>;
export const ADMIN_ROUTES_COPY: Readonly<Record<"b1"|"b2"|"b3"|"b4"|"b5"|"b6", RouteCopy>>;
export function routeCopy(id: RouteId): RouteCopy;   // en route-copy.ts, une los dos
```

Texto propuesto (P1 lo copia tal cual; `revisor-cumplimiento` lo valida; cualquier cambio tiene que pasar `check-copy`):

| id | navLabel | title | phrase | emptyTitle · emptyDescription | nextLabel |
|---|---|---|---|---|---|
| p1 | Inicio | Así funciona el club | Aquí verás cómo la empresa compra inmuebles con capital propio, los reforma y los vende, y cómo se reparte el excedente entre el fondo de participaciones y la empresa. | La portada está en construcción · Pronto: la propuesta del club, el recorrido compra → reforma → venta → reparto y sus riesgos, explicados con claridad. | Regístrate gratis |
| p2 | Regístrate gratis | Registro gratuito | Aquí crearás tu perfil, nos contarás tu experiencia y leerás los riesgos antes de participar. | El registro aún no está abierto · Es una vista previa: por ahora no se guarda ningún dato. | Ver proyectos |
| p3 | Proyectos | Proyectos | Aquí verás cada proyecto con su etapa, las participaciones disponibles y el plazo objetivo como proyección. | Todavía no hay proyectos publicados · Los proyectos simulados aparecerán aquí. | Ver un proyecto de ejemplo |
| p4 | Proyecto | Ficha del proyecto | Aquí verás el inmueble, el presupuesto desglosado, los escenarios y un simulador del reparto del excedente. | La ficha de este proyecto aún no está disponible · Pronto: evidencia, cronograma de obra, actualizaciones fechadas y riesgos. | Elegir participaciones |
| p5 | Participar | Participar en el proyecto | Aquí elegirás cuántas participaciones económicas reservar, revisarás el resumen y aceptarás los riesgos. La reserva será simulada. | La reserva aún no está habilitada · Ninguna reserva de esta demo es una operación real. | Ir a mi portafolio |
| p6 | Mi portafolio | Mi portafolio | Aquí verás, por separado, tu capital aportado, la ganancia realizada y la proyección de cada proyecto. | Aún no tienes participaciones · Cuando reserves una participación simulada, aparecerá aquí. | Explorar proyectos |
| p7 | El club | El club | Aquí encontrarás los eventos, las charlas y la academia del club. | Aún no hay eventos publicados · La agenda y la academia se publicarán aquí. | Explorar proyectos |
| p8 | Mi cuenta | Mi cuenta | Aquí verás tu perfil, el estado de tu verificación (simulada) y tus notificaciones. | Tu perfil aún no tiene datos · La verificación de esta demo es simulada. | Ir a mi portafolio |
| b1 | Panel | Panel de operación | Aquí verás los indicadores internos: capital inmovilizado, proyectos por etapa y avance de la colocación. | Sin indicadores todavía · Se calcularán con los datos simulados de los proyectos. | Ver adquisiciones |
| b2 | Adquisiciones | Adquisiciones | Aquí seguirás cada oportunidad desde la evaluación y el due diligence hasta la compra con capital propio. | No hay oportunidades en evaluación · El pipeline de oportunidades aparecerá aquí. | Ver proyecto y obra |
| b3 | Proyecto y obra | Proyecto y obra | Aquí compararás el presupuesto con el gasto real, seguirás los hitos y publicarás los avances que verá el inversionista. | Sin obra registrada · Las órdenes de trabajo y los avances aparecerán aquí. | Ir a comercialización |
| b4 | Comercialización | Comercialización | Aquí registrarás la publicación, las visitas, las ofertas y el cierre de la venta. | Sin inmuebles en venta · Las publicaciones y las ofertas aparecerán aquí. | Ir a finanzas |
| b5 | Finanzas | Finanzas y liquidación | Aquí verás la caja de cada proyecto y harás la liquidación con el motor de reparto 25/75. | Sin movimientos de caja · La caja y las liquidaciones aparecerán aquí. | Ver el portafolio del inversionista |
| b6 | Inversionistas y CRM | Inversionistas y CRM | Aquí seguirás los registros, el embudo desde el registro hasta la primera participación y el origen de cada contacto. | Sin registros todavía · Los registros del formulario de P2 aparecerán aquí. | Volver al panel |

Notas: la descripción vacía de b6 dice "formulario de registro", no "P2" (los códigos internos no se muestran; P1 corrige esa celda a "Los registros del formulario de registro aparecerán aquí"). El separador " · " de la columna 5 solo divide `emptyTitle` de `emptyDescription` en esta tabla. Las etiquetas del menú P2 ("Regístrate gratis") y su `nextLabel` en P1 coinciden a propósito.

### 3.4 `role-store.ts` (P1): Zustand, `"use client"`
```ts
"use client";
type DemoRoleState = {
  /** null = aún no hay un rol elegido o rehidratado; el selector usa ZONE_DEFAULT_ROLE. */
  readonly role: DemoRole | null;
  setRole(role: DemoRole): void;
};
export const ROLE_STORAGE_KEY = "club-ui:v1";
/** create<DemoRoleState>()(persist(..., { name: ROLE_STORAGE_KEY, storage: createJSONStorage(() => localStorage), skipHydration: true, partialize: s => ({ role: s.role }) })) */
export const useDemoRoleStore: UseBoundStore<StoreApi<DemoRoleState>> & { persist: /* api de zustand/middleware */ };
/** Rol efectivo para la UI: el guardado o el de la zona. Seguro en SSR (el primer render es igual en servidor y cliente). */
export function useActiveRole(zone: Zone): DemoRole;
```
Rehidratación: `RoleSwitcher` llama una sola vez a `useDemoRoleStore.persist.rehydrate()` en `useEffect`. Con `skipHydration: true`, el primer render del cliente coincide con el del servidor y no hay errores de hidratación. Al rehidratar, un valor que no pasa `isDemoRole` se descarta (`merge` valida).

### 3.5 Componentes (P2)
Todos aceptan `className?` y `data-testid?` (el `TestIdProp` de `@/shared/ui/brand/types`, importado por ruta interna de `shared/ui`, permitido) y exportan con nombre.

```ts
// ZoneShell.tsx · Server Component · testid "zona-<zone>" · data-zone={zone}
export type ZoneShellProps = TestIdProp & {
  zone: Zone;
  children: ReactNode;
  /** Hueco para herramientas de simulación en la barra bajo el banner. F1-4 conecta aquí "Reiniciar datos simulados" (§6 R6). */
  demoTools?: ReactNode;
};
// Estructura: SkipLink → <DemoBanner variant="bar" className="sticky top-0 z-50"/> → DemoToolbar (RoleSwitcher + demoTools)
//   → header (Wordmark enlazado a ROLE_HOME de la zona, testid "inicio-zona"; nav de escritorio; botón MobileNav)
//   → [admin ≥ lg: aside con nav lateral] → <main id="contenido" tabIndex={-1}> → footer (testid "pie-zona": brand.tagline, LegalNotice notice="riskNotice", SHELL_COPY.footerNote).

// NavLinks.tsx · presentacional, sin hooks (sirve de fallback de Suspense) · testid por enlace "nav-link-<id>"
export type NavLinksProps = TestIdProp & {
  zone: Zone;
  orientation: "horizontal" | "vertical";
  activeId: RouteId | null;            // aria-current="page" en ese enlace
  onNavigate?: () => void;             // MobileNav lo usa para cerrar el Sheet
};
// p2 en la zona pública se pinta como <Button asChild size="sm"> (CTA Arcilla); el resto como enlaces.

// ActiveNavLinks.tsx · "use client" · usePathname() + activeRouteId() → <NavLinks activeId=…/>
export type ActiveNavLinksProps = Omit<NavLinksProps, "activeId">;
// SIEMPRE se monta dentro de <Suspense fallback={<NavLinks … activeId={null}/>}> (ver §6 R1).

// DesktopNav: no es un componente aparte. ZoneShell monta <nav aria-label data-testid="nav-principal" className="hidden md:flex"> (admin: "hidden lg:flex", vertical, en el aside).

// MobileNav.tsx · "use client" · Sheet (primitives/sheet) controlado
export type MobileNavProps = TestIdProp & { zone: Zone };
// Disparador: Button ghost size icon (≥ 44 px), aria-label SHELL_COPY.menuOpen, testid "nav-movil-abrir", className "md:hidden" (admin "lg:hidden").
// Contenido: SheetContent side="left" testid "nav-movil", SheetTitle SHELL_COPY.menuTitle, <nav aria-label> con ActiveNavLinks vertical en Suspense; onNavigate cierra.

// RoleSwitcher.tsx · "use client" · Select (primitives/select) · visible en todos los tamaños
export type RoleSwitcherProps = TestIdProp & { zone: Zone };
// Label visible SHELL_COPY.roleSwitcherLabel; SelectTrigger testid "selector-rol"; SelectItem testid "selector-rol-<role>".
// value = useActiveRole(zone); onValueChange(r) → isDemoRole(r) && setRole(r); router.push(ROLE_HOME[r]).
// useEffect(() => { void useDemoRoleStore.persist.rehydrate(); }, []).

// RoutePlaceholder.tsx · Server Component · testid "pagina-<id>" · data-route-id={id}
export type RoutePlaceholderProps = TestIdProp & { routeId: RouteId };
// <section aria-labelledby> con SectionHeading level={1} (title, description = phrase)
//   + EmptyState (title=emptyTitle, description=emptyDescription, icon según ROUTE_ICONS, action=<Button asChild><Link href={routeHref(next)} data-testid="siguiente-paso">{nextLabel}<ArrowRight aria-hidden/></Link></Button>).
// No muestra el id interno (P3, B1…) en pantalla.

// route-icons.ts · Record<RouteId, LucideIcon> (Home, UserPlus, LayoutGrid, Building2, HandCoins, Wallet, Users, UserCircle, Gauge, Search, HardHat, Megaphone, Landmark, Contact). P2 es dueño.

// route-metadata.ts (P1) · para los page.tsx
export function routeMetadata(id: RouteId): Metadata;   // { title: routeCopy(id).title }; import type { Metadata } from "next"
```

### 3.6 Barrel `index.ts` (P2)
Exporta: `ZoneShell`, `RoutePlaceholder`, `RoleSwitcher`, `useActiveRole`, `useDemoRoleStore`, `routeMetadata`, `ROUTES`, `ROUTE_IDS`, `routeHref`, `EXAMPLE_PROJECT_SLUG` y los tipos `Zone`, `DemoRole`, `RouteId`, `AppPath`, `ZoneShellProps`, `RoutePlaceholderProps`. **Riesgo de mezcla servidor/cliente:** el barrel reexporta módulos `"use client"`. Eso es válido en Next 16 (la frontera la marca cada archivo), pero `ZoneShell` (servidor) importa `RoleSwitcher`/`MobileNav` por su archivo, no por el barrel, para evitar ciclos.

### 3.7 Forma de los archivos de `app/` (P3)
```tsx
// src/app/(inversionista)/layout.tsx
import { ZoneShell } from "@/shared/ui/app-shell";
export default function InvestorLayout({ children }: LayoutProps<"/">) {   // o { children: React.ReactNode }
  return <ZoneShell zone="investor">{children}</ZoneShell>;
}

// src/app/(inversionista)/proyectos/[slug]/page.tsx
import { RoutePlaceholder, routeMetadata } from "@/shared/ui/app-shell";
export const metadata = routeMetadata("p4");
export default function ProjectPage() {        // NO lee params en F1 (§6 R1)
  return <RoutePlaceholder routeId="p4" />;
}
```
`src/app/admin/layout.tsx` añade `export const metadata: Metadata = { robots: { index: false, follow: false } }` [PROPUESTO]: el backoffice no se indexa.

## 4. Paquetes

| # | Agente | Archivos (exclusivos) | Depende de | Paralelo con | Criterios |
|---|---|---|---|---|---|
| P1 | constructor-ui | `src/shared/ui/app-shell/demo-role.ts` · `demo-role.test.ts` · `route-map.ts` · `route-map.test.ts` · `route-copy-types.ts` · `shell-copy.ts` · `public-routes-copy.ts` · `admin-routes-copy.ts` · `route-copy.ts` · `route-copy.test.ts` · `role-store.ts` · `role-store.test.ts` · `route-metadata.ts` | contratos §3.1–3.4 | P2, P4 (redacción), F1-4 | CA4 (estado), CA6, CA7 |
| P2 | constructor-ui | `src/shared/ui/app-shell/ZoneShell.tsx` · `NavLinks.tsx` · `ActiveNavLinks.tsx` · `MobileNav.tsx` · `RoleSwitcher.tsx` · `RoutePlaceholder.tsx` · `SkipLink.tsx` · `DemoToolbar.tsx` · `route-icons.ts` · `index.ts` · `src/shared/ui/README.md` (solo añadir la sección "App shell") | firmas de P1 (§3); si P1 no ha terminado, escribe contra las firmas y verifica al final | P1, P4 (redacción), F1-4 | CA1–CA4, CA9 |
| P3 | constructor-ui | **eliminar** `src/app/page.tsx` · `src/app/(publico)/layout.tsx` · `(publico)/page.tsx` · `(publico)/registro/page.tsx` · `src/app/(inversionista)/layout.tsx` · `(inversionista)/proyectos/page.tsx` · `(inversionista)/proyectos/[slug]/page.tsx` · `(inversionista)/proyectos/[slug]/participar/page.tsx` · `(inversionista)/portafolio/page.tsx` · `(inversionista)/club/page.tsx` · `(inversionista)/cuenta/page.tsx` · `src/app/admin/layout.tsx` · `admin/page.tsx` · `admin/adquisiciones/page.tsx` · `admin/proyectos/[id]/page.tsx` · `admin/comercializacion/page.tsx` · `admin/finanzas/page.tsx` · `admin/crm/page.tsx` | P2 (`index.ts`) | P4 (redacción) | CA1, CA5, CA8, CA11 (`build`) |
| P4 | qa-e2e | `tests/e2e/rutas.spec.ts` · `tests/e2e/navegacion.spec.ts` · `tests/e2e/andamiaje.spec.ts` (adaptar: `/` muestra `pagina-p1`) | redacta en paralelo con los testid de §5.2 y `route-map.ts`; se ejecuta después de P3 | P1, P2, P3 | CA2–CA6, CA10 |

Orden: **P1 ∥ P2 ∥ (redacción de P4)** → **P3** → ejecución de P4 → `pnpm verify` + `pnpm build` (lo corre el orquestador) → `revisor-codigo` ∥ `revisor-cumplimiento` → integrar. P3 es mecánico (17 archivos de 5 a 12 líneas). Lo puede hacer el mismo agente de P2 cuando termine, sin abrir otro.

Detalle por paquete:

**P1 · Datos del shell.** `route-map.ts` no importa nada con `@/` ni de React. `activeRouteId`: coincidencia exacta primero; si no, el `href` de `NAV_ITEMS[zone]` más largo que sea prefijo de `pathname` seguido de `/` (así `/admin` no gana a `/admin/crm` y `/` solo coincide consigo mismo). El copy se copia de §3.3; antes de entregar, `node scripts/check-copy.mjs src/shared/ui/app-shell`. Nada de "rueda", "Club M²" ni "acción".

**P2 · Componentes.** Reutiliza `DemoBanner`, `Wordmark`, `SectionHeading`, `EmptyState` y `LegalNotice` de `@/shared/ui/brand`, y `button`, `sheet` y `select` de `@/shared/ui/primitives/*`. **No crea** variantes de banner, encabezado ni estado vacío. Si algo falta (p. ej. que `DemoBanner` necesite `sticky`), se pasa por `className`; si no alcanza, `BLOQUEADO` y se pide el cambio en `shared/ui/brand` (dueño: F1-2). Móvil primero: contenedor `mx-auto max-w-7xl px-5 md:px-10`, mucho aire (`py-16 md:py-24` en `main`) y Latón solo en las líneas divisorias (README regla 3). Admin: aside `w-64` en `lg`, con fondo `bg-card` y borde `border-laton/40`. README: tabla por componente, igual que las de brand (archivo, cuándo usarlo, props clave, "no usar para"), más la regla "la navegación sale de `route-map.ts`; no se escriben enlaces de menú a mano".

**P3 · Rutas.** Antes de escribir, leer `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/route-groups.md`, `layout.md` y `dynamic-routes.md` (AGENTS.md). `(publico)` e `(inversionista)` son grupos que no cuentan en la URL. `admin/` es un segmento real. Ninguna página lee `params` ni `searchParams` en F1. Se borra `src/app/page.tsx` en el mismo commit en que se crea `(publico)/page.tsx`.

**P4 · E2E.** Importa `ROUTES`, `ROUTE_IDS` y `routeHref` de `../../src/shared/ui/app-shell/route-map` (ruta relativa, como hace `sistema.spec.ts` con `legal-copy`), y `LEGAL_COPY` de `../../src/shared/ui/brand/legal-copy`. Las pruebas se generan por id con `for (const id of ROUTE_IDS) test(...)`: un fallo dice qué pantalla se rompió.

## 5. Pruebas

### 5.1 Unitarias (Vitest, entorno `node`)
- `route-map.test.ts`:
  - `ROUTE_IDS` tiene exactamente las 14 ids, `p1…p8` y `b1…b6`, y coincide con las claves de `ROUTES`.
  - Los `href` son únicos y empiezan por `/`. Zona admin ⇔ `href` empieza por `/admin`. P1 es `/` y B1 es `/admin`.
  - `pattern` y `href` son coherentes: si quitas los grupos `(…)` del `pattern` y reemplazas `[slug]`/`[id]` por `EXAMPLE_PROJECT_SLUG`, obtienes el `href`.
  - Cada `next` existe y ninguna ruta apunta a sí misma.
  - "Flujo del inversionista": de p1, siguiendo `next`, se obtiene `p1,p2,p3,p4,p5,p6`. "Flujo operativo": de b1 se obtiene `b1,b2,b3,b4,b5,p6`.
  - `NAV_ITEMS[zone]` solo contiene ids de esa zona, salvo la pública, que enlaza p3 y p7 de la zona investor ([SUPUESTO] S1). `ROLE_HOME` apunta a hrefs existentes.
  - `activeRouteId`: `"/proyectos/m2-001/participar"` con investor da p3 · `"/admin/crm"` con admin da b6 · `"/admin"` da b1 · `"/"` con public da p1 · `"/registro"` con public da p2 · `"/nada"` da null.
- `route-copy.test.ts`: las 14 ids tienen `RouteCopy` con todos los campos no vacíos. Ningún texto coincide con `/rueda/i`, `/Club M/` ni `/\b[PB][1-8]\b/` (no hay códigos internos visibles). `phrase` empieza por "Aquí".
- `demo-role.test.ts`: `isDemoRole` acepta los 3 roles y rechaza `"Admin"`, `""` y `null`. `ZONE_DEFAULT_ROLE` y `ROLE_HOME` cubren todas las claves.
- `role-store.test.ts`: `setRole("admin")` cambia `getState().role`. `ROLE_STORAGE_KEY === "club-ui:v1"`. Un valor persistido inválido (`{ role: "dueño" }`) se descarta y queda `null` (con un `storage` en memoria inyectado en el test).

### 5.2 `data-testid` necesarios
`zona-public` · `zona-investor` · `zona-admin` · `demo-banner` (ya existe) · `selector-rol` · `selector-rol-visitor` · `selector-rol-investor` · `selector-rol-admin` · `nav-principal` · `nav-link-<id>` (p. ej. `nav-link-p6`) · `nav-movil-abrir` · `nav-movil` · `inicio-zona` · `pagina-<id>` (p. ej. `pagina-b3`) · `siguiente-paso` · `empty-state` (ya existe) · `pie-zona`.
Ojo: en el DOM, `nav-link-<id>` puede estar a la vez en `nav-principal` (oculto en móvil) y en `nav-movil`. El E2E siempre los busca dentro de su contenedor.

### 5.3 E2E (proyectos `movil-390` y `desktop-1440`)
`tests/e2e/rutas.spec.ts`, una prueba por cada id de `ROUTE_IDS`:
1. `goto(routeHref(id))` responde 200. Se ven `zona-<ROUTES[id].zone>` y `pagina-<id>`.
2. Hay un solo `h1` y es visible. `demo-banner` es visible y tiene exactamente `LEGAL_COPY.demoBanner`.
3. Dentro de `pagina-<id>` se ve `empty-state`. `siguiente-paso` es visible y su `href` es `routeHref(ROUTES[id].next)`.
4. `selector-rol` es visible.
5. El texto de `body` no coincide con `/rueda/i`.
6. Solo en `movil-390`: `document.documentElement.scrollWidth <= 390`.

`rutas.spec.ts`, recorridos por clic:
7. "Recorrido del inversionista": desde `/`, hacer 5 clics en `siguiente-paso` lleva por `/registro`, `/proyectos`, `/proyectos/m2-001`, `/proyectos/m2-001/participar` y `/portafolio` (`toHaveURL` en cada paso).
8. "Recorrido operativo": desde `/admin`, 5 clics llevan por `/admin/adquisiciones`, `/admin/proyectos/m2-001`, `/admin/comercializacion`, `/admin/finanzas` y `/portafolio`.

`tests/e2e/navegacion.spec.ts`:
9. Desktop: en `/proyectos`, `nav-principal` es visible, `nav-link-p6` lleva a `/portafolio` y allí tiene `aria-current="page"`. En `/admin/crm`, el `nav-principal` lateral es visible y `nav-link-b6` tiene `aria-current="page"`.
10. Móvil: en `/proyectos`, `nav-principal` no es visible y `nav-movil-abrir` sí. Clic en `nav-movil-abrir`, luego en `nav-movil` → `nav-link-p6`: queda en `/portafolio` y `nav-movil` se cierra. Lo mismo en `/admin` con `nav-link-b4`.
11. Selector de rol (los dos tamaños): en `/`, `selector-rol` muestra "Visitante". Al elegir `selector-rol-admin`, la URL pasa a `/admin`. Tras `page.reload()`, sigue mostrando "Admin". Al elegir `selector-rol-investor`, va a `/proyectos`. Sin errores en la consola (`page.on("console")` filtrando `type() === "error"`, incluidos los de hidratación).
12. Accesibilidad básica: el primer `Tab` en `/` enfoca "Saltar al contenido" y, al pulsar Enter, el foco pasa a `#contenido`.

`andamiaje.spec.ts`: `/` muestra `pagina-p1` (antes buscaba `home`).

Dominio financiero: no aplica (F1-5 no mueve dinero ni calcula cifras).

## 6. Riesgos, supuestos y preguntas

- **R1 · `cacheComponents: true` + rutas dinámicas.** `next.config.ts` tiene `cacheComponents` activo. Según `use-pathname.md` §Cache Components, `usePathname` se suspende en `/proyectos/[slug]`, `/proyectos/[slug]/participar` y `/admin/proyectos/[id]` (sus params no están en `generateStaticParams`). Sin `Suspense`, **falla el build**, y eso afecta a toda la navegación de los layouts. Mitigación del contrato: `ActiveNavLinks` siempre va en `<Suspense fallback={<NavLinks activeId={null}/>}>`, y las páginas no leen `params`. `RoleSwitcher` usa `useRouter`, no `usePathname`. `pnpm build` es criterio (CA11) porque `verify` usa `next dev` y no detecta este error. Alternativa descartada: `generateStaticParams` con el slug de ejemplo, que acopla F1-5 a las semillas de F1-4.
- **R2 · Hidratación del rol.** Un `persist` que rehidrata solo al cargar daría un render del cliente distinto al del servidor. Con `skipHydration` y `rehydrate()` en `useEffect`, el primer render siempre es el rol por defecto de la zona. Durante un instante se ve ese rol y luego el guardado. Es aceptable en F1 y lo cubre el E2E 11 (sin errores en consola).
- **R3 · `src/app/page.tsx` choca con `(publico)/page.tsx`.** Hay que borrarlo en el mismo commit; si no, Next da error de rutas duplicadas. `andamiaje.spec.ts` se adapta en P4.
- **R4 · Copy en `shared/ui` (D2).** Es transitorio. En F2/F3, la fila que construya cada pantalla mueve su `title`, `phrase` y textos vacíos a `modules/<m>/ui/copy.ts` y deja en `app-shell` solo `navLabel`. Va a `docs/mejoras.md`.
- **R5 · Árbol de `docs/01 §3`.** No figuran `shared/ui/app-shell/` ni el estado de rol en shared/ui. Tampoco se crea `(publico)/como-funciona/`: no es una de las 14 pantallas y P1 cubre "cómo funciona". El orquestador añade al árbol una línea (`app-shell/  # zonas, navegación, selector de rol (Zustand), mapa de rutas`) y una nota en `como-funciona/` ("sección de P1; ruta propia por decidir") en el mismo commit. No hace falta ADR: no cambia ninguna regla de §4, solo concreta §1 ("Zustand: solo rol activo").
- **R6 · Paralelo con F1-4.** F1-4 toca `src/app/layout.tsx` (providers), `src/composition/**`, `src/shared/infrastructure/**` y `src/modules/*/infrastructure/**`. F1-5 no toca ninguno. Punto de unión: el botón "Reiniciar datos simulados" de F1-4 se conecta en el hueco `demoTools` de `ZoneShell`. Lo hace el orquestador al integrar la segunda de las dos ramas, en una línea por cada uno de los 3 layouts de zona, sin que F1-5 dependa de F1-4. Si F1-4 pone su botón dentro de `shared/ui`, no debe importar `@/composition` (está prohibido: `shared-ui → composition`). Lo correcto es que el botón viva en `composition/` o en un `ui` de módulo y lo pase el layout de `app/`, que sí puede importar `composition`.
- **R7 · Slug de ejemplo.** `EXAMPLE_PROJECT_SLUG = "m2-001"` también se usa como `[id]` de B3. Si F1-4 elige otros identificadores (p. ej. `prj_chacao_01` para el id interno), solo cambia `route-map.ts`, y el E2E se adapta solo porque usa `routeHref`.
- **S1 [SUPUESTO] · El visitante puede ver el marketplace (P3) y el club (P7)** desde la navegación pública sin registrarse. En F1 no hay protección de rutas, y lo que exige registro para participar se decide en F2 (P2/P5). Pregunta 🟠 M1 para `docs/08` (ver abajo).
- **S2 [SUPUESTO] · El rol persiste en `localStorage` (`club-ui:v1`) y "Reiniciar datos simulados" no lo cambia.** Pregunta 🟢 M2.
- **S3 [SUPUESTO] · Slug `m2-001`** (en minúsculas, a partir del código del sello). Lo confirma F1-4.
- **S4 [SUPUESTO] · Al elegir un rol se navega al inicio de ese rol.** La alternativa (quedarse en la misma URL) deja al admin en una pantalla pública sin contexto.
- **S5 [SUPUESTO] · Admin con `noindex`.** No es regla de negocio; es higiene.
- **Reglas de negocio nuevas:** ninguna. No se calcula, no se muestra ni se decide ninguna cifra. No se toca `backoffice.ts`.
- **Preguntas para `docs/08`** (el arquitecto no puede editarlo sin reescribirlo entero; las añade el orquestador como "Bloque M · App navegable (F1-5) 🟠"):
  - M1: ¿El visitante sin registro puede ver el marketplace y las fichas, o solo la landing y el club? Propuesta por defecto: puede verlos; participar exige registro (F2).
  - M2: ¿El rol elegido se recuerda al recargar y sobrevive a "Reiniciar datos simulados"? Propuesta por defecto: sí y sí.
  - M3: ¿"Cómo funciona" es una ruta propia (`/como-funciona`) o una sección de la landing? Propuesta por defecto: sección de P1 en F2; ruta propia solo si P1 crece demasiado.
- **Para `docs/mejoras.md`:** lista `/admin/proyectos` (B3 sin índice: hoy se entra con el proyecto de ejemplo) · migración del copy de pantallas a módulos (R4) · estado activo de la navegación sin el destello de Suspense, cuando haya `generateStaticParams` con semillas.

## 7. ADR requerido
No. D1 concreta `docs/01 §1` (Zustand solo para el rol activo) dentro de `shared-ui` sin cambiar ninguna regla de capas, y el lint lo permite tal como está. Solo se actualizan dos líneas del árbol de `docs/01 §3` (R5) en el mismo commit.
