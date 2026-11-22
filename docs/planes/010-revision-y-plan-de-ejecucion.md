# Club M² — Revisión completa y plan de ejecución

## Contexto

La sesión anterior no avanza y gasta tokens. La auditoría (docs, arquitectura, flujos) encontró por qué y qué falta:

**Por qué se atasca**

1. **P4 (ficha + simulador) está casi terminado pero sin commitear**: 110 entradas en `git status` en `feat/finance-ficha-interconectada`, cero commits propios. El tablero (`docs/estado.md`) lo marca "pendiente", así que cada sesión se reorienta desde cero.
2. **Dos frentes mezclados en el mismo árbol**: P4 + Supabase (ADR-014 en staging, ADR-015 y `docs/planes/009-supabase.md` sin rastrear) + `netlify.toml`. El plan 009 exige integrar P4 antes; P4 no se integra. Círculo.
3. **Hook caro**: `.claude/hooks/post-edicion.sh` corre `vitest run` del módulo completo en cada edición y bloquea (`exit 2`) en estados intermedios de un refactor.
4. **Proceso pesado**: 8–12 subagentes por funcionalidad, planes de 778 líneas (006) con contradicciones internas.
5. **Docs desfasados**: `CLAUDE.md` "Estado actual", `estado.md`, ADR-007, hoja de ruta, `00-vision` §4 no reflejan ADR-012…015.

**Estado real del producto**

- ✅ Sólido: motor 25/75, simulador, máquina de estados (`changeProjectStatus`), puertos de lectura, marketplace, ficha, ~453 tests unitarios, 13 specs E2E.
- 🟡 Maqueta: todo el backoffice (B1–B6 con `MockAction` y `examples.ts`), login/registro (solo cambian un rol en `localStorage`), reserva, portafolio, cuenta, visitas, CRM.
- ❌ Inexistente: **cualquier escritura** (cero puertos/casos de uso de mutación), alta/edición de inmueble, subida de imágenes, cierre de venta con precio real, creación de liquidaciones, base de datos, sesión, protección de `/admin`, CI, `.env.example`.

**Decisiones tomadas hoy (22-nov-2026)**

- Escrituras: **local primero (demo-store), luego Supabase** detrás de los mismos puertos.
- Login real: **solo equipo**; inversionista sigue en demostración, sin datos personales en servidor (ADR-014 se mantiene).
- Despliegue: **Netlify**.
- Proceso: **aligerar**.

## Paso previo (lo haces tú)

Detén la otra sesión antes de empezar: comparte carpeta con esta y dos sesiones escribiendo en el mismo árbol ya causó problemas (retro F1).

## Etapa 0 — Estabilizar (1 sesión, sin subagentes)

Objetivo: árbol limpio, tablero veraz. Nada nuevo se construye hasta cerrar esto.

1. `pnpm verify` + `pnpm build` sobre el árbol actual (nadie ha verificado que el refactor P4 compile). Corregir solo lo que falle.
2. Commits separados en la rama actual:
   - `feat(finance): ficha interconectada con el motor (P4)` — src, tests, `docs/planes/006*`, `brief-P4.md`.
   - Revertir las capturas regeneradas `docs/qa/P3/*.png` (ruido).
3. Rama aparte `docs/supabase-plan`: ADR-014, ADR-015, plan 009, cambios de `docs/08`. Rama aparte `chore/netlify`: `netlify.toml`, `.gitignore`.
4. Una sola pasada de `revisor-codigo` sobre el diff de P4 (cumplimiento ya lo cubre `check-copy`). Merge a `main` con tu aprobación.
5. Borrar las 6 ramas viejas ya integradas.

## Etapa 1 — Poner la casa en orden (docs y proceso, 1 sesión)

1. **ADR-016 · Proceso aligerado** (skill `registrar-decision`), y aplicar:
   - `.claude/hooks/post-edicion.sh`: quitar `vitest` del hook; dejar prettier + eslint. Tests se corren al cerrar cada paquete.
   - `.claude/skills/ciclo-funcionalidad/SKILL.md` y `docs/04-workflow.md`: subagentes solo para tamaño L; un revisor por cambio (`revisor-cumplimiento` solo si hay copy nuevo); planes ≤ 150 líneas; verificación completa una vez por funcionalidad, no por integración.
2. **ADR-017 · Despliegue en Netlify**: corregir Vercel→Netlify en `00-vision` §6, `estado.md` (F1-6, F5-1), hoja de ruta, plan 009.
3. **ADR-018 · Escrituras locales antes de Supabase** (reordena la hoja de ruta): marcar ADR-007 como modificado por ADR-014/018; actualizar `docs/planes/000-hoja-de-ruta.md` y `00-vision` §4.
4. `docs/estado.md`: P4 hecho; filas nuevas W-1…W-6 y DB-1…DB-4 (abajo); limpiar F1-1. `CLAUDE.md` §Estado actual. Cerrar M-003/004/005 en `docs/mejoras.md`.
5. Recortar `006-P4` a un resumen de lo entregado (el detalle ya está en el código).
6. Añadir S1–S9 del plan 009 a `docs/08` y responderlas contigo en una sola tanda, junto con Q5, Q6 y la política de pérdidas (O1/M-001), que bloquean liquidar con resultado negativo.

## Etapa 2 — Backoffice operable en local (W-1…W-6)

Todo sobre `createDemoStore` (`src/shared/infrastructure/demo-store.ts`), que ya tiene `update`/`write` sin usar. Patrón único para cada fila: puerto de escritura en `application/ports.ts` → caso de uso → método en `*.mock-repository.ts` → hook de mutación que invalida TanStack Query (plantilla: `use-reset-demo-data.ts`) → sustituir `MockAction`/`examples.ts` en la pantalla. Cada fila incluye una **suite de contrato** del repositorio, que luego deben pasar los adaptadores Supabase.

| ID      | Qué                                                                                                                                                                                                                                                                       | Reutiliza                                                                                                                                                                     | Pantallas                                                      |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| **W-1** | Puertos de escritura + contrato base (`save` proyecto/inmueble/economía/presupuesto/clase)                                                                                                                                                                                | `checkProjectConsistency`, `checkProjectBudget`, `checkParticipationClass`, esquemas de `zod-schemas.ts`                                                                      | —                                                              |
| **W-2** | **Alta y edición de inmueble**: `/admin/proyectos` (listado), `/nuevo`, `/[id]/editar`. Asistente por pasos: inmueble → economía → presupuesto por rubros → participaciones → riesgos/proceso → imágenes → publicar                                                       | Contratos `buildProjectSheet` del plan 009 §3; patrón `RegisterWizard`; RHF + Zod ya instalados. Imágenes: elegir ilustración existente en local (subida real llega con DB-3) | nuevas                                                         |
| **W-3** | **Cambio de etapa real** y oportunidades como entidades (estados `opportunity`/`due_diligence`)                                                                                                                                                                           | `changeProjectStatus`, `PROJECT_TRANSITIONS`                                                                                                                                  | B2 `AcquisitionsBoard`, `OpportunityDetailScreen`              |
| **W-4** | **Obra**: registrar gasto por rubro y publicar avances                                                                                                                                                                                                                    | `ProjectBudget`, `ProjectUpdate`, `ProjectBudgetPanel.tsx` (huérfano)                                                                                                         | B3 `ProjectWorksSections`                                      |
| **W-5** | **Venta y liquidación**: capturar precio y costos reales → `sold` → "Liquidar" crea `Settlement` → `settled`; vista por titular                                                                                                                                           | `createSettlement`, `calculateDistribution`, `calculateHolderPayout`                                                                                                          | B4 `CommercializationScreen`, B5 `SettlementPanel`             |
| **W-6** | **Reserva → portafolio** (solo en el navegador del inversionista): crea `Participation` `pending_confirmation`, bandeja de confirmación del equipo, descuenta cupos; panel/portafolio leen `listByHolder` y eliminan `EXAMPLE_HOLDINGS`/`EXAMPLE_TOTALS`/`PLACED_BY_CODE` | `estimateReservation`, `HOLDING_LIMITS`, `createGetHoldingProjections`                                                                                                        | `ProjectParticipate`, `PanelScreen`, `PortfolioScreen`, B1, B3 |

Orden: W-1 → W-2 → W-3 → W-5 → W-4 → W-6. Tras W-5 ya existe el recorrido completo captación → liquidación con un inmueble creado a mano. Mover la orquestación de `use-admin-projects.ts` a un caso de uso de aplicación al tocar B1.

Puerta de salida: un E2E nuevo `ciclo-completo.spec.ts` que crea un inmueble, lo avanza hasta liquidar y comprueba que la ficha pública y el portafolio lo reflejan tras recargar.

## Etapa 3 — Supabase y login del equipo (DB-1…DB-4)

Base: `docs/planes/009-supabase.md` + ADR-015, recortado a lo que la Etapa 2 dejó definido. Requiere antes: aprobar ADR-015 y responder S1–S9.

| ID       | Qué                                                                                                                                                                                                                                               |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **DB-1** | Dependencias (`@supabase/supabase-js`, `@supabase/ssr`), `.env.example`, `NEXT_PUBLIC_DATA_SOURCE=demo\|supabase`, `supabase/migrations/` con el esquema (dinero `bigint` en centavos, porcentajes en pb), `seed.sql` generado desde las semillas |
| **DB-2** | **Login del equipo**: módulo `team` (`TeamAuthGateway`), tabla `team_members` (admin/editor), `/ingresar/equipo`, `src/proxy.ts` que protege `/admin/**`, registro abierto desactivado, recuperación de clave                                     |
| **DB-3** | RLS (lectura pública sin ruedas ni proyectos internos; escritura solo equipo) + pruebas de políticas como `anon`/`authenticated`; bucket `project-images` y subida real en el formulario de W-2; `get_advisors` limpio                            |
| **DB-4** | Adaptadores `*.supabase-repository.ts` que pasan la suite de contrato de la Etapa 2; selección en `src/composition/modules/*.ts`; RPC atómica `save_project_sheet`                                                                                |

El inversionista (registro, reservas, visitas) permanece en modo local: ADR-014 sigue vigente.

## Etapa 4 — Despliegue y cierre

- Netlify con variables de entorno; CI mínimo en GitHub Actions (`verify:fast` + vitest).
- P2 (onboarding), P6/P8 restantes, correos, contratos y pago quedan después, y los de datos personales esperan aviso de privacidad y revisión legal (ADR-013, M-009).

## Reglas de ejecución para no volver a atascarse

- Una rama y un commit por fila del tablero; nunca dos frentes en el mismo árbol.
- Una sola sesión escribiendo en la carpeta.
- Cada sesión termina actualizando `docs/estado.md`.
- Decisiones tuyas se piden en tanda al inicio de cada etapa, no a mitad.

## Verificación

- Etapa 0: `pnpm verify` y `pnpm build` en verde; `git status` limpio; `main` contiene P4.
- Etapa 1: `docs/estado.md` y `CLAUDE.md` coinciden con `git log`; una edición en `modules/finance` ya no dispara vitest.
- Etapa 2: por fila, `pnpm vitest run <módulo>` + suite de contrato; al final `ciclo-completo.spec.ts` en 390 y 1440 px, y comprobación manual en el navegador de que lo creado sobrevive a recargar.
- Etapa 3: misma suite de contrato contra Supabase; `/admin` redirige sin sesión; consultas como `anon` no devuelven ruedas ni proyectos internos; `ciclo-completo.spec.ts` con `NEXT_PUBLIC_DATA_SOURCE=supabase`.
