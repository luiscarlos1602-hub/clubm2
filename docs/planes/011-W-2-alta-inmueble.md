# Plan 011 · W-2 · Alta y edición de inmueble (backoffice, local)

Estado: aprobado (22-nov; W2-1…W2-3 con la propuesta por defecto) · Fecha: 2026-11-22 · Autor: arquitecto · Brief: `docs/planes/brief-W-2.md` · Base: plan 009 §3.1 recortado

## 1. Historia y criterios
Como miembro del equipo quiero dar de alta un inmueble y editar uno existente desde el backoffice, en un asistente por pasos, para que quede guardado en el almacén local y, si está en una etapa publicable, aparezca en `/proyectos` y en su ficha sin tocar código.
- CA1 · `/admin/proyectos` lista todos los proyectos (incluidos internos): código, nombre, zona, etapa; enlaces "Nuevo inmueble" y "Editar".
- CA2 · `/admin/proyectos/nuevo`: asistente inmueble → economía → presupuesto por rubros → participaciones → riesgos/proceso → imágenes → revisar y guardar. Patrón `RegisterWizard` + RHF + Zod.
- CA3 · Obligatorios S4 (siempre / para etapa publicable) · CA4 · F = total × precio (S5) y Σ rubros = F al guardar, error junto al campo.
- CA5 · Un comando `buildProjectSheet` reúne todos los errores; `saveProjectSheet` escribe sobre `createDemoStore`. Ninguna pantalla calcula dinero.
- CA6 · `nextProjectCode` (prefijo de `brand.ts`) y `buildProjectSlug` · CA7 · imágenes elegidas de `public/images/proyectos/`, rótulo "Imagen de referencia".
- CA8 · `/admin/proyectos/[id]/editar` carga (`getProjectSheet`) y guarda; la etapa no cambia (`STATUS_CHANGE_NOT_ALLOWED`).
- CA9 · Sobrevive a recargar; publicable → visible en `/proyectos` y su ficha; el hook invalida TanStack Query.
- CA10 · Suites de contrato de los puertos nuevos, reutilizables en DB-4 · CA11 · E2E crear → recargar → ver en `/proyectos` → editar → persiste (390 y 1440).
- CA12 · Copy en `ui/copy.ts`, `check-copy` limpio, sin ruedas, `PageHeader` + `Section`.
- CA13 [PROPUESTO] · Un inmueble nuevo muestra **sus** imágenes elegidas en la tarjeta de `/proyectos` y en la galería de la ficha (hoy se resuelven por código y `m2-008/` no existe).
- CA14 [PROPUESTO] · Guardar la ficha es atómico en local: si cualquier parte se rechaza, el almacén queda como estaba.

## 2. Módulos afectados
| Módulo | Por qué | Nuevo |
|---|---|---|
| projects | código/slug, `ProjectImage`, puertos de contenido e imágenes, listado admin | no |
| participations | `ProjectListing.images` (tarjeta y ficha) | no |
| finance | comando `buildProjectSheet` (regla 2b: único que ve los tres), casos de uso, asistente UI | no |
| shared/ui | `ProjectImage`/`ProjectGallery` aceptan URL explícita; rutas nuevas en `route-map` | no |
| composition | escritor de ficha demo (atómico) y cableado | no |

## 3. Contratos (firmas; los tipos de dominio existentes no cambian)
**projects/domain**
- `project-code.ts`: `nextProjectCode(existing: readonly ProjectCode[], prefix: string): Result<ProjectCode, DomainError<"INVALID_PROJECT_CODE"|"CODE_SPACE_EXHAUSTED">>` (max+1; ignora códigos de otro prefijo) · `buildProjectSlug(code, zone): Result<string, DomainError<"INVALID_SLUG">>` (`m2-008-los-palos-grandes`, sin tildes, cumple `PROJECT_SLUG_PATTERN`).
- `project-image.ts`: `PROJECT_IMAGE_KINDS = ["before","after","projection"]` (sin `gallery` hasta DB-3) · `ProjectImage = { projectId, kind, url, alt, isReference }` (sin `id`/`position`: uno por tipo; DB-3 los añade) · `referenceImagesFor(code): readonly ProjectImage[]` (las tres SVG por código: respaldo de las semillas) · `resolveProjectImages(code, stored)` (stored si hay; si no, respaldo).
- `CREATABLE_STATUSES = ["opportunity","due_diligence","acquired","funding"]` en `project-status.ts` (**PREGUNTA W2-1**).

**projects/application/ports.ts (se añaden)**
- `ProjectContentWriter { saveProfile(p: PropertyProfile): SaveResult<PropertyProfile>; saveProcess(p: ProjectProcess): SaveResult<ProjectProcess>; saveRisks(r: ProjectRisks): SaveResult<ProjectRisks> }` — upsert por `propertyId`/`projectId`; INVALID_RECORD por esquema; REFERENCE_NOT_FOUND si el inmueble/proyecto no existe.
- `ProjectMediaRepository { imagesOf(projectId): Promise<readonly ProjectImage[]>; referenceLibrary(): Promise<readonly ReferenceImageOption[]> }` con `ReferenceImageOption = { url, kind, label }` (mock: las 21 SVG de `public/images/proyectos/`; DB-3: el bucket).
- `ProjectMediaWriter { replaceImages(projectId, images: readonly ProjectImage[]): SaveResult<readonly ProjectImage[]> }` — reemplaza el juego entero; DUPLICATE si hay dos del mismo `kind`.
- El listado admin reutiliza `useAdminProjects` (proyecto + inmueble): sin caso de uso nuevo.

**finance/domain (`project-sheet.ts` tipos · `build-project-sheet.ts` · `project-sheet-requirements.ts`)**
- `ProjectSheetInput` = 009 §3.1 **sin `revision`**, con: `project: { name; status; acquiredOn: IsoDate | null }` (sale/settled se conservan del existente), `participationClass: { total; unitPrice } | null` (`placed` = existente o 0; se edita en W-6), `images: readonly { kind; url }[]`; resto igual (`property`, `profile`, `processSteps`, `riskKinds`, `economics`, `budgetLines`).
- `ProjectSheet` = 009 §3.1 sin `revision` + `images: readonly ProjectImage[]`.
- `ProjectSheetField` = 009 + `"project.acquiredOn" | "images" | "economics.recoveryBudget"`; `ProjectSheetIssue = DomainError<ProjectSheetErrorCode> & { field }`.
- `ProjectSheetErrorCode` = 009 + `"STATUS_NOT_CREATABLE" | "MISSING_REQUIRED_IMAGES" | "ACQUIRED_IN_FUTURE"` [PROPUESTO] (+ `"CLASS_LOCKED_BY_PLACEMENTS"`, `"SHEET_LOCKED"` si se aceptan W2-2/W2-3).
- `ProjectSheetContext = { existing: ProjectSheet | null; existingCodes; codePrefix; today: IsoDate; ids: { projectId; propertyId; classId }; checkParticipationClass }` (inyectada desde composition: finance no importa valores de participations, D2 plan 006).
- `buildProjectSheet(input, ctx): Result<ProjectSheet, readonly ProjectSheetIssue[]>` — pura, reúne todos los errores; usa `checkProperty`, `checkProjectConsistency`, `checkProjectProcess`, `checkProjectEconomics`, `checkProjectBudget`, `normalizeRiskKinds`, `nextProjectCode`, `buildProjectSlug`, `isPublishedStatus`. Al editar conserva `id`, `code`, `slug` (la URL no cambia si cambia la zona) y `status`.
- Requisitos S4 "para publicar" se exigen cuando `isPublishedStatus(status)`.

**finance/application**
- ports: `ProjectSheetWriter { save(sheet: ProjectSheet): SaveResult<ProjectSheet> }` — todo o nada. Sin `revision`/CONFLICT: en local escribe una sola pestaña y demo-store no versiona filas; DB-4 los añade como cambio aditivo.
- `get-project-sheet.ts`: `GetProjectSheet = (slug: string) => Promise<ProjectSheet | null>` (la ruta `[id]` de B3 ya recibe slug; imágenes vía `resolveProjectImages`, así las semillas se editan con sus SVG).
- `save-project-sheet.ts`: `SaveProjectSheet = (input, slug: string | null) => Promise<Result<ProjectSheet, readonly SaveProjectSheetError[]>>`, `SaveProjectSheetError = ProjectSheetIssue | RepositoryWriteError`; deps `{ getSheet, projects: Pick<ProjectRepository,"list">, writer, ids: IdGenerator, clock, codePrefix, checkParticipationClass }`.

**participations/domain** · `ProjectListing.images: readonly ProjectImage[]` (lo llena `list-marketplace` con `ProjectMediaRepository` + `resolveProjectImages`).
**shared/ui/brand** · `ProjectImage` acepta `src?: string` (por defecto `projectImageSrc`); `ProjectGallery` acepta `images?: Partial<Record<ProjectImageVariant, string>>` y oculta pestañas sin imagen.
**composition** · `project-sheet.demo-writer.ts`: `createDemoProjectSheetWriter(store)` ejecuta los writers de W-1 y los nuevos sobre copias en `memorySlice` y, si todos pasan, un único `store.write` (atómico, CA14; resuelve para este flujo la no-atomicidad anotada en `mejoras.md` [W-1]).

## 4. Paquetes
| # | Agente | Archivos (exclusivos) | Depende | Paralelo | CA |
|---|---|---|---|---|---|
| 1 | dominio-financiero (test primero) | `projects/domain/{project-code,project-image}.ts`+tests, `project-status.ts` (`CREATABLE_STATUSES`), `projects/index.ts`; `finance/domain/{project-sheet,build-project-sheet,project-sheet-requirements}.ts`+tests, `finance/index.ts` | §3 | 2 (tras 1a) | 3,4,5,6,8 |
| 2 | datos-demo | `projects/application/{ports.ts,project-content.contract.ts}`, `projects/infrastructure/{seed.ts (slice `images`, `.default([])`), projects.mock-repository.ts, projects.content-writer.ts, projects.media.ts}`+test de contrato; `participations/domain/marketplace-listing.ts`, `participations/application/list-marketplace.ts`+tests; `composition/modules/{projects,participations}.ts` | 1a | 1 | 7,10,13 |
| 3 | datos-demo | `finance/application/{ports.ts,get-project-sheet.ts,save-project-sheet.ts,project-sheet-writer.contract.ts}`+tests; `composition/{project-sheet.demo-writer.ts,project-sheet.demo-writer.contract.test.ts,modules/finance.ts,container.ts}` | 1, 2 | 4 | 5,9,10,14 |
| 4 | constructor-ui | `shared/ui/brand/{ProjectImage,ProjectGallery}.tsx`+test, `shared/ui/README.md`, `shared/ui/app-shell/route-map.ts`; `participations/ui/components/investor/ProjectCard.tsx`; `finance/ui/components/investor/GallerySection.tsx` | 2 | 3 | 13 |
| 5 | constructor-ui | `projects/ui/components/admin/ProjectsListScreen.tsx`, `projects/ui/copy.ts`, `projects/backoffice-ui.ts`; `finance/ui/components/admin/project-sheet/*` (asistente, un componente por paso, `sheet-form-schema.ts`), `finance/ui/hooks/{use-project-sheet,use-save-project-sheet}.ts`, `finance/ui/copy.ts`, `finance/backoffice-ui.ts`; `app/admin/proyectos/{page,nuevo/page,[id]/editar/page}.tsx`; `tests/e2e/alta-inmueble.spec.ts` | 3, 4 | — | 1,2,3,7,8,9,11,12 |

**1a** = primer commit de P1 con `project-image.ts` y `project-code.ts` (tipos + funciones con tests): desbloquea P2. P1 (resto: ficha) y P2 corren en paralelo; P3 y P4 también (archivos disjuntos). Cada paquete cierra con `verify:fast` + vitest del módulo.

Notas P5: el asistente vive en `finance/ui` (regla 2b). RHF + `zodResolver` solo valida forma (texto, enteros, USD enteros → `usdUnits` en el hook); las reglas de negocio vienen de `buildProjectSheet` (el hook lo llama al pasar de paso para pintar issues por `field`; `saveProjectSheet` al guardar). Montos solo con `MoneyDisplay`; Σ rubros y F esperada salen del hook (dominio), nunca del componente. `useSaveProjectSheet` → `invalidateQueries()` como `use-reset-demo-data.ts`. Nav admin "Proyectos" apunta al listado (rutas nuevas `b7` listado, `b8` nuevo, `b9` editar, definidas en P4). Rótulo de compra = "oferta" en `opportunity`/`due_diligence`. Estas pantallas nacen sin `MockAction` ni `examples.ts`; B1/B3 solo ganan un enlace al listado.

## 5. Pruebas
- Dominio (P1): `nextProjectCode` (vacío → 001, huecos → max+1, otro prefijo ignorado, 999 → `CODE_SPACE_EXHAUSTED`); `buildProjectSlug` (tildes, ñ, espacios dobles, zona vacía); `buildProjectSheet`: alta mínima en `due_diligence` sin perfil/clase/imágenes → ok; `funding` sin fecha/perfil/proceso/clase/riesgos comunes/antes/proyección → **todos** los issues a la vez con su `field`; F ≠ total × precio → `RECOVERY_BUDGET_MISMATCH` en `economics.recoveryBudget`; Σ rubros ≠ F → `BUDGET_TOTAL_MISMATCH` en `budgetLines`; edición con otro status → `STATUS_CHANGE_NOT_ALLOWED`; edición conserva code/slug/placed; `settled`/`stalled` al crear → `STATUS_NOT_CREATABLE`; compra posterior a hoy → `ACQUIRED_IN_FUTURE`; caso canónico ref. 100 × USD 100 = F 10.000.
- Contrato (P2/P3): contenido (upsert, rechazo sin cambios, referencia inexistente), imágenes (reemplazo completo, dos del mismo tipo → DUPLICATE), `ProjectSheetWriter` (alta legible por todos los repos de lectura; código/slug repetido → DUPLICATE y **nada** escrito; edición reemplaza sin duplicar). `seed-consistency.test.ts` sigue verde; snapshot antiguo sin `images` se lee sin reiniciar.
- E2E `alta-inmueble.spec.ts` (reinicia datos al empezar; 390 y 1440): crear en `funding` → `M2-008` en `/admin/proyectos` → recargar → tarjeta con `data-project-code="M2-008"` en `/proyectos` y ficha con su galería → editar nombre → recargar → persiste. Guardar con F ≠ total × precio muestra el error junto al campo. `data-testid`: `admin-proyectos-lista`, `admin-proyectos-nuevo`, `admin-proyecto-editar-<código>`, `ficha-paso-<n>`, `ficha-siguiente`, `ficha-atras`, `ficha-guardar`, `ficha-error-<field>`, `ficha-imagen-<kind>-<n>`.

## 6. Riesgos, supuestos y preguntas
**PREGUNTA AL USUARIO** (registradas en `docs/08` bloque W; se aplica la propuesta por defecto si no hay respuesta antes de P1):
- **W2-1 · ¿En qué etapa se puede crear un inmueble y qué es "publicar"?** Propuesta: crear en `opportunity`, `due_diligence`, `acquired` o `funding` (no exigen obra, venta ni liquidación; coherente con `PROJECT_TRANSITIONS`); "publicar" = guardar en `funding`, la única creable con `isPublishedStatus`, y exige los campos S4 "para publicar". Las demás etapas se alcanzan con W-3.
- **W2-2 · ¿Se cambian total y precio de la clase con participaciones ya colocadas?** Propuesta: no; con `placed > 0` quedan bloqueados (`CLASS_LOCKED_BY_PLACEMENTS`); el resto de la ficha sí se edita.
- **W2-3 · ¿Se edita la economía de un proyecto vendido o liquidado?** Propuesta: no; `sold` y `settled` se abren en solo lectura (`SHEET_LOCKED`): su resultado se fija en W-5.
- Sin pregunta: el proceso de 6 etapas no se precarga (no se inventan plazos); en edición se conservan estado/`started` de cada etapa y solo se editan los días.

**Riesgos**: (a) tamaño: si P5 se alarga, **W-2a** = listado + alta + publicar + E2E crear→aparece cierra el recorrido y **W-2b** = edición (CA8 y la mitad del E2E) pasa a fila nueva. (b) `ProjectListing.images` toca tarjeta y ficha públicas: los tests existentes de P3/P4 deben seguir verdes. (c) Añadir `images` al slice invalidaría snapshots guardados: `.default([])` lo evita. (d) La transición `acquired → funding` de W-3 deberá exigir los requisitos de publicación: anotar en `docs/mejoras.md` [W-2].
**Supuestos**: montos en USD enteros en el formulario; `revision` fuera hasta DB-4; sin borrar (S8); IDs nuevos con `randomIdGenerator`.

## 7. ADR requerido
No. Recorta contratos del plan 009 de forma aditiva (DB-3/DB-4 añaden `id`/`position`/`gallery` en imágenes y `revision`/`CONFLICT`); no rompe `01-arquitectura.md`.
