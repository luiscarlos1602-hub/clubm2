# Plan 005 · P3 · Marketplace de proyectos

Estado: borrador · Fecha: 2026-11-22 · Autor: arquitecto
Fuentes: `docs/planes/brief-P3.md` · `docs/00 §3` (P3) · `docs/01 §3, §4, §8` · `docs/02 §1–§2` · `docs/06` · `docs/08` (D2, D4, D6, L5, M1, N6, N7) · ADR-004, ADR-010, ADR-011 · `src/shared/ui/README.md` · `src/modules/{projects,participations,finance,club}/CLAUDE.md` · `src/composition/{container,demo-snapshot,providers}.ts(x)` · `eslint.config.mjs` · `architecture.modules.mjs` · docs de Next 16 en `node_modules/next/dist/docs/01-app/` (`01-getting-started/05-server-and-client-components.md`, `02-guides/preserving-ui-state.md`, `03-api-reference/04-functions/use-search-params.md`).
Rama: `feat/projects-marketplace` (la actual).

## 1. Historia y criterios

**Historia** (del brief). Como visitante o inversionista quiero ver la lista de proyectos del club, con su etapa, las participaciones disponibles y el plazo objetivo como proyección, y filtrarla, para elegir cuál abrir.

**Criterios** (del brief; lo marcado [PROPUESTO] los vuelve verificables):

- **CA1** · `/proyectos` (zona inversionista, accesible para visitante, M1) lista los proyectos **publicables** leídos del container (repos mock, semillas M2-001…006). M2-007 (due diligence) **no** aparece (N7). [PROPUESTO] Con las semillas se ven exactamente 6 tarjetas, en este orden (P3-2): `M2-006, M2-005, M2-004, M2-002, M2-003, M2-001`.
- **CA2** · Cada tarjeta muestra sello `M2-00X` (`ProjectSeal`), nombre, ubicación "Ciudad · Zona", etapa pública (`StatusBadge`), "Participaciones disponibles: N de 100", precio por participación ("Desde USD 100 por participación" si está abierta), plazo objetivo con `ProjectionLabel` (si no es histórico) y el aviso de riesgo `LEGAL_COPY.riskNotice` **dentro** de la tarjeta. [PROPUESTO] M2-006 muestra "37 de 100"; el resto, "0 de 100 · colocación cerrada" (supuesto P3-3).
- **CA3** · Ninguna rueda ni "estancado" en la UI. La etapa pública sale de `toPublicStage` (exportado por `modules/projects/index.ts`, con test exhaustivo sobre `PROJECT_STATUSES`; `stalled → on_sale`, L5). M2-002 no muestra días sin vender y su `StatusBadge` no usa el tono `attention`. [PROPUESTO] Ningún tono de etapa es `attention`, y lo comprueba un test.
- **CA4** · Los liquidados se muestran como "Finalizado", con rótulo de histórico y fecha de liquidación. No muestran plazo objetivo ni `ProjectionLabel`, ni cifras de ganancia. La única cifra de dinero de la tarjeta es el precio por participación (`MoneyDisplay kind="amount"`), así que nunca hay una proyección mayor que el capital.
- **CA5** · Filtro por etapa (Todas · Abiertos a participar · En obra · En venta · Finalizados) y por ubicación (todas · ciudad · ciudad y zona). Hay estado vacío de marca con acción "Ver todos los proyectos", skeleton de carga y `ErrorState` con "Reintentar".
- **CA6** · Cada tarjeta enlaza a `/proyectos/<slug>` con el slug de los datos (`m2-006-chacao`). El `siguiente-paso` de la pantalla sigue apuntando a `routeHref("p4")`, así que `rutas.spec.ts` y el recorrido por clic siguen en verde.
- **CA7** · Ninguna pantalla calcula dinero: el precio viene de la clase y solo se formatea. No se muestra la dirección exacta (D6: `Property` no la tiene).
- **CA8** · `PageHeader` + `Section`s (ADR-010), responsive 390/1440, sin colores de marca a mano, copy en `modules/participations/ui/copy.ts`, `node scripts/check-copy.mjs src/modules/participations src/modules/projects` en verde y sin cintillo (ADR-011).
- **CA9** · Los `data-testid` de §5.3. E2E en 390 y 1440 (§5.2). `pnpm verify`, `pnpm build` y `src/architecture-rules.test.ts` en verde.

## 2. Módulos afectados y decisión de capas

| Módulo / carpeta | Por qué | Nuevo |
|---|---|---|
| `modules/projects` (domain + `index.ts`) | Mapeo estado → etapa pública (`toPublicStage`) y plazo objetivo (`TARGET_TERM_MONTHS`). Exporta también los **tipos** de sus puertos | se amplía |
| `modules/participations` (domain, application, ui) | Vista de marketplace: tarjeta = proyecto + inmueble + clase de participación. Primera `ui/` del módulo | se amplía (crea `ui/`) |
| `composition/` | Conecta `listMarketplace` con los repos de projects y participations | se amplía |
| `shared/ui/brand/ProjectSeal.tsx` | `code` pasa de `` `M2-${string}` `` a `string` (ver R3) | cambio de 1 tipo |
| `shared/ui/app-shell/route-map.ts` | `projectHref(slug)`: URL de la ficha en un solo lugar | se amplía |
| `app/(inversionista)/proyectos/page.tsx` | Sustituye `RoutePlaceholder` | se cambia |
| `tests/e2e/` | `marketplace.spec.ts` nuevo; `rutas.spec.ts` añade `p3` a `BUILT` | sí / se cambia |

No se toca: `eslint.config.mjs`, `architecture.modules.mjs`, `docs/referencia/**`, semillas (`*/infrastructure/seed.ts`), `demo-snapshot.ts`, `finance/**` ni ningún `backoffice.ts`.

**D1 · La vista del marketplace vive en `participations` (domain + application + ui). No hace falta módulo nuevo ni ADR.**
- La tarjeta combina `projects` (proyecto, inmueble, etapa) y `participations` (clase: total, colocadas, precio). Según el orden de §4 regla 3, `participations` puede importar `@/modules/projects`, pero no al revés. Por eso la composición va en el módulo **más a la izquierda que ya ve todos los datos que necesita**, que es `participations`. El dato que distingue a la tarjeta, "N de 100 disponibles", además pertenece a `participations` (colocación).
- Capas que se usan, todas permitidas por `eslint.config.mjs` tal como está: `participations/domain → module-api(projects)` (solo tipos y funciones de domain), `participations/application → module-api(projects)` (tipos de puertos), `participations/ui → composition` (`useContainer`), `shared-ui`, `module-api`. `composition → application` de participations. `app → module-api` (`@/modules/participations`).
- **Alternativas descartadas.**
  - (a) `projects/ui`: no puede importar `participations` (sería un ciclo, regla 3).
  - (b) Módulo nuevo `marketplace` o `catalog` a la derecha de `participations`: exige una línea en `architecture.modules.mjs`, cambiar el orden de `docs/01 §4` y un ADR, sin ninguna regla de negocio propia que lo justifique.
  - (c) Hacer la unión en `composition/` o en un hook que lea tres repos: la regla de negocio (qué es publicable, qué está disponible, cómo se ordena) acabaría fuera de un `domain` testeable.
  - (d) `club`: es la vitrina de eventos y la academia, no de proyectos.
- **Regla que se deja escrita** (sin cambiar §4; el orquestador la añade como nota en `docs/01 §4`): *"Una vista que combina datos de varios módulos vive en el módulo más a la izquierda que ya puede importar a todos los demás."* Así, P4 (ficha + simulador, necesita finance) irá en `finance/ui`, y P6 (portafolio) en `investors`, como dice `docs/02 §3` ("Portfolio, vista derivada").
- **Trampa de ciclo** (R4): `participations/index.ts` exporta un componente que importa `@/composition/providers` → `container` → `composition/modules/participations.ts`. Por eso **`composition/**` y cualquier `infrastructure/` importan de participations solo por ruta interna o con `import type`**, nunca valores en tiempo de ejecución desde `@/modules/participations`. Hoy ya es así (`container.ts` solo usa `import type { HolderId }`).

**D2 · Lectura en el cliente con TanStack Query, sin `searchParams`.** El container lee `localStorage` (demo-store). Con `cacheComponents: true`, la página es un shell estático: `page.tsx` (Server Component) monta `ProjectMarketplace`, que es de servidor, y este monta `MarketplaceBrowser` (`"use client"`), donde `useQuery` corre solo en el cliente. En SSR se pinta el skeleton y el primer render del cliente también (estado `pending`), así que no hay desajuste de hidratación. Los filtros van en `useState` y **no** en la URL. Con `useSearchParams` habría que envolver en `Suspense` por `cacheComponents`; queda como mejora (R6).

**D3 · El plazo objetivo es una constante pública de `projects`, no un campo de las semillas.** El maestro solo define el objetivo de velocidad ("compra, reforma y venta en hasta tres meses", §4) y pide que la ficha muestre el "plazo objetivo" (§Ficha). No hay plazos por proyecto. `TARGET_TERM_MONTHS = 3` evita cambiar `Project`, su esquema zod y el snapshot de `localStorage`. Un test garantiza que coincide con el umbral interno de `classify-wheel`, sin exponerlo. Si el usuario decide que es por proyecto (pregunta P3-Q4), se convierte en campo en B2/B3. [SUPUESTO P3-6]

## 3. Contratos (TypeScript)

Es el acuerdo entre los paquetes D, DATA, UI y E2E. Si cambia, se avisa al orquestador.

### 3.1 `projects` (paquete D)

```ts
// src/modules/projects/domain/public-stage.ts
import type { ProjectStatus } from "./project-status";

/** Etapas que ve el público y el inversionista. Nunca incluye "stalled" ni estados previos a la colocación. */
export const PUBLIC_STAGES = ["funding", "renovation", "on_sale", "sold", "settled"] as const;
export type PublicStage = (typeof PUBLIC_STAGES)[number];

/**
 * Mapeo único estado → etapa pública (L5, N7, ADR-004). Tabla Record<ProjectStatus, PublicStage | null>:
 *   opportunity, due_diligence, discarded, acquired → null   (no se publican; acquired: [SUPUESTO P3-4])
 *   funding → "funding" · renovation → "renovation"
 *   on_sale → "on_sale" · stalled → "on_sale"                 (L5)
 *   sold → "sold" · settled → "settled"
 */
export function toPublicStage(status: ProjectStatus): PublicStage | null;
/** toPublicStage(status) !== null */
export function isPublishedStatus(status: ProjectStatus): boolean;

// src/modules/projects/domain/target-term.ts
/** Plazo objetivo (proyección, nunca promesa): de la compra a la firma de venta. Maestro §4. [SUPUESTO P3-6] */
export const TARGET_TERM_MONTHS: 3 = 3;

// src/modules/projects/index.ts: se AÑADE (sin quitar nada)
export type { PublicStage } from "./domain/public-stage";
export { PUBLIC_STAGES, toPublicStage, isPublishedStatus } from "./domain/public-stage";
export { TARGET_TERM_MONTHS } from "./domain/target-term";
export type { ProjectRepository, PropertyRepository } from "./application/ports";
```

`public-api.test.ts` amplía la lista exacta con `PUBLIC_STAGES`, `TARGET_TERM_MONTHS`, `isPublishedStatus` y `toPublicStage`. Se mantiene la aserción "ninguna clave /wheel/i".

### 3.2 `participations/domain` (paquete D)

```ts
// src/modules/participations/domain/marketplace-listing.ts
import type { Project, ProjectCode, ProjectId, Property, PublicStage } from "@/modules/projects";
import type { IsoDate } from "@/shared/domain/calendar-date";
import type { Money } from "@/shared/domain/money";
import type { ParticipationClass } from "./participation";

/**
 * Fase de la tarjeta: etapa pública + estado de la colocación.
 * funding se divide en open (quedan disponibles) y placement_complete (P3-1). settled → finished.
 */
export const LISTING_PHASES = ["open", "placement_complete", "renovation", "on_sale", "sold", "finished"] as const;
export type ListingPhase = (typeof LISTING_PHASES)[number];

export type ProjectListing = {
  readonly projectId: ProjectId;
  readonly code: ProjectCode;
  readonly slug: string;
  readonly name: string;
  readonly city: string;
  readonly zone: string;              // sin dirección exacta (D6)
  readonly acquiredOn: IsoDate;       // fecha del sello
  readonly stage: PublicStage;
  readonly phase: ListingPhase;
  readonly participations: {
    readonly total: number;
    /** phase === "open" ? total − placed : 0  [SUPUESTO P3-3] */
    readonly available: number;
  };
  readonly unitPrice: Money;          // de la clase; la UI solo lo formatea
  /** TARGET_TERM_MONTHS si phase ∉ {sold, finished}; null en histórico (CA4). */
  readonly targetTermMonths: number | null;
  /** Solo en finished. */
  readonly settledOn: IsoDate | null;
};

export type MarketplaceSource = {
  readonly projects: readonly Project[];
  readonly properties: readonly Property[];
  readonly classes: readonly ParticipationClass[];
};

/**
 * Pura, nunca lanza. Omite (sin error) un proyecto si: toPublicStage(status) === null, le falta el inmueble,
 * le falta la clase o acquiredOn === null. Si hay dos clases del mismo proyecto, usa la primera.
 * Orden (P3-2): rango de fase open 0 · placement_complete 1 · renovation 2 · on_sale 3 · sold 4 · finished 5;
 * dentro del rango, acquiredOn descendente; empate → code ascendente.
 */
export function buildMarketplaceListing(source: MarketplaceSource): readonly ProjectListing[];

// src/modules/participations/domain/marketplace-filters.ts
import type { ProjectListing } from "./marketplace-listing";

export const MARKETPLACE_FILTERS = ["all", "open", "renovation", "on_sale", "finished"] as const;
export type MarketplaceFilter = (typeof MARKETPLACE_FILTERS)[number];
/** all → todas · open → [open] · renovation → [renovation] · on_sale → [on_sale] · finished → [sold, finished].
 *  placement_complete solo aparece con "all" (P3-Q5). */
export function matchesStageFilter(listing: ProjectListing, filter: MarketplaceFilter): boolean;

export type LocationFilter =
  | { readonly kind: "all" }
  | { readonly kind: "city"; readonly city: string }
  | { readonly kind: "zone"; readonly city: string; readonly zone: string };
export type LocationOption = { readonly key: string; readonly filter: LocationFilter };

/** "todas" | kebab(city) | `${kebab(city)}-${kebab(zone)}`. kebab = NFD sin diacríticos, minúsculas, [^a-z0-9]+ → "-".
 *  Ej.: "caracas", "caracas-chacao", "valencia-el-vinedo". */
export function locationKey(filter: LocationFilter): string;
/** [todas, ciudad A, zonas de A…, ciudad B, zonas de B…]. Ciudades y zonas con localeCompare("es"), sin duplicados.
 *  Solo salen de las tarjetas publicadas (M2-007 no aporta opciones). */
export function listLocationOptions(listings: readonly ProjectListing[]): readonly LocationOption[];
/** Clave desconocida → { kind: "all" }. */
export function resolveLocation(options: readonly LocationOption[], key: string): LocationFilter;

export type MarketplaceCriteria = { readonly stage: MarketplaceFilter; readonly location: LocationFilter };
export const DEFAULT_CRITERIA: MarketplaceCriteria; // { stage: "all", location: { kind: "all" } }
/** Conserva el orden de entrada. */
export function filterListings(listings: readonly ProjectListing[], criteria: MarketplaceCriteria): readonly ProjectListing[];
```

### 3.3 `participations/application` (paquete D)

```ts
// src/modules/participations/application/list-marketplace.ts
import type { ProjectRepository, PropertyRepository } from "@/modules/projects";
import type { ProjectListing } from "../domain/marketplace-listing";
import type { ParticipationClassRepository } from "./ports";

export type ListMarketplaceDeps = {
  readonly projects: Pick<ProjectRepository, "list">;
  readonly properties: Pick<PropertyRepository, "list">;
  readonly classes: Pick<ParticipationClassRepository, "list">;
};
export type ListMarketplace = () => Promise<readonly ProjectListing[]>;

/** `async`: un throw síncrono de un repo (p. ej. demo-store) se convierte en rechazo (lo muestra ErrorState).
 *  Lee los tres repos con Promise.all y delega en buildMarketplaceListing. */
export function createListMarketplace(deps: ListMarketplaceDeps): ListMarketplace;
```

### 3.4 `composition` (paquete DATA)

```ts
// src/composition/modules/participations.ts
import type { ListMarketplace } from "@/modules/participations/application/list-marketplace";
import type { ProjectsModule } from "./projects";
export type ParticipationsModule = {
  readonly classRepository: ParticipationClassRepository;
  readonly participationRepository: ParticipationRepository;
  readonly listMarketplace: ListMarketplace;          // NUEVO
};
export function registerParticipations(
  store: DemoStore<DemoSnapshot>,
  projects: Pick<ProjectsModule, "projectRepository" | "propertyRepository">,   // NUEVO
): ParticipationsModule;

// src/composition/container.ts: solo cambia el cableado
const projects = registerProjects(store);
// … projects, participations: registerParticipations(store, projects), …
```
El tipo `Container` no cambia de forma; solo crece `ParticipationsModule`. Prohibido importar valores desde `@/modules/participations` (index) en `composition/**` (D1, trampa de ciclo).

### 3.5 `participations/ui` (paquete UI)

```ts
// src/modules/participations/ui/hooks/use-marketplace.ts · "use client"
import type { UseQueryResult } from "@tanstack/react-query";
export const MARKETPLACE_QUERY_KEY = ["participations", "marketplace"] as const;
/** useQuery({ queryKey: MARKETPLACE_QUERY_KEY, queryFn: () => useContainer().participations.listMarketplace(), retry: false }).
 *  retry:false porque la lectura es local y determinista; el usuario tiene "Reintentar". Reiniciar datos ya invalida todas las consultas. */
export function useMarketplace(): UseQueryResult<readonly ProjectListing[], Error>;

// src/modules/participations/ui/components/investor/phase-presentation.ts
import type { StatusTone } from "@/shared/ui/brand";
/** Tabla fase → { label (de copy.ts), tone }. Tonos: open "positive" · placement_complete "neutral" · renovation "in-progress"
 *  · on_sale "in-progress" · sold "neutral" · finished "neutral". Ninguno "attention" (CA3, test). */
export const PHASE_PRESENTATION: Readonly<Record<ListingPhase, { readonly label: string; readonly tone: StatusTone }>>;

// Componentes (todos aceptan TestIdProp de "@/shared/ui/brand/types")
// ProjectMarketplace.tsx · Server Component · testid por defecto "pagina-p3", data-route-id="p3"
export type ProjectMarketplaceProps = TestIdProp;
//   <PageHeader id="titulo-p3" eyebrow title description />                       (único h1)
//   <Section tone="light" spacing="md" labelledBy="titulo-lista-proyectos"> h2 sr-only + <MarketplaceBrowser/> </Section>
//   <Section tone="sand" spacing="md" ruled labelledBy="titulo-siguiente-paso"> h2 + texto +
//      <Button asChild variant="outline"><Link href={routeHref("p4")} data-testid="siguiente-paso">…</Link></Button> </Section>
//   siguiente-paso se pinta SIEMPRE, sin depender de la carga (rutas.spec.ts lo busca al entrar).

// MarketplaceBrowser.tsx · "use client" · testid "marketplace"
export type MarketplaceBrowserProps = TestIdProp;
//   const q = useMarketplace(); const [stage, setStage] = useState<MarketplaceFilter>("all"); const [locationKey, setLocationKey] = useState("todas");
//   options = useMemo(listLocationOptions(q.data ?? [])); visible = filterListings(data, { stage, location: resolveLocation(options, locationKey) })
//   pending → <MarketplaceFilters disabled/> + grid de 3 <CardSkeleton/> dentro de data-testid="marketplace-cargando"
//   error   → <ErrorState data-testid="marketplace-error" title description action=<Button data-testid="marketplace-reintentar" onClick={() => q.refetch()}>/>
//   data=[] → <EmptyState data-testid="marketplace-vacio" title=emptyAll.title description=emptyAll.description icon={LayoutGrid}/>   (sin filtros)
//   visible=[] con datos → <EmptyState data-testid="marketplace-vacio" … action=<Button data-testid="marketplace-limpiar-filtros" onClick=reset>/>
//   si no → <p role="status" aria-live="polite" data-testid="marketplace-resultados">{copy.results(n)}</p>
//           <ul data-testid="marketplace-lista" className="grid gap-6 md:grid-cols-2 xl:grid-cols-3"> <li><ProjectCard/></li>… </ul>

// MarketplaceFilters.tsx · "use client" · presentacional controlado · testid "marketplace-filtros"
export type MarketplaceFiltersProps = TestIdProp & {
  stage: MarketplaceFilter;
  onStageChange(next: MarketplaceFilter): void;
  locationKey: string;
  locationOptions: readonly LocationOption[];
  onLocationChange(nextKey: string): void;
  disabled?: boolean;
};
//   Etapa: <div role="group" aria-labelledby> con un <Button size="sm" variant={activo ? "default" : "outline"} aria-pressed> por filtro.
//     testid: FILTER_TEST_ID = { all: "filtro-etapa-todas", open: "filtro-etapa-abiertos", renovation: "filtro-etapa-en-obra",
//                                on_sale: "filtro-etapa-en-venta", finished: "filtro-etapa-finalizados" }. En 390 hace wrap (flex-wrap), sin scroll horizontal.
//   Ubicación: Select de @/shared/ui/primitives/select con <Label> visible; SelectTrigger testid "filtro-ubicacion";
//     SelectItem testid `filtro-ubicacion-${option.key}`; label por kind (copy.location.*).

// ProjectCard.tsx · presentacional (sin hooks) · <article> testid "tarjeta-proyecto" data-project-code={code} data-phase={phase}
export type ProjectCardProps = TestIdProp & { listing: ProjectListing };
//   Surface variant="card" (no colores a mano). Cabecera: <ProjectSeal code={code} date={acquiredOn} data-testid="tarjeta-sello"/> + <BrandSymbol/> decorativo (imagen, F4-2).
//   <StatusBadge data-testid="tarjeta-etapa" {...PHASE_PRESENTATION[phase]}/>
//   <h3 data-testid="tarjeta-nombre"><Link href={projectHref(slug)} data-testid="tarjeta-enlace">{name}</Link></h3> (el enlace cubre la tarjeta con un ::after; un solo destino por tarjeta)
//   <p data-testid="tarjeta-ubicacion">{copy.card.location(city, zone)}</p>
//   <p data-testid="tarjeta-disponibles">{copy.card.availability(available, total)}{phase !== "open" ? ` · ${copy.card.closedNote}` : ""}</p>
//   precio (data-testid="tarjeta-precio"): open → "Desde" + <MoneyDisplay kind="amount" value={unitPrice}/> + "por participación"; resto → "Precio por participación:" + MoneyDisplay
//   targetTermMonths !== null → <ProjectionLabel data-testid="tarjeta-plazo-proyeccion"><span data-testid="tarjeta-plazo">{copy.card.targetTerm(m)}</span></ProjectionLabel>
//   phase sold|finished → <p data-testid="tarjeta-historico">{copy.card.historic[phase]}{settledOn ? ` · ${copy.card.settledOn} ${formatIsoDate(settledOn,"numeric")}` : ""}</p>
//   <LegalNotice notice="riskNotice" variant="inline" data-testid="tarjeta-aviso-riesgo"/>   (siempre)
```

```ts
// src/modules/participations/index.ts (paquete UI; contenido completo)
export type { HolderId, ParticipationClassId, ParticipationId, ParticipationClass, ParticipationStatus, Participation } from "./domain/participation";
export { PARTICIPATION_STATUSES, HOLDING_LIMITS } from "./domain/participation";
export { checkParticipationClass, checkHoldings } from "./domain/participation-consistency";
export type { ListingPhase, ProjectListing, MarketplaceSource } from "./domain/marketplace-listing";
export { LISTING_PHASES, buildMarketplaceListing } from "./domain/marketplace-listing";
export type { MarketplaceFilter, LocationFilter, LocationOption, MarketplaceCriteria } from "./domain/marketplace-filters";
export { MARKETPLACE_FILTERS, DEFAULT_CRITERIA, matchesStageFilter, filterListings, listLocationOptions, locationKey, resolveLocation } from "./domain/marketplace-filters";
export type { ListMarketplace, ListMarketplaceDeps } from "./application/list-marketplace";
export { ProjectMarketplace, type ProjectMarketplaceProps } from "./ui/components/investor/ProjectMarketplace";
```

### 3.6 `shared/ui` (paquete UI)

```ts
// src/shared/ui/brand/ProjectSeal.tsx: solo el tipo
/** Código público ya validado por parseProjectCode (modules/projects). El prefijo sale de brand.shortName. */
export type ProjectCode = string;      // antes `M2-${string}` (no aceptaba el ProjectCode con marca de projects, R3)

// src/shared/ui/app-shell/route-map.ts: se AÑADE (sin @/ imports, como el resto del archivo)
/** URL de la ficha P4 de un proyecto: `/proyectos/${slug}`. Debe coincidir con ROUTES.p4.pattern. */
export function projectHref(slug: string): AppPath;
// src/shared/ui/app-shell/index.ts: añadir projectHref al export de route-map.
```

### 3.7 `app/` (paquete UI)

```tsx
// src/app/(inversionista)/proyectos/page.tsx
import { ProjectMarketplace } from "@/modules/participations";
import { routeMetadata } from "@/shared/ui/app-shell";
export const metadata = routeMetadata("p3");
export default function ProjectsPage() {
  return <ProjectMarketplace />;
}
```

### 3.8 Copy (`src/modules/participations/ui/copy.ts`, paquete UI)

`MARKETPLACE_COPY` (as const; las funciones devuelven string). Sin "rueda", "estancado", "real/reales", "Club M²" ni verbos de transacción. **Tampoco en comentarios** de los archivos de `participations` (R9 lee rutas de audiencia inversionista).

| Clave | Texto |
|---|---|
| `header.eyebrow` | Proyectos |
| `header.title` | Proyectos del club |
| `header.description` | Cada proyecto con su etapa, las participaciones disponibles y el plazo objetivo como proyección. Son proyectos de ejemplo. |
| `listHeading` (h2 sr-only) | Lista de proyectos |
| `filters.stageLabel` | Etapa |
| `filters.stage.all · open · renovation · on_sale · finished` | Todas · Abiertos a participar · En obra · En venta · Finalizados |
| `filters.locationLabel` | Ubicación |
| `location.all` | Todas las ubicaciones |
| `location.city(city)` | `${city} · todas las zonas` |
| `location.zone(city, zone)` | `${city} · ${zone}` |
| `results(n)` | `1 proyecto` / `${n} proyectos` |
| `emptyAll.title · description` | Todavía no hay proyectos publicados · Los proyectos de ejemplo aparecerán aquí. |
| `emptyFiltered.title · description · action` | No hay proyectos con estos filtros · Prueba con otra etapa o ubicación. · Ver todos los proyectos |
| `error.title · description · action` | No pudimos cargar los proyectos · Inténtalo de nuevo. Si continúa, reinicia los datos simulados. · Reintentar |
| `phase.open · placement_complete · renovation · on_sale · sold · finished` | Abierto a participar · Colocación completa · En obra · En venta · Vendido · Finalizado |
| `card.location(city, zone)` | `${city} · ${zone}` (p. ej. "Caracas · El Hatillo") |
| `card.availability(a, t)` | `Participaciones disponibles: ${a} de ${t}` |
| `card.closedNote` | colocación cerrada |
| `card.priceLeadOpen · priceSuffix` | Desde · por participación |
| `card.priceLeadClosed` | Precio por participación: |
| `card.targetTerm(m)` | `Plazo objetivo: ${m} ${m === 1 ? "mes" : "meses"} desde la compra` (siempre dentro de `ProjectionLabel`, que añade "Proyección · no garantizada") |
| `card.historic.sold · finished` | Histórico · vendido, liquidación en curso · Histórico · proyecto finalizado |
| `card.settledOn` | Liquidado el |
| `card.cta(name)` (aria-label del enlace) | `Ver la ficha de ${name}` |
| `nextStep.title · description · action` | ¿Cómo será la ficha de un proyecto? · La ficha mostrará el inmueble, el presupuesto desglosado, los escenarios y el simulador del reparto. · Ver cómo será la ficha |

El aviso de riesgo y la etiqueta de proyección **no** se copian aquí: salen de `LEGAL_COPY` vía `LegalNotice` y `ProjectionLabel`.

## 4. Paquetes

| # | Agente | Archivos (exclusivos) | Depende de | Paralelo con | Criterios |
|---|---|---|---|---|---|
| D | dominio-financiero | `src/modules/projects/domain/public-stage.ts` · `public-stage.test.ts` · `target-term.ts` · `target-term.test.ts` · `src/modules/projects/index.ts` · `src/modules/projects/public-api.test.ts` · `src/modules/projects/CLAUDE.md` · `src/modules/participations/domain/marketplace-listing.ts` · `marketplace-listing.test.ts` · `marketplace-filters.ts` · `marketplace-filters.test.ts` · `src/modules/participations/application/list-marketplace.ts` · `list-marketplace.test.ts` · `src/modules/participations/CLAUDE.md` | contratos §3.1–3.3 | DATA, UI, E2E (redacción) | CA1, CA3, CA4, CA5 (lógica), CA7 |
| DATA | datos-demo | `src/composition/modules/participations.ts` · `src/composition/container.ts` · `src/composition/container.test.ts` · `src/composition/marketplace-seed.test.ts` (nuevo) | §3.3–3.4 (escribe contra la firma; verifica cuando D entregue) | D, UI | CA1, CA2 (cifras de semilla), CA3 |
| UI | constructor-ui | `src/modules/participations/ui/copy.ts` · `ui/hooks/use-marketplace.ts` · `ui/components/investor/ProjectMarketplace.tsx` · `MarketplaceBrowser.tsx` · `MarketplaceBrowser.test.tsx` · `MarketplaceFilters.tsx` · `ProjectCard.tsx` · `phase-presentation.ts` · `phase-presentation.test.ts` · `src/modules/participations/index.ts` · `src/shared/ui/brand/ProjectSeal.tsx` · `src/shared/ui/app-shell/route-map.ts` · `route-map.test.ts` · `src/shared/ui/app-shell/index.ts` · `src/shared/ui/README.md` (línea de `ProjectSeal`: "`code` es string validado por projects") · `src/app/(inversionista)/proyectos/page.tsx` | §3 completo; tipos de D (puede escribir contra las firmas) | D, DATA, E2E (redacción) | CA2, CA4, CA5, CA6, CA8 |
| E2E | qa-e2e | `tests/e2e/marketplace.spec.ts` (nuevo) · `tests/e2e/rutas.spec.ts` (solo `BUILT` += `"p3"`) | testids §5.3; se ejecuta tras D + DATA + UI | redacción con todos | CA1–CA6, CA9 |

**Orden.** D ∥ DATA ∥ UI ∥ (redacción de E2E), todos contra §3. Integración en orden D → DATA → UI → ejecución de E2E. Después, `pnpm verify` y `pnpm build` (los corre el orquestador), luego `revisor-codigo` ∥ `revisor-cumplimiento`, y por último integrar. Si D cambia una firma, avisa antes de entregar.

**Notas por paquete.**
- **D.** `toPublicStage` es una tabla `Record<ProjectStatus, PublicStage | null>` congelada (igual que `PROJECT_TRANSITIONS`): así, si mañana se añade un estado nuevo, TypeScript obliga a decidir su etapa pública. `participations/domain` solo importa de `@/modules/projects` y `@/shared/domain`; ordena con `compareIsoDate`; no usa `Date` ni hace aritmética de `.cents`. `CLAUDE.md` de participations: se borra "sin `ui/` hasta F2" y se añaden la vista de marketplace (D1), la trampa de ciclo (R4) y "disponibles = total − colocadas solo en colocación abierta (P3-3)". `CLAUDE.md` de projects: una línea sobre `toPublicStage` / `TARGET_TERM_MONTHS`.
- **DATA.** No toca semillas ni `demo-snapshot.ts`. `marketplace-seed.test.ts` usa `createContainer({ clock: fixedClock(isoDate("2026-11-22")), storage: memoryStorage() })` y valida las cifras de §5.1 contra las semillas.
- **UI.** Antes de escribir, lee `05-server-and-client-components.md` y `preserving-ui-state.md` (Activity: la página oculta conserva el estado de los filtros al volver, y es lo que queremos). Reutiliza `PageHeader`, `Section`, `Surface`, `ProjectSeal`, `StatusBadge`, `MoneyDisplay`, `ProjectionLabel`, `LegalNotice`, `EmptyState`, `ErrorState`, `CardSkeleton`, `BrandSymbol`, `Button`, `Select` y `Label`. **No** crea componentes en `shared/ui`; si falta algo, `BLOQUEADO`. Ningún archivo pasa de 200 líneas. Antes de entregar: `node scripts/check-copy.mjs src/modules/participations src/modules/projects`.
- **E2E.** Importa `LEGAL_COPY` por ruta relativa (`../../src/shared/ui/brand/legal-copy`). Normaliza NBSP (` `) antes de comparar montos. Siempre busca los testids dentro de `pagina-p3` (Activity puede dejar en el DOM páginas ocultas).

## 5. Pruebas

### 5.1 Unitarias (Vitest)
- `public-stage.test.ts` (D): tabla exhaustiva sobre `PROJECT_STATUSES` (los 10 estados con su valor esperado). `toPublicStage("stalled") === "on_sale"` (L5). `due_diligence`, `opportunity`, `discarded` y `acquired` → `null` (N7, P3-4). `PUBLIC_STAGES` no contiene `"stalled"` ni ningún valor /wheel|rueda|estanc/i. `isPublishedStatus` coincide con `toPublicStage !== null`.
- `target-term.test.ts` (D): `TARGET_TERM_MONTHS === WHEEL_THRESHOLDS_MONTHS.good` (importa `./classify-wheel` en el test, dentro del módulo). Si cambia el objetivo interno, el público lo acompaña.
- `public-api.test.ts` (D): lista exacta ampliada y ninguna clave /wheel/i.
- `marketplace-listing.test.ts` (D), con fixtures en línea:
  - Un proyecto `funding` con 63/100 da `phase "open"` y `available 37`. Con `funding` 100/100 da `placement_complete` y `available 0`.
  - `renovation`, `on_sale` y `stalled` dan `available 0`, `targetTermMonths 3`, y `stalled` da `stage "on_sale"` y `phase "on_sale"`.
  - `settled` da `phase "finished"`, `targetTermMonths null` y `settledOn` presente. `sold` da `phase "sold"`, `targetTermMonths null` y `settledOn null`.
  - Se omiten `due_diligence`, `acquired`, un proyecto sin clase, uno sin inmueble y uno con `acquiredOn null`. Ninguno lanza error.
  - Orden P3-2: rangos de fase; dentro del rango, `acquiredOn` descendente; en empate, `code` ascendente.
  - `unitPrice` es la misma referencia que la de la clase (no se recalcula). `JSON.stringify(result)` no contiene `stalled`.
- `marketplace-filters.test.ts` (D): las 5 opciones de `matchesStageFilter` (`finished` incluye `sold`; `placement_complete` solo con `all`). `listLocationOptions` sobre tarjetas de "Caracas/Chacao", "Caracas/El Hatillo" y "Valencia/El Viñedo" devuelve las claves `["todas","caracas","caracas-chacao","caracas-el-hatillo","valencia","valencia-el-vinedo"]`. `resolveLocation` con una clave desconocida devuelve `{kind:"all"}`. `filterListings` combina etapa y ubicación y conserva el orden. `DEFAULT_CRITERIA` devuelve todo.
- `list-marketplace.test.ts` (D): con repos falsos llama a cada `list()` una vez y devuelve `buildMarketplaceListing`. Si un repo **lanza en síncrono**, la promesa se rechaza (no hay excepción sin capturar).
- `container.test.ts` (DATA): `c.participations.listMarketplace` existe y devuelve 6. "no expone backoffice" sigue en verde.
- `marketplace-seed.test.ts` (DATA), con las semillas reales:
  - Los códigos, en orden, son `["M2-006","M2-005","M2-004","M2-002","M2-003","M2-001"]`. M2-007 no está.
  - M2-006: `phase "open"`, `available 37`, `total 100`, `unitPrice` = USD 100, slug `m2-006-chacao`, ciudad/zona `Caracas`/`Chacao`.
  - M2-002: `stage "on_sale"`, `phase "on_sale"`, `available 0`.
  - M2-001 y M2-003: `phase "finished"`, `targetTermMonths null`, `settledOn` no nulo.
  - Tras `c.demo.reset()` se obtiene el mismo resultado.
- `phase-presentation.test.ts` (UI): cubre las 6 fases, ningún `tone === "attention"`, y ninguna etiqueta coincide con /rueda|estanc|días/i.
- `route-map.test.ts` (UI): `projectHref("m2-006-chacao") === "/proyectos/m2-006-chacao"`. Además, si se sustituye `[slug]` en `ROUTES.p4.pattern` (sin grupos), el resultado coincide con `projectHref`.
- `MarketplaceBrowser.test.tsx` (UI, `// @vitest-environment jsdom`, `<Providers container={fake}>` como en `ResetDemoDataButton.test.tsx`):
  1. Una promesa que nunca resuelve deja visible `marketplace-cargando`.
  2. Si rechaza, aparece `marketplace-error`. Clic en `marketplace-reintentar` → `listMarketplace` se llama 2 veces.
  3. Con `[]` aparece `marketplace-vacio` sin `marketplace-limpiar-filtros`.
  4. Con 3 fixtures (open, renovation, finished) se ven 3 `tarjeta-proyecto`. Clic en `filtro-etapa-abiertos` deja 1 y `aria-pressed="true"`. Clic en `filtro-etapa-en-venta` muestra `marketplace-vacio`, y clic en `marketplace-limpiar-filtros` vuelve a 3.
  5. La tarjeta finished tiene `tarjeta-historico` y **no** tiene `projection-label`. La tarjeta open tiene `tarjeta-plazo` dentro de `ProjectionLabel` y `tarjeta-aviso-riesgo`.
  6. `container.textContent` no coincide con /rueda|estancad/i.
  El select de ubicación (Radix) no se prueba en jsdom: lo cubren las pruebas de dominio y el E2E.

### 5.2 E2E (`tests/e2e/marketplace.spec.ts`, proyectos `movil-390` y `desktop-1440`)
1. **Lista.** `goto("/proyectos")` → `pagina-p3` visible, un solo `h1`, `marketplace-lista` con 6 `tarjeta-proyecto`. Los `data-project-code` van en el orden de CA1. `marketplace-resultados` dice "6 proyectos".
2. **M2-007 ausente.** No hay `[data-project-code="M2-007"]`. El texto de `body` no contiene "M2-007" ni "Dúplex Los Palos Grandes" y no coincide con /rueda|estancad|días sin vender/i.
3. **Tarjeta abierta (M2-006).** Contiene "Apartamento El Rosal" y "Caracas · Chacao". `tarjeta-etapa` = "Abierto a participar". `tarjeta-disponibles` = "Participaciones disponibles: 37 de 100". `tarjeta-precio` contiene "Desde" y "USD 100". `tarjeta-plazo` contiene "Plazo objetivo: 3 meses" y, dentro de la tarjeta, se ven `projection-label` ("Proyección · no garantizada") y `tarjeta-aviso-riesgo` con `LEGAL_COPY.riskNotice`.
4. **M2-002.** `tarjeta-etapa` = "En venta", con `data-tone` distinto de `attention`. `tarjeta-disponibles` contiene "0 de 100 · colocación cerrada".
5. **Finalizados (M2-001, M2-003).** `tarjeta-etapa` = "Finalizado". Se ve `tarjeta-historico` (con "Liquidado el"). No hay `projection-label` dentro de la tarjeta.
6. **Filtros de etapa.** `abiertos` → 1 (M2-006) · `en-obra` → 1 (M2-005) · `en-venta` → 2 (M2-004, M2-002) · `finalizados` → 2 · `todas` → 6.
7. **Ubicación.** `filtro-ubicacion` → `filtro-ubicacion-valencia` deja 1 (M2-004). `filtro-ubicacion-caracas-chacao` deja 2 (M2-006, M2-003). Con `abiertos` + `valencia` aparece `marketplace-vacio`, y `marketplace-limpiar-filtros` vuelve a 6 con `filtro-etapa-todas` en `aria-pressed="true"`.
8. **Tarjeta → ficha.** Clic en `tarjeta-enlace` de M2-006 lleva a la URL `/proyectos/m2-006-chacao$` y se ve `pagina-p4`.
9. **Reiniciar datos.** En `/proyectos`: `demo-reset-button` → `demo-reset-confirm` → `demo-reset-done`. Siguen las 6 tarjetas en el mismo orden.
10. **Sin errores.** Ningún `console` de tipo `error` ni `pageerror` al cargar y filtrar (incluidos los de hidratación).
11. **Responsive.** En `movil-390`, `scrollWidth <= 390` (también con el `Select` abierto y cerrado). En `desktop-1440`, las 3 primeras tarjetas comparten `boundingBox().y` (3 columnas).
- `rutas.spec.ts`: `BUILT` = `["p1","p3"]`. El resto no cambia (siguiente-paso → `/proyectos/m2-001`, recorrido por clic).

### 5.3 `data-testid`
`pagina-p3` · `marketplace` · `marketplace-filtros` · `filtro-etapa-todas` · `filtro-etapa-abiertos` · `filtro-etapa-en-obra` · `filtro-etapa-en-venta` · `filtro-etapa-finalizados` · `filtro-ubicacion` · `filtro-ubicacion-<key>` (`todas`, `caracas`, `caracas-chacao`, `caracas-el-hatillo`, `caracas-el-paraiso`, `caracas-los-palos-grandes`, `valencia`, `valencia-el-vinedo`) · `marketplace-cargando` · `marketplace-error` · `marketplace-reintentar` · `marketplace-vacio` · `marketplace-limpiar-filtros` · `marketplace-resultados` · `marketplace-lista` · `tarjeta-proyecto` (+ `data-project-code`, `data-phase`) · `tarjeta-sello` · `tarjeta-etapa` · `tarjeta-nombre` · `tarjeta-enlace` · `tarjeta-ubicacion` · `tarjeta-disponibles` · `tarjeta-precio` · `tarjeta-plazo` · `tarjeta-plazo-proyeccion` · `tarjeta-historico` · `tarjeta-aviso-riesgo` · `siguiente-paso`. Ya existentes que se reutilizan: `projection-label`, `demo-reset-*`, `zona-investor`.

## 6. Riesgos, supuestos y preguntas

- **R1 · Hidratación y `cacheComponents`.** Si `MarketplaceBrowser` leyera el container durante el render (sin Query), el HTML del servidor (memoria) y el del cliente (`localStorage`) no coincidirían. La regla es que solo `useQuery` lee datos y nada del container se toca en el render. El E2E 10 detecta los errores de hidratación. `pnpm build` es criterio porque `verify` corre en `next dev`.
- **R2 · Activity (Next 16).** Al navegar a P4 y volver, la página se conserva oculta en el DOM, con sus filtros. Es el comportamiento deseado. Los E2E acotan los locators a `pagina-p3`, o usan `:visible`, para no contar tarjetas ocultas.
- **R3 · `ProjectSeal.code`.** El tipo `` `M2-${string}` `` de `shared/ui/brand` fija el prefijo a mano y no acepta el `ProjectCode` con marca de `projects`. Se amplía a `string`: es compatible hacia atrás y `/sistema` sigue igual. La validación de forma ya la hace `parseProjectCode`. La alternativa (un `as` en la tarjeta) oculta errores y se descarta.
- **R4 · Ciclo de imports** (D1). `participations/index.ts` exporta UI que llega hasta `composition`. Si un módulo a la derecha (finance, investors) importa **valores** de `@/modules/participations`, también arrastra la UI y el container. Mitigación inmediata: la regla de §3.4 y una línea en `CLAUDE.md` de participations. Para `docs/mejoras.md`: separar la entrada de UI del módulo (p. ej. `ui.ts`), con un ADR, cuando finance o investors necesiten valores de participations. Club ya sigue el mismo patrón (`index.ts` → `ClubLanding`).
- **R5 · `EXAMPLE_PROJECT_SLUG = "m2-001"` no existe en los datos** (el slug real es `m2-001-los-palos-grandes`… en la semilla, `m2-001-palos-grandes`). Hoy no rompe nada: P4 es placeholder y no resuelve el slug. **P4 tiene que** cambiarlo a un slug real (propuesta: `m2-006-chacao`, el abierto) y adaptar las URL fijas de `rutas.spec.ts`. Va a `docs/mejoras.md` y al brief de P4.
- **R6 · Filtros fuera de la URL.** No se pueden compartir ni sobreviven a una recarga. Para `docs/mejoras.md`: `?etapa=&ubicacion=` con `useSearchParams`, dentro de `Suspense` (por `cacheComponents`).
- **R7 · Paralelo con P2.** Conflictos posibles de una línea en `tests/e2e/rutas.spec.ts` (`BUILT`) y en `src/shared/ui/README.md`. Los resuelve el orquestador al integrar la segunda rama.
- **R8 · El enlace de la tarjeta lleva a un placeholder** hasta que llegue P4. El copy de la tarjeta dice "Ver la ficha de…" (aria-label) y el título es el enlace. No se promete ninguna función que no exista.
- **Supuestos aplicados.** P3-1 y P3-2 (del brief). Además, con su propuesta por defecto:
  - **[SUPUESTO P3-3]** Solo un proyecto en colocación (`funding`) tiene participaciones disponibles. Al cerrar la colocación, las no colocadas quedan retenidas por la empresa (maestro §5: "las participaciones no vendidas permanecen en manos de la empresa") y la tarjeta muestra "0 de 100 · colocación cerrada".
  - **[SUPUESTO P3-4]** `acquired` (comprado, sin colocación abierta) no se publica.
  - **[SUPUESTO P3-5]** `sold` (vendido sin liquidar) se rotula "Vendido", entra en el filtro "Finalizados" con el rótulo "Histórico · vendido, liquidación en curso" y no muestra plazo objetivo.
  - **[SUPUESTO P3-6]** El plazo objetivo es único: 3 meses desde la compra hasta la firma de venta (maestro §4). Se muestra como proyección en todas las etapas no históricas, también en M2-002 cuando ya superó ese plazo (L5), sin contar días.
  - **[SUPUESTO P3-7]** Una colocación completa en `funding` (100/100) solo aparece con "Todas", con la insignia "Colocación completa".
- **Reglas de negocio nuevas:** ninguna inventada. Las de arriba aplican el maestro §4–§5 y L5, y quedan como preguntas.
- **Preguntas para `docs/08`.** El arquitecto no edita ese archivo; el orquestador las añade como "Bloque P · Marketplace (P3) 🟠":
  - P3-Q1: Al terminar la colocación, ¿las participaciones no colocadas siguen disponibles? Propuesta: no; quedan retenidas por la empresa y se muestra "0 de 100 · colocación cerrada".
  - P3-Q2: ¿Un proyecto comprado pero sin colocación abierta (`acquired`) aparece en el marketplace? Propuesta: no; se publica al abrir la colocación.
  - P3-Q3: ¿Cómo se muestra un proyecto vendido y aún no liquidado? Propuesta: "Vendido", en "Finalizados", con el rótulo "liquidación en curso".
  - P3-Q4: ¿El plazo objetivo es único (3 meses, maestro §4) o se fija por proyecto? ¿Se sigue mostrando cuando ya se superó? Propuesta: único y visible siempre como proyección (L5); por proyecto cuando B2/B3 lo capturen.
  - P3-Q5: Una colocación completa en `funding`, ¿entra en "Abiertos a participar"? Propuesta: no; solo en "Todas".
- **Para `docs/mejoras.md`:** R4 (entrada de UI separada), R5 (slug de ejemplo real en P4), R6 (filtros en la URL), fotografía de tarjeta (F4-2).
- **Para `docs/01`** (lo hace el orquestador, sin ADR): nota de D1 en §4 ("la vista que combina módulos vive en el más a la izquierda que puede importarlos todos") y `participations/ui/` en el árbol de §3 si hace falta.

## 7. ADR requerido

No. D1 aplica las reglas de `docs/01 §4` tal como están: no hay módulo nuevo y no cambian ni el orden ni `eslint.config.mjs`. D3 no cambia datos persistidos. Las decisiones de producto pendientes (P3-Q1…Q5) llevan una propuesta por defecto y no bloquean, pero **el usuario debe confirmarlas al aprobar este plan**, en especial P3-Q1 y P3-Q4, porque determinan cifras y plazos que verá el inversionista.
