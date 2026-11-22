# Plan 009 · DB-1 · Base de datos real en Supabase y "subir inmueble" en el backoffice

Estado: borrador · Fecha: 2026-11-22 · Autor: arquitecto
Relacionado: ADR-014 (aceptado), **ADR-015 (propuesto, este plan)**, ADR-001, ADR-004, ADR-012, ADR-013; docs/01 §4 §6 §7 §8; docs/02.
Proyecto Supabase: `clubm2` · ref `qatwjyreqshiwtdkovbd` · us-east-1 · vacío.

> **Precondición de arranque:** el agente que termina la interconexión de P4 (`src/modules/*/ui`, `src/app`, `index.ts`, `ports.ts`, `composition/*` hoy modificados en la rama) debe integrarse antes de que empiecen los paquetes 3 en adelante. Los paquetes 1 y 2 (SQL, solo `supabase/`) pueden correr ya.

## 1. Historia y criterios

**Historia** [PROPUESTO, no hay brief]: como miembro del equipo quiero entrar con mi cuenta y subir o editar un inmueble con su proyecto, presupuesto, proceso, riesgos e imágenes, para que la cara pública muestre datos compartidos entre dispositivos y no semillas del navegador; como visitante quiero ver exactamente lo mismo que hoy, sin ver nada interno.

Criterios (todos [PROPUESTO]):
- **CA1 · Esquema versionado.** `supabase/migrations/0001…0007_*.sql` crean todas las tablas de §3.2 con dinero en `bigint` de centavos (dominio SQL `money_cents`), porcentajes en `integer` pb (dominio `bps`), FKs con `on delete cascade` desde el proyecto, índices en toda FK y RLS **activado en el mismo archivo que crea cada tabla**. `get_advisors` (security y performance) sin hallazgos de nivel ERROR.
- **CA2 · Lectura pública solo de lo publicable.** Con rol `anon`: se leen los 6 proyectos publicados (status ∈ `PUBLIC_STAGES`) y su contenido; M2-007 (due diligence), su inmueble, economía y presupuesto devuelven 0 filas; `project_internal_flags` y `team_members` devuelven 0 filas; ninguna columna ni tabla contiene ruedas (se calculan en dominio). Verificado con las consultas de §5.3.
- **CA3 · Escritura solo del equipo.** `anon` y un `authenticated` sin fila en `team_members` no pueden insertar/actualizar/borrar en ninguna tabla ni subir a Storage (error 42501 / RLS). Un miembro con rol `editor` o `admin` sí. Solo `admin` gestiona `team_members`.
- **CA4 · Storage.** Bucket `project-images` (público de lectura, 5 MB, `image/jpeg|png|webp|avif`); subir/reemplazar/borrar solo equipo. Cada objeto tiene fila en `project_images` (antes · después · proyección · galería).
- **CA5 · Adaptadores sin tocar dominio.** Los puertos existentes de `projects`, `participations` y `finance` tienen adaptador Supabase en `infrastructure/`; ningún archivo de `domain/` cambia por la persistencia (solo se **añaden** tipos y reglas nuevas de §3.1). Los adaptadores pasan la misma **suite de contrato** que los mock.
- **CA6 · Selección por entorno.** `NEXT_PUBLIC_DATA_SOURCE=demo|supabase` (por defecto `demo`; vitest y Playwright siempre `demo`). En `supabase` faltan `NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_ANON_KEY` → error claro al crear el container. La clave service role **no existe** en el repo ni en variables `NEXT_PUBLIC_*`; un test lo vigila.
- **CA7 · Semilla coherente.** `supabase/seed.sql` se **genera** desde `buildDemoSnapshot(fixedClock(SEED_TODAY))` (snapshot de archivo de vitest); cargado en Supabase, el modo `supabase` muestra en P3/P4 las mismas cifras que el modo `demo` con el mismo "hoy". `seed-consistency.test.ts` sigue verde sin cambios de expectativas.
- **CA8 · Subir/editar inmueble.** `/admin/proyectos/nuevo` y `/admin/proyectos/[id]/editar`: formulario React Hook Form + Zod (forma), validación de negocio en dominio (`buildProjectSheet`), guardado atómico (una RPC), errores por campo, código `M2-NNN` y slug generados por dominio. Imágenes antes/después/proyección + galería con previsualización y borrado. Tras guardar, P3/P4 reflejan el cambio (invalidación de TanStack Query).
- **CA9 · Login real del equipo.** `/ingresar/equipo` con Supabase Auth (email + contraseña, sin registro abierto); `src/proxy.ts` refresca la sesión y redirige `/admin/**` sin sesión de equipo a `/ingresar/equipo` (solo en modo `supabase`). "Salir" cierra la sesión. El acceso del inversionista sigue siendo de demostración (ADR-012/014).
- **CA10 · Datos personales fuera.** No hay tablas de reservas, leads, visitas ni tenencias de inversionistas. Reservar, agendar visita y registrarse siguen simulados en `localStorage` en ambos modos (F5-3 / M-009).
- **CA11 · Calidad.** `pnpm verify` y `pnpm build` verdes en modo demo; `check-copy` verde en el copy nuevo; `src/architecture-rules.test.ts` verde con los elementos nuevos; E2E del flujo "subir inmueble" en 390 y 1440 (modo demo).

## 2. Módulos afectados

| Módulo | Por qué | Nuevo |
|---|---|---|
| `shared/infrastructure/supabase` | Cliente de navegador (`@supabase/ssr`), refresco de sesión para el proxy, error de fuente de datos | Sí (carpeta) |
| `shared/config` | `data-source.ts`: modo demo/supabase y variables públicas | Archivo nuevo |
| `team` | Sesión y rol del equipo (puerto de autenticación, login, salir) | **Sí (módulo)** — ADR-015 |
| `projects` | Imágenes (tipo + puertos + casos de uso), código/slug de proyectos nuevos, adaptadores Supabase de lectura | No |
| `participations` | Adaptador Supabase de clases (las tenencias siguen en demo-store) | No |
| `finance` | "Ficha del proyecto" como comando de escritura (une los 3 módulos, regla 2b), adaptadores Supabase, formulario del backoffice | No |
| `composition` | Backends `demo` / `supabase`, generador de `seed.sql`, guardias de secretos y deriva de esquema | No |
| `supabase/` (raíz) | Migraciones y semilla | Sí (carpeta) |
| `src/proxy.ts` | Gate de `/admin/**` y refresco de cookies de sesión (Next 16: `proxy` reemplaza a `middleware`) | Sí — ADR-015 |

Orden de dependencias (docs/01 §4 regla 3) con `team` añadido en la base: `shared → team → projects → participations → finance → …`. `team` no importa ningún módulo; nadie en dominio lo necesita en v1 (la autorización la hace RLS).

## 3. Contratos

### 3.0 Decisiones de diseño (cerradas por este plan salvo que el usuario diga lo contrario)

- **D1 · Escrituras desde el navegador bajo RLS, sin Server Actions en v1.** El container ya es de cliente (`providers.tsx`, TanStack Query). El cliente Supabase del navegador lleva la sesión del miembro en cookies (`@supabase/ssr`) y **RLS es la única barrera de seguridad** (la UI y el proxy solo mejoran la experiencia). Motivos: (a) se cumple ADR-001 §7 literalmente (otro adaptador + una línea en composition); (b) las imágenes suben directo a Storage y no chocan con el límite de 1 MB del cuerpo de una Server Action (`serverActions.bodySizeLimit`); (c) no hace falta service role en el servidor; (d) con `cacheComponents: true`, leer `cookies()` en layouts obligaría a envolver en `<Suspense>` todo `/admin`; así ninguna página lee cookies. Se revisa cuando exista auditoría en servidor o SSR de datos (F5).
- **D2 · Sin clave service role.** La semilla y las migraciones las aplica el orquestador por el MCP de Supabase (corre como `postgres`). Ningún archivo del repo lee `SUPABASE_SERVICE_ROLE_KEY`.
- **D3 · Estado interno `stalled` fuera de la tabla pública.** `projects.status` nunca vale `stalled` (CHECK). La demora interna vive en `project_internal_flags` (solo equipo). El adaptador, con sesión de equipo, devuelve `status: "stalled"` si hay bandera; sin ella, el valor público (`on_sale`). Así la regla de ADR-004/L5 es de filas (RLS), no de columnas, y sigue siendo segura cuando los inversionistas tengan cuentas (F5).
- **D4 · Lo interno va en tablas propias, nunca en columnas de tablas públicas.** RLS filtra filas, no columnas. Cualquier dato futuro solo del backoffice (notas, oferta, margen mínimo G2) va en una tabla `*_internal` con política solo-equipo.
- **D5 · Ruedas y márgenes no se guardan.** Se calculan en dominio (`classifyProjectWheel`, KPIs) desde `timeline` + `Clock`. Ninguna columna `wheel`, `rueda`, `margin`.
- **D6 · IDs de texto legibles.** PK `text` con el mismo formato que `parseId` (`prj_…`, `prop_…`, `pcl_…`, `stl_…`, `upd_…`, `img_…`); los nuevos salen de `randomIdGenerator()`. Así la semilla conserva `prj_chacao_01` y las tenencias demo (`localStorage`) siguen apuntando a clases que existen en la base.
- **D7 · Atomicidad: una RPC por ficha.** `public.save_project_sheet(p_sheet jsonb, p_expected_revision timestamptz)` (`security invoker`, `search_path = ''`) escribe inmueble, proyecto, perfil, proceso, riesgos, clase, economía y rubros en una transacción. Concurrencia optimista con `updated_at` como `revision`.
- **D8 · Tenencias del inversionista demo siguen en `localStorage` en ambos modos.** En modo `supabase` el demo-store se siembra con `fixedClock(SEED_TODAY)` para que `subscribedOn` cuadre con las fechas congeladas de la base; el "hoy" de la app sigue siendo `demoClock()`.
- **D9 · Fechas de la semilla congeladas** en `SEED_TODAY = "2026-11-22"` (mismo `TODAY` de `seed-consistency.test.ts`). Con el tiempo las etapas "estimadas" quedan en el pasado; se regenera con `SEED_TODAY` nuevo (`pnpm vitest run src/composition/supabase-seed.test.ts -u`) y se recarga (N4 ya aceptaba congelar).
- **D10 · Imagen con URL resuelta por el adaptador.** El dominio guarda `ProjectImage` con `url` e `isReference`; mock y semilla apuntan a las ilustraciones de `public/images/proyectos/<código>/*.svg` (`isReference: true` → rótulo "Imagen de referencia"); las subidas apuntan a la URL pública del bucket (`isReference: false`).

### 3.1 TypeScript (contratos entre paquetes)

```ts
// ───────────── shared/config/data-source.ts (nuevo) ─────────────
export type DataSource = "demo" | "supabase";
export type DataSourceConfig =
  | { readonly kind: "demo" }
  | { readonly kind: "supabase"; readonly url: string; readonly anonKey: string; readonly seedToday: IsoDate };
/** Lee process.env.NEXT_PUBLIC_DATA_SOURCE / _SUPABASE_URL / _SUPABASE_ANON_KEY con acceso ESTÁTICO (Next los incrusta al compilar). Nunca lanza: devuelve err si falta algo en modo supabase. */
export function readDataSourceConfig(env?: Readonly<Record<string, string | undefined>>): Result<DataSourceConfig, DomainError<"MISSING_SUPABASE_ENV" | "INVALID_DATA_SOURCE">>;
export const SEED_TODAY: IsoDate; // "2026-11-22"

// ───────────── shared/infrastructure/supabase/ (nuevo) ─────────────
// database.types.ts  ← generado por el MCP (generate_typescript_types). No se edita a mano.
export type ClubDatabase = Database;                      // re-export del generado
export type ClubSupabaseClient = SupabaseClient<ClubDatabase>;
/** browser-client.ts — singleton por pestaña; createBrowserClient de @supabase/ssr. */
export function getBrowserSupabase(config: Extract<DataSourceConfig, { kind: "supabase" }>): ClubSupabaseClient;
/** proxy-session.ts — usado SOLO por src/proxy.ts: createServerClient con cookies de request/response; refresca y devuelve si hay miembro del equipo. */
export function refreshTeamSession(request: NextRequest, config: SupabaseEnv): Promise<{ response: NextResponse; isTeamMember: boolean }>;
/** data-source-error.ts — los adaptadores de lectura lanzan esto ante error de red/PostgREST (TanStack muestra el estado de error). Los puertos de escritura devuelven Result. */
export class DataSourceError extends Error { readonly code: string }

// ───────────── modules/team (nuevo) ─────────────
// domain/team-member.ts
export const TEAM_ROLES = ["admin", "editor"] as const;          // [PROPUESTO S1]
export type TeamRole = (typeof TEAM_ROLES)[number];
export type TeamMemberId = Id<"TeamMember">;                     // = auth.users.id (uuid) en Supabase
export type TeamSession = { readonly memberId: TeamMemberId; readonly email: string; readonly displayName: string; readonly role: TeamRole };
export function canManageTeam(role: TeamRole): boolean;          // solo admin
// application/ports.ts
export interface TeamAuthGateway {
  current(): Promise<TeamSession | null>;
  signIn(email: string, password: string): Promise<Result<TeamSession, DomainError<"INVALID_CREDENTIALS" | "NOT_TEAM_MEMBER" | "AUTH_UNAVAILABLE">>>;
  signOut(): Promise<void>;
  /** Devuelve la función para desuscribirse. */
  onChange(listener: (session: TeamSession | null) => void): () => void;
}
// infrastructure: team-auth.supabase.ts (signInWithPassword + select en team_members) · team-auth.demo.ts (sesión admin ficticia: mantiene el "Acceso del equipo" de ADR-012 en modo demo)

// ───────────── modules/projects ─────────────
// domain/project-image.ts (nuevo)
export const PROJECT_IMAGE_KINDS = ["before", "after", "projection", "gallery"] as const;
export type ProjectImageKind = (typeof PROJECT_IMAGE_KINDS)[number];
export type ProjectImageId = Id<"ProjectImage">;
export type ProjectImage = {
  readonly id: ProjectImageId; readonly projectId: ProjectId; readonly kind: ProjectImageKind;
  readonly url: string; readonly alt: string;
  /** Orden dentro de su tipo (galería); 0 para antes/después/proyección. */
  readonly position: number;
  /** true = ilustración de referencia (rótulo obligatorio "Imagen de referencia"). */
  readonly isReference: boolean;
};
export const IMAGE_UPLOAD_LIMITS: { readonly maxBytes: 5_242_880; readonly mimeTypes: readonly ["image/jpeg","image/png","image/webp","image/avif"]; readonly maxGallery: 12 }; // [PROPUESTO S8]
export type ImageUploadCandidate = { readonly projectId: ProjectId; readonly kind: ProjectImageKind; readonly mimeType: string; readonly sizeBytes: number; readonly alt: string };
/** Valida tipo MIME, tamaño, alt no vacío (≤ 160) y cupo: 1 por before/after/projection (reemplaza), ≤ maxGallery en gallery. Nunca lanza. */
export function checkImageUpload(c: ImageUploadCandidate, existing: readonly ProjectImage[]): Result<{ readonly replaces: ProjectImageId | null; readonly position: number }, DomainError<"UNSUPPORTED_IMAGE_TYPE" | "IMAGE_TOO_LARGE" | "MISSING_ALT" | "GALLERY_FULL">>;

// domain/project-code.ts (nuevo)
/** Siguiente código libre: max(n) + 1 con el prefijo dado (brand.shortName, inyectado). ["M2-001","M2-007"] → "M2-008". */
export function nextProjectCode(existing: readonly ProjectCode[], prefix: string): Result<ProjectCode, DomainError<"INVALID_PROJECT_CODE" | "CODE_SPACE_EXHAUSTED">>;
/** `${code.toLowerCase()}-${kebab(zona sin tildes)}`; "M2-008" + "Los Palos Grandes" → "m2-008-los-palos-grandes". Cumple PROJECT_SLUG_PATTERN. */
export function buildProjectSlug(code: ProjectCode, zone: string): Result<string, DomainError<"INVALID_SLUG">>;

// application/ports.ts (se AÑADEN; los existentes no cambian)
export interface ProjectMediaRepository {
  /** Orden: before, after, projection, gallery por position. */
  listByProject(projectId: ProjectId): Promise<readonly ProjectImage[]>;
}
export interface ProjectMediaWriter {
  /** Sube el binario y crea la fila; si la fila falla, borra el objeto (compensación). */
  add(image: Omit<ProjectImage, "url" | "isReference">, file: Blob): Promise<Result<ProjectImage, DomainError<"UPLOAD_FAILED" | "NOT_AUTHORIZED">>>;
  remove(id: ProjectImageId): Promise<Result<void, DomainError<"NOT_FOUND" | "NOT_AUTHORIZED" | "UPLOAD_FAILED">>>;
}
// application/upload-project-image.ts · remove-project-image.ts (nuevos)
export type UploadProjectImage = (input: ImageUploadCandidate & { readonly file: Blob }) => Promise<Result<ProjectImage, DomainError<"UNSUPPORTED_IMAGE_TYPE" | "IMAGE_TOO_LARGE" | "MISSING_ALT" | "GALLERY_FULL" | "UPLOAD_FAILED" | "NOT_AUTHORIZED">>>;
export function createUploadProjectImage(deps: { media: ProjectMediaRepository; writer: ProjectMediaWriter; ids: IdGenerator }): UploadProjectImage;
export type RemoveProjectImage = (id: ProjectImageId) => Promise<Result<void, DomainError<"NOT_FOUND" | "NOT_AUTHORIZED" | "UPLOAD_FAILED">>>;
export function createRemoveProjectImage(deps: { writer: ProjectMediaWriter }): RemoveProjectImage;

// ───────────── modules/finance (comando que une projects + participations + finance; docs/01 §4 regla 2b) ─────────────
// domain/project-sheet.ts (nuevo)
export type ProjectSheetInput = {
  /** null = crear. */
  readonly projectId: ProjectId | null;
  /** updated_at leído; null al crear. Concurrencia optimista (D7). */
  readonly revision: string | null;
  readonly property: { readonly city: string; readonly zone: string; readonly kind: PropertyKind; readonly areaM2: number };
  readonly project: { readonly name: string; readonly status: Exclude<ProjectStatus, "stalled">; readonly timeline: ProjectTimeline };
  readonly profile: { readonly description: string; readonly highlights: readonly string[] } | null;
  readonly processSteps: ProjectProcess["steps"] | null;
  readonly riskKinds: readonly ProjectRiskKind[];
  readonly participationClass: { readonly total: number; readonly placed: number; readonly unitPrice: Money } | null;
  readonly economics: Omit<ProjectEconomics, "projectId">;
  readonly budgetLines: readonly BudgetLine[];
};
export type ProjectSheet = {
  readonly revision: string | null;
  readonly property: Property; readonly project: Project;
  readonly profile: PropertyProfile | null; readonly process: ProjectProcess | null; readonly risks: ProjectRisks | null;
  readonly participationClass: ParticipationClass | null;
  readonly economics: ProjectEconomics; readonly budget: ProjectBudget;
};
/** Campo del formulario al que apunta cada error (la UI lo pinta junto al control). */
export type ProjectSheetField =
  | "property.city" | "property.zone" | "property.kind" | "property.areaM2"
  | "project.name" | "project.status" | "project.timeline"
  | "profile" | "processSteps" | "riskKinds" | "participationClass" | "economics" | "budgetLines";
export type ProjectSheetErrorCode =
  | "REQUIRED_FOR_PUBLISHED"      // perfil, proceso, clase o riesgos comunes faltan en un estado publicable [PROPUESTO S4]
  | "INVALID_PROPERTY" | "INVALID_PROFILE" | "INCONSISTENT_TIMELINE"
  | "STATUS_CHANGE_NOT_ALLOWED"   // al editar, el estado solo cambia con changeProjectStatus (PROJECT_TRANSITIONS)
  | ProcessErrorCode | BudgetErrorCode
  | "INVALID_PARTICIPATION_CLASS" | "RECOVERY_BUDGET_MISMATCH" // F ≠ total × unitPrice [PROPUESTO S5]
  | "MISSING_COMMON_RISKS" | "INVALID_PROJECT_CODE" | "INVALID_SLUG";
export type ProjectSheetIssue = DomainError<ProjectSheetErrorCode> & { readonly field: ProjectSheetField };
export type ProjectSheetContext = {
  readonly existing: ProjectSheet | null;
  readonly existingCodes: readonly ProjectCode[];
  readonly codePrefix: string;                 // brand.shortName, inyectado
  readonly ids: { readonly projectId: ProjectId; readonly propertyId: PropertyId; readonly classId: ParticipationClassId };
  /** Inyectada desde composition (D2 de plan 006: finance no importa valores de participations). */
  readonly checkParticipationClass: (c: ParticipationClass) => Result<ParticipationClass, DomainError>;
};
/** Pura. Reúne TODOS los errores (no se detiene en el primero) usando checkProjectConsistency, checkProjectProcess, checkProjectBudget, normalizeRiskKinds, nextProjectCode, buildProjectSlug. Nunca lanza. */
export function buildProjectSheet(input: ProjectSheetInput, ctx: ProjectSheetContext): Result<ProjectSheet, readonly ProjectSheetIssue[]>;

// application/ports.ts (se AÑADE)
export interface ProjectSheetWriter {
  save(sheet: ProjectSheet): Promise<Result<{ readonly revision: string }, DomainError<"NOT_AUTHORIZED" | "CONFLICT" | "PERSISTENCE_FAILED">>>;
}
// application/get-project-sheet.ts · save-project-sheet.ts (nuevos)
export type GetProjectSheet = (projectId: ProjectId) => Promise<ProjectSheet | null>;
export function createGetProjectSheet(deps: { projects: ProjectRepository; properties: PropertyRepository; content: ProjectContentRepository; classes: ParticipationClassRepository; economics: ProjectEconomicsRepository; budgets: ProjectBudgetRepository; revisionOf: (id: ProjectId) => Promise<string | null> }): GetProjectSheet;
export type SaveProjectSheetError = ProjectSheetIssue | DomainError<"NOT_AUTHORIZED" | "CONFLICT" | "PERSISTENCE_FAILED">;
export type SaveProjectSheet = (input: ProjectSheetInput) => Promise<Result<ProjectSheet, readonly SaveProjectSheetError[]>>;
export function createSaveProjectSheet(deps: { getSheet: GetProjectSheet; projects: ProjectRepository; writer: ProjectSheetWriter; ids: IdGenerator; codePrefix: string; checkParticipationClass: ProjectSheetContext["checkParticipationClass"] }): SaveProjectSheet;

// domain/project-detail-types.ts (se AÑADE un campo; lo llena get-project-detail con ProjectMediaRepository)
//   ProjectDetail.images: readonly ProjectImage[]   // vacío → la UI cae a las ilustraciones de referencia por código

// ───────────── composition ─────────────
// composition/backends/types.ts
export type Backend = {
  readonly projects: { projectRepository; propertyRepository; contentRepository; mediaRepository: ProjectMediaRepository; mediaWriter: ProjectMediaWriter };
  readonly participations: { classRepository: ParticipationClassRepository };   // participationRepository SIEMPRE demo (D8)
  readonly finance: { economicsRepository; settlementRepository; budgetRepository; sheetWriter: ProjectSheetWriter; revisionOf: (id: ProjectId) => Promise<string | null> };
  readonly team: { auth: TeamAuthGateway };
};
// composition/backends/demo.ts:     export function createDemoBackend(store: DemoStore<DemoSnapshot>): Backend;
// composition/backends/supabase.ts: export function createSupabaseBackend(client: ClubSupabaseClient, team: TeamAuthGateway): Backend;
// container.ts: la ÚNICA línea que decide →
//   const backend = config.kind === "supabase" ? createSupabaseBackend(getBrowserSupabase(config), …) : createDemoBackend(store);
// Container gana: team: { auth: TeamAuthGateway }, finance.getProjectSheet, finance.saveProjectSheet, projects.uploadProjectImage, projects.removeProjectImage, dataSource: DataSource.
// composition/supabase-seed.ts: export function buildSupabaseSeedSql(snapshot: DemoSnapshot): string;   // excluye participations.participations (D8, CA10)
```

### 3.2 Esquema SQL (`supabase/migrations/`)

Convenciones: todo en `public`; nombres `snake_case`; `text` + `CHECK` en vez de `enum` de Postgres (evoluciona sin `ALTER TYPE`); cada lista de valores lleva un comentario marcador `-- enum:<nombre>` que el test de deriva compara con la constante TS; `created_at`/`updated_at timestamptz default now()` + trigger `set_updated_at`; `updated_by uuid default auth.uid() references auth.users on delete set null` en tablas editables; RLS con `(select auth.uid())` y funciones `stable` para que Postgres las evalúe una vez por consulta.

| Archivo | Contenido |
|---|---|
| `0001_base.sql` | Dominios `money_cents` (`bigint check (value between -900000000000 and 900000000000)` = `MAX_MONEY_CENTS`) y `bps` (`integer check (value between 0 and 10000)`); `id_text` (`text check (value ~ '^[a-z][a-z0-9]*(_[a-z0-9]+)+$')` = `parseId`). Función `set_updated_at()` (trigger). Función `is_published_status(text) returns boolean immutable` con `-- enum:public_stage` = `PUBLIC_STAGES` (`funding, renovation, on_sale, sold, settled`). |
| `0002_team.sql` | `team_members(user_id uuid pk references auth.users on delete cascade, role text not null check -- enum:team_role ('admin','editor'), display_name text not null, created_at)`. Funciones `is_team_member()` y `has_team_role(text)`: `security definer`, `stable`, `set search_path = ''`, `revoke execute … from anon`. RLS: select si `is_team_member()`; insert/update/delete si `has_team_role('admin')`. Sin política para anon. |
| `0003_projects.sql` | `properties(id id_text pk, city, zone, kind check -- enum:property_kind, area_m2 integer check > 0, data_origin text check ('simulated','real') default 'simulated')`. `projects(id pk, code text unique check '^[A-Z0-9]{1,4}-\d{3}$', slug text unique check PROJECT_SLUG_PATTERN, name, property_id fk → properties on delete restrict, status text check -- enum:project_status_stored (= PROJECT_STATUSES sin 'stalled'), acquired_on date, sale_signed_on date, settled_on date, check (sale_signed_on >= acquired_on), check (settled_on >= sale_signed_on), data_origin, created_at, updated_at, updated_by)`. `project_internal_flags(project_id pk fk cascade, stalled_since date not null, note text)` **solo equipo**. `property_profiles(property_id pk fk cascade, description text not null, highlights text[] not null check cardinality 1..5)`. `project_process_steps(project_id fk cascade, stage text check -- enum:process_stage, status text check -- enum:process_step_status, offset_days integer check >= 0, started boolean, pk (project_id, stage))`. `project_updates(id pk, project_id fk cascade, published_on date, title, body, created_by)` + índice `(project_id, published_on desc)`. `project_risks(project_id fk cascade, kind text check -- enum:project_risk_kind, pk (project_id, kind))`. Función `can_read_project(text) returns boolean` (`security definer`, `stable`, `search_path=''`): `is_team_member() or exists(select 1 from public.projects where id = $1 and public.is_published_status(status))`. Índice `projects(property_id)`. |
| `0004_participations.sql` | `participation_classes(id pk, project_id text unique fk cascade, total integer check >= 1, placed integer check (placed between 0 and total), unit_price_cents money_cents check > 0)`. **No** se crea tabla de tenencias ni reservas (CA10). |
| `0005_finance.sql` | `project_economics(project_id pk fk cascade, acquisition_cost_cents, recovery_budget_cents, target_sale_price_cents, estimated_sale_costs_cents` — todos `money_cents check >= 0`). `project_budget_lines(project_id fk cascade, item text check -- enum:budget_item, amount_cents money_cents check >= 0, position smallint, pk (project_id, item), unique (project_id, position))` (la categoría se deriva, no se guarda). `settlements(id pk, project_id unique fk cascade, settled_on date, sale_price_cents, acquisition_cost_cents, recovery_budget_cents, sale_costs_cents, total, placed, unit_price_cents, fund_share_bps bps null, company_share_bps bps null` — null = `DEFAULT_DISTRIBUTION_SHARES`, `check ((fund is null) = (company is null))`, `check (fund + company = 10000)` — `surplus_cents, fund_cents, per_participation_cents, rounding_residue_cents, to_external_cents, company_from_fund_cents, company_direct_cents, company_total_cents, capital_external_cents, capital_company_cents)` + `check (to_external_cents + company_total_cents = surplus_cents)` (invariante del motor como red de seguridad). Escritura de liquidaciones: solo equipo, sin UI en este plan (B5). |
| `0006_media.sql` | `project_images(id pk, project_id fk cascade, kind text check -- enum:project_image_kind, storage_path text null, bundled_path text null, check ((storage_path is null) <> (bundled_path is null)), alt text not null check length 1..160, position smallint default 0, created_at, created_by)` + `unique (project_id, kind) where kind <> 'gallery'` (índice parcial) + índice `(project_id, kind, position)`. Bucket: `insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values ('project-images','project-images', true, 5242880, '{image/jpeg,image/png,image/webp,image/avif}')`. Políticas en `storage.objects` para `bucket_id = 'project-images'`: insert/update/delete `to authenticated using/with check (public.is_team_member())`; **sin** política select amplia (el bucket público sirve por URL; evita listar el bucket — hallazgo típico del advisor). Ruta de objeto: `<project_id>/<image_id>.<ext>`. |
| `0007_save_project_sheet.sql` | `save_project_sheet(p_sheet jsonb, p_expected_revision timestamptz) returns timestamptz` (`security invoker`, `set search_path = ''`, `revoke execute from anon, public; grant to authenticated`). Al inicio `if not public.is_team_member() then raise exception using errcode = '42501'`; si `p_expected_revision` no coincide con `projects.updated_at` → `errcode = 'P0409'` (CONFLICT). Upsert de inmueble, proyecto, perfil y clase/economía; `delete + insert` de proceso, riesgos y rubros. Revalida en SQL lo barato (F = total × precio, Σ rubros = F) como red de seguridad; la validación completa es la de dominio. Devuelve el nuevo `updated_at` (revision). |

RLS por tabla (todas con `enable row level security`; ninguna política `using (true)` salvo la de lectura pública filtrada):

| Tabla | select | insert / update / delete |
|---|---|---|
| `team_members` | `is_team_member()` | `has_team_role('admin')` |
| `properties` | `is_team_member() or exists(select 1 from projects p where p.property_id = id and is_published_status(p.status))` | `is_team_member()` |
| `projects` | `is_published_status(status) or is_team_member()` | `is_team_member()` (delete: `has_team_role('admin')` [PROPUESTO S10]) |
| `project_internal_flags` | `is_team_member()` | `is_team_member()` |
| `property_profiles` | vía `properties` (mismo predicado) | `is_team_member()` |
| `project_process_steps`, `project_updates`, `project_risks`, `participation_classes`, `project_economics`, `project_budget_lines`, `settlements`, `project_images` | `can_read_project(project_id)` | `is_team_member()` |

### 3.3 Variables de entorno

| Variable | Dónde | Notas |
|---|---|---|
| `NEXT_PUBLIC_DATA_SOURCE` | `.env.local`, Vercel | `demo` (defecto) · `supabase` |
| `NEXT_PUBLIC_SUPABASE_URL` | `.env.local`, Vercel | `https://qatwjyreqshiwtdkovbd.supabase.co` (MCP `get_project_url`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `.env.local`, Vercel | clave pública (MCP `get_publishable_keys`; vale la `anon` o la `sb_publishable_…`) |
| `SUPABASE_SERVICE_ROLE_KEY` | **en ningún lado** | D2. `composition/secrets-guard.test.ts` falla si aparece `service_role`/`SERVICE_ROLE` en `src/`, `scripts/` o `.env.example` |

`.env.example` (versionado; `.gitignore` ya lo permite) con las tres primeras y valores vacíos.

### 3.4 Dependencias nuevas

- `@supabase/supabase-js` y `@supabase/ssr` (aprobadas por ADR-014). Instalar con versión exacta: `pnpm add -E @supabase/supabase-js @supabase/ssr` y registrar la versión resultante en la entrega (no pude consultar el registro: el orquestador fija la versión que resuelva hoy, que debe ser `@supabase/ssr` ≥ 0.6 por la API `getAll/setAll` de cookies).
- **Ninguna más**: ni CLI de Supabase (migraciones por MCP), ni `tsx` (la semilla se genera con `toMatchFileSnapshot` de vitest), ni librería de subida de archivos.

## 4. Paquetes

Un archivo pertenece a un solo paquete. "Orq." = agente principal (único que usa el MCP de Supabase, instala dependencias, hace commits).

| # | Agente | Archivos (exclusivos) | Depende de | Paralelo con | Criterios |
|---|---|---|---|---|---|
| 0 | Orq. | Aprobación de ADR-015 y respuestas S1–S5 del usuario; `pnpm add -E @supabase/supabase-js @supabase/ssr` (`package.json`, `pnpm-lock.yaml`); `.env.example`; en el panel de Supabase: **desactivar registro abierto** (Auth → "Allow new users to sign up" off), Site URL y redirect URLs (localhost + Vercel) | — | 1 | CA6, CA9 |
| 1 | datos-demo | `supabase/migrations/0001_base.sql` … `0007_save_project_sheet.sql`; `src/composition/supabase-schema-drift.test.ts` (lee los SQL y compara cada `-- enum:` con `PUBLIC_STAGES`, `PROJECT_STATUSES` − `stalled`, `PROCESS_STAGE_KINDS`, `PROCESS_STEP_STATUSES`, `PROJECT_RISK_KINDS`, `BUDGET_ITEMS`, `PROJECT_IMAGE_KINDS`, `TEAM_ROLES`, `MAX_MONEY_CENTS`, `PROJECT_SLUG_PATTERN`) | contratos §3.2 | 0, 3 | CA1–CA4, CA10 |
| 2 | Orq. (MCP) | Aplica 0001→0007 con `apply_migration` (nombre = nombre de archivo sin `.sql`, en orden); `list_tables` + `list_migrations`; `get_advisors` security y performance → corrige con paquete 1 si hay ERROR; ejecuta las consultas de §5.3; `generate_typescript_types` → escribe `src/shared/infrastructure/supabase/database.types.ts` | 1 | 3 | CA1–CA4 |
| 3 | dominio-financiero | `src/modules/team/**` salvo `infrastructure/` y `ui/` (`CLAUDE.md`, `domain/team-member.ts`+test, `application/ports.ts`, `index.ts`); `architecture.modules.mjs` (línea `team`); `src/modules/projects/domain/project-image.ts`+test, `project-code.ts`+test; `src/modules/projects/application/ports.ts`, `upload-project-image.ts`+test, `remove-project-image.ts`+test; `src/modules/projects/index.ts`; `src/modules/finance/domain/project-sheet.ts`+test, `project-detail-types.ts`; `src/modules/finance/application/ports.ts`, `get-project-sheet.ts`+test, `save-project-sheet.ts`+test, `get-project-detail.ts`(+test, añade `images`); `src/modules/finance/index.ts`; `CLAUDE.md` de projects y finance | contratos §3.1; P4 integrado | 1, 2 | CA5, CA8 |
| 4 | datos-demo | `src/shared/config/data-source.ts`+test; `src/shared/infrastructure/supabase/{client-types.ts, browser-client.ts, proxy-session.ts, data-source-error.ts}`; `src/modules/projects/infrastructure/{project-rows.ts, projects.supabase-repository.ts, project-media.supabase.ts, project-media.mock.ts}` (+tests de mapeo); `src/modules/participations/infrastructure/{participation-class-rows.ts, participation-classes.supabase-repository.ts}`(+test); `src/modules/finance/infrastructure/{finance-rows.ts, finance.supabase-repository.ts, project-sheet.supabase-writer.ts}`(+tests); `src/modules/team/infrastructure/{team-auth.supabase.ts, team-auth.demo.ts}`; `src/modules/*/infrastructure/*.contract.ts` (suite de contrato por puerto, §5.1) | 2 (tipos generados), 3 | — | CA5, CA6, CA10 |
| 5 | datos-demo | `src/composition/container.ts`, `container.test.ts`, `modules/{projects,participations,finance}.ts`, `modules/team.ts` (nuevo), `backends/{types.ts, demo.ts, supabase.ts, demo-sheet-writer.ts}`, `supabase-seed.ts`, `supabase-seed.test.ts` → genera `supabase/seed.sql`, `secrets-guard.test.ts` | 3, 4 | 6 (solo tras fijar `Container`) | CA6, CA7, CA10 |
| 6 | Orq. (MCP) | Ejecuta `supabase/seed.sql` con `execute_sql`; verifica conteos (7 proyectos, 6 clases, 7 economías, 7 presupuestos, 2 liquidaciones, 17 actualizaciones, 6 perfiles/procesos/riesgos, 21 imágenes de referencia, 0 tenencias); crea el primer usuario del equipo (panel: Auth → Invite) e inserta su fila en `team_members` (rol `admin`) | 2, 5 | 7, 8, 9 | CA7, CA9 |
| 7 | constructor-ui | `src/modules/team/ui/{components/admin/TeamLoginForm.tsx, components/admin/TeamSessionBar.tsx, hooks/use-team-session.ts, copy.ts}`, `src/modules/team/backoffice-ui.ts`; `src/app/(publico)/ingresar/equipo/page.tsx`; `src/app/admin/layout.tsx` (monta `TeamSessionBar`); `src/proxy.ts`; `eslint.config.mjs` (elemento `proxy` → puede importar `shared-infra`, `shared-lib`); `src/shared/ui/app-shell/route-map.ts` (ruta `teamLogin`); el botón "Acceso del equipo" de `/ingresar` apunta a `/ingresar/equipo` en modo supabase (archivo del componente de investors que lo contiene) | 5 | 8, 9 | CA9 |
| 8 | constructor-ui | `src/modules/finance/ui/forms/project-sheet-schema.ts`(+test); `src/modules/finance/ui/hooks/{use-project-sheet.ts, use-save-project-sheet.ts}`; `src/modules/finance/ui/components/admin/project-sheet/*.tsx` + `copy-project-sheet.ts`; `src/modules/finance/backoffice-ui.ts`; `src/app/admin/proyectos/nuevo/page.tsx`, `src/app/admin/proyectos/[id]/editar/page.tsx`; `src/shared/lib/parse-usd-input.ts`(+test; "1.234,56" → centavos por manipulación de texto, sin aritmética con `.cents`) | 5 | 7, 9 | CA8, CA11 |
| 9 | constructor-ui | `src/modules/projects/ui/{components/admin/ProjectImagesManager.tsx, hooks/use-project-images.ts, copy.ts}`, `src/modules/projects/backoffice-ui.ts`; `src/shared/ui/brand/{ProjectImage.tsx, ProjectGallery.tsx, project-media.test.tsx}` (aceptan `src` + `isReference`; sin imágenes → caen a `projectImageSrc(code, variant)`); `src/modules/finance/ui/components/investor/GallerySection.tsx` (pasa `data.images`); `next.config.ts` (`images.remotePatterns` para `https://qatwjyreqshiwtdkovbd.supabase.co/storage/v1/object/public/project-images/**`) | 5 | 7, 8 | CA4, CA8 |
| 10 | constructor-ui | `tests/e2e/admin-subir-inmueble.spec.ts` (modo demo) y `tests/e2e/supabase-smoke.spec.ts` (`test.skip` salvo `E2E_SUPABASE=1` + credenciales de prueba del equipo en el entorno) | 7, 8, 9 | — | CA8, CA9, CA11 |
| 11 | revisor-codigo ∥ revisor-cumplimiento | Solo informes | 10 | — | todos |
| 12 | Orq. | Docs al aceptar ADR-015: `docs/01` (§1 fila Datos, §3 árbol con `supabase/`, `team`, `proxy.ts`, §4 fila `proxy`, §6, §7), `docs/07` (Supabase: proyecto, MCP, variables), `docs/estado.md` (fila DB-1), `docs/08` (bloque S de §6), `CLAUDE.md` (estado y comandos de la semilla) | 11 | — | — |

Paralelismo: **1 ∥ 3** (ya, salvo que 3 espera a P4 integrado) → 2 → 4 → 5 → 6 ∥ **7 ∥ 8 ∥ 9** → 10 → 11 → 12. 7, 8 y 9 solo necesitan el tipo `Container` de 5 y funcionan en modo demo; la prueba en modo supabase espera a 6.

Notas de capas para los agentes:
- `infrastructure/` de cada módulo importa `ClubSupabaseClient` de `shared/infrastructure/supabase` (permitido) y nunca otro módulo; el escritor de la ficha (`finance/infrastructure/project-sheet.supabase-writer.ts`) solo conoce `ProjectSheet` (tipo propio) y llama a la RPC.
- `demo-sheet-writer.ts` vive en `composition/backends/` porque escribe tres slices del demo-store (infra no puede ver otros módulos).
- `participations` sigue la trampa R4: `composition` importa de él por ruta interna o `import type`.
- Los adaptadores Supabase de **lectura** con sesión de equipo convierten `project_internal_flags` → `status: "stalled"` (D3); sin sesión no consultan esa tabla.
- `ProjectSheet` → JSON de la RPC: dinero como `cents` (number entero), fechas ISO; el adaptador valida cada fila leída con Zod (`moneySchema`, `isoDateSchema`, `idSchema`) y `parseUsdCents`; una fila inválida → `DataSourceError` (nunca datos a medias).

## 5. Pruebas

### 5.1 Dominio y aplicación (vitest, siempre en modo demo)
- `project-sheet.test.ts`: crear con estado `due_diligence` y solo inmueble + economía (sin clase/proceso/perfil) → ok; crear `funding` sin proceso/perfil/clase/riesgos → 4 `REQUIRED_FOR_PUBLISHED` con su `field`; F ≠ total × precio → `RECOVERY_BUDGET_MISMATCH`; Σ rubros ≠ F → `BUDGET_TOTAL_MISMATCH`; timeline incoherente con el estado → `INCONSISTENT_TIMELINE`; editar cambiando `status` → `STATUS_CHANGE_NOT_ALLOWED`; código siguiente tras M2-007 = M2-008 y slug `m2-008-<zona>`; reúne varios errores a la vez; **reconstruir las 7 fichas de la semilla con `buildProjectSheet` devuelve las mismas entidades** (ida y vuelta).
- `project-code.test.ts`: vacío → `M2-001`; huecos (001, 003) → 004; 999 → `CODE_SPACE_EXHAUSTED`; zona con tildes/ñ/espacios ("El Viñedo" → `el-vinedo`).
- `project-image.test.ts`: MIME no permitido, 5 MB + 1 byte, alt vacío, galería llena (12), reemplazo de `before` devuelve `replaces`.
- `save-project-sheet.test.ts` con escritor falso: `CONFLICT` y `NOT_AUTHORIZED` se propagan; los ids nuevos salen del `IdGenerator`.
- `upload-project-image.test.ts`: valida antes de subir (el escritor no se llama si el dominio falla).
- `team-member.test.ts`: `canManageTeam`.
- **Suite de contrato** por puerto (`*.contract.ts`, una función `describe` parametrizada): corre siempre contra el mock; contra Supabase solo si `SUPABASE_CONTRACT_URL` y `SUPABASE_CONTRACT_ANON_KEY` están definidas (si no, `describe.skip`). Cubre: orden de `list()` por `code`, `findBySlug` inexistente → null, `updatesOf` sin orden garantizado, M2-007 invisible como anon.
- Mapeo fila → dominio (`*-rows.test.ts`): filas de ejemplo (incluido `int8` como number, `date` como string, `highlights` array, shares null) → entidades idénticas a la semilla; fila con dinero decimal o fuera de rango → `DataSourceError`.
- `supabase-seed.test.ts`: `buildSupabaseSeedSql(buildDemoSnapshot(fixedClock(SEED_TODAY)))` `toMatchFileSnapshot("../../supabase/seed.sql")`; el SQL es una transacción (`begin … commit`), borra primero solo `data_origin = 'simulated'`, escapa comillas simples (texto con apóstrofo), no contiene `stalled`, `wheel`, `rueda`, ni `inv_demo`/tenencias.
- `supabase-schema-drift.test.ts` (paquete 1) y `secrets-guard.test.ts` (paquete 5).
- `data-source.test.ts`: sin variable → demo; `supabase` sin URL → `MISSING_SUPABASE_ENV`; valor desconocido → `INVALID_DATA_SOURCE`.
- `container.test.ts`: en demo, `container.dataSource === "demo"` y el flujo guardar ficha → leer marketplace refleja el cambio.
- `seed-consistency.test.ts` y `project-detail-seed.test.ts`: **sin cambios de expectativas**.

### 5.2 E2E (Playwright, modo demo, 390 y 1440)
`admin-subir-inmueble.spec.ts`: `/ingresar` → "Acceso del equipo" → `/admin` → "Subir inmueble" (`data-testid="admin-subir-inmueble"`) → completar `ficha-form-*` (inmueble, economía, rubros que suman F, clase 100 × 100, proceso, 3 riesgos comunes) en estado `funding` → adjuntar imagen `before` con `setInputFiles` (`ficha-imagen-before-input`) → "Guardar" (`ficha-guardar`) → ver `ficha-guardada` con código `M2-008` → `/proyectos` muestra la tarjeta M2-008 y su ficha abre con la imagen; intentar guardar con rubros que no suman F → `ficha-error-budgetLines`. Sin `console.error`, sin "rueda" en la cara pública.
`supabase-smoke.spec.ts` (opcional, `E2E_SUPABASE=1`): login real en `/ingresar/equipo`, `/admin` sin sesión redirige, editar nombre de M2-006 y volver a dejarlo.

### 5.3 Verificación de RLS (orquestador, `execute_sql`, dentro de `begin; … rollback;`)
- `set local role anon;` → `select count(*) from projects` = 6; `… where code = 'M2-007'` = 0; `select count(*) from project_economics` = 6; `select count(*) from properties` = 6; `select count(*) from project_internal_flags` = 0; `select count(*) from team_members` = 0; `insert into projects …` → error 42501; `select public.save_project_sheet('{}', null)` → error de permiso.
- `set local role authenticated; set local request.jwt.claims = '{"sub":"<uuid sin fila en team_members>","role":"authenticated"}';` → mismas lecturas que anon y escrituras rechazadas.
- Con el `sub` del admin creado en el paquete 6 → 7 proyectos visibles, escritura permitida.
- `get_advisors` (security, performance) tras migrar y tras sembrar.

## 6. Riesgos, supuestos y preguntas

### Riesgos
- **R1 · La clave pública + RLS mal escrito = fuga.** Mitigación: RLS en el mismo archivo que la tabla, `get_advisors`, consultas de §5.3 en cada migración nueva, D4 (lo interno en tablas propias).
- **R2 · Bucket público:** cualquiera con la URL ve una imagen, incluso de un proyecto no publicado (M2-007). Los nombres son ids aleatorios y no hay listado, pero no es secreto. Regla de contenido: sin direcciones, placas, rostros ni documentos en las fotos. Si el usuario lo rechaza (S8): bucket privado + URLs firmadas (más latencia y caché de `next/image` más corta).
- **R3 · Deriva de versiones de migración:** el MCP `apply_migration` registra su propio número de versión; los archivos `NNNN_*.sql` son la fuente de verdad y `list_migrations` debe listar los mismos nombres en el mismo orden. Nunca se edita una migración aplicada: se agrega otra.
- **R4 · Fechas congeladas de la semilla (D9):** con el paso de los días las etapas estimadas quedan atrás y la clasificación interna cambia; es comportamiento real, pero la demo pierde "frescura". Regenerar y recargar es un comando + un `execute_sql`.
- **R5 · Conflicto con el trabajo de P4 en curso:** `index.ts`, `ports.ts`, `project-detail-types.ts`, `get-project-detail.ts`, `composition/*` y `GallerySection.tsx` están modificados en la rama. Los paquetes 3–9 no empiezan hasta integrar P4.
- **R6 · `cacheComponents` + proxy:** el proxy corre en Node (Next 16) en cada petición a `/admin/**` y hace una llamada a Supabase (refresco + `is_team_member`). Si añade latencia visible, limitar el `matcher` a `/admin/:path*` (ya previsto) y no comprobar rol en el proxy (RLS basta).
- **R7 · Semilla compartida:** en modo supabase las reservas simuladas no cambian `placed` en la base (no se guardan datos personales); dos dispositivos ven las mismas colocadas aunque uno "reserve". Es lo que pide ADR-014; la UI ya dice que la reserva es simulada.
- **R8 · Dinero en `int8`:** PostgREST lo entrega como número JSON; seguro hasta `MAX_MONEY_CENTS` (9e11 < 2^53) porque el dominio SQL lo limita.
- **R9 · Datos de prueba en la base "real":** los 7 proyectos se marcan `data_origin = 'simulated'`; el borrado es el primer bloque de `seed.sql`.

### Supuestos [PROPUESTO]
- Escrituras desde el navegador bajo RLS (D1), sin service role (D2), `stalled` en tabla interna (D3).
- El estado al **crear** puede ser cualquiera salvo `stalled`/`discarded` con fechas coherentes (para cargar inmuebles ya en curso); al **editar**, el estado solo cambia por transiciones válidas (`changeProjectStatus`), en un control aparte del formulario.
- Las actualizaciones fechadas (B3), la liquidación (B5) y la gestión de usuarios del equipo desde la app quedan **fuera** de este plan: las tablas existen, la UI no.
- Todo proyecto, aunque lo suba el equipo, se sigue presentando como simulado hasta F5 (regla 7); `data_origin` queda para el futuro.

### Preguntas para el usuario (agregar a `docs/08` como bloque S en el paquete 12)
| # | Pregunta | Propuesta por defecto |
|---|---|---|
| S1 | ¿Qué roles tiene el equipo? | `admin` (todo, incluido gestionar el equipo y borrar proyectos) y `editor` (crear/editar proyectos e imágenes). Sin roles por área (G3) hasta que haya más personas |
| S2 | ¿Quién crea las cuentas del equipo y cómo se entra? | Solo tú (admin) invitas desde el panel de Supabase; sin registro abierto; email + contraseña. El orquestador inserta la fila de `team_members` |
| S3 | ¿Necesitas recuperar contraseña desde la app? | No en v1: se reinicia desde el panel de Supabase |
| S4 | ¿Qué campos son obligatorios al subir un inmueble? | **Siempre:** nombre, ciudad, zona (sin dirección exacta, D6), tipo, m², estado, compra C (u oferta en due diligence), venta objetivo P, costos de venta O, presupuesto por rubros que sume F. **Para publicar (colocación en adelante):** además fecha de compra, descripción + 1–5 destacados, proceso de 6 etapas, clase de participación, los 3 riesgos comunes e imagen "antes" y "proyección" |
| S5 | ¿El presupuesto integral F es siempre total × precio de la participación? | Sí (lo cumplen las 7 semillas); se valida al guardar |
| S6 | ¿Se cargan los 7 proyectos de ejemplo en la base real? | Sí, marcados como simulados y borrables de una vez |
| S7 | ¿Las fotos pueden estar en un bucket de lectura pública? | Sí, sin direcciones, placas ni rostros; JPG/PNG/WebP/AVIF ≤ 5 MB; galería ≤ 12 |
| S8 | ¿Un editor puede borrar un proyecto? | No: solo admin y solo si no está publicado |
| S9 | ¿El modo por defecto en Vercel pasa a `supabase` al terminar? | Sí en producción; `demo` en local y en los tests |

## 7. ADR requerido
Sí → `docs/decisiones/ADR-015-persistencia-supabase-y-modulo-team.md` (propuesto): módulo `team`, elemento `proxy` en las reglas de capas, carpeta `supabase/`, escrituras desde el navegador bajo RLS sin Server Actions ni service role, `stalled` en tabla interna, `NEXT_PUBLIC_DATA_SOURCE`. No cambia la tabla de dependencias entre capas existente: la amplía con `team` (base del orden) y `proxy`.
