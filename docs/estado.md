# Tablero de estado

> Fuente única del avance junto con el plan vigente [`planes/010`](planes/010-revision-y-plan-de-ejecucion.md). La actualiza el agente principal (skills `ciclo-funcionalidad` §8 y `cerrar-fase`). Cualquier sesión nueva empieza leyendo esto: así se retoma el trabajo sin depender de la memoria de la conversación.
> Estados: `pendiente` · `en curso` · `bloqueado` · `revisión` · `hecho`. Tamaño (ADR-016): S y M los hace el agente principal directo · L con arquitecto y subagentes. Un revisor por cambio. Una rama y un commit por fila; toda sesión termina actualizando este tablero.

**Etapa activa:** Etapa 2 · Backoffice operable en local → W-1, W-2 y W-3 hechas → **siguiente fila: W-5** (L) (plan 010; orden W-1 → W-2 → W-3 → W-5 → W-4 → W-6). Etapas 0 y 1 hechas el 22-nov-2026. F1 cerrada (tag `f1-fundacion-visual`); de F2 están hechos P1, P3, P4, V-1 y V-2. El orden por etapas (ADR-018, `docs/planes/000-hoja-de-ruta.md` §Orden vigente) manda sobre el orden de fases F2–F5. Trabajo de una sola persona: el usuario aprueba planes L, decisiones de producto y merges.

## F0 · Fundamentos
| ID | Descripción | Estado |
|---|---|---|
| F0-1 | Documentación de producto, arquitectura y dominio | hecho |
| F0-2 | Arquitectura agéntica: `.claude/` (agentes, skills, hooks, permisos), plantillas, tablero, `check-copy` (ADR-002) | hecho |
| F0-3 | Respuestas del usuario a supuestos S1–S7 y preguntas 🔴 (ADR-003 a ADR-006) | hecho |
| F0-4 | `.git` inicializado sin commits (el primer commit lo hace F1-1); GitHub y hosting pasan a F1-6 | hecho |

## F1 · Fundación visual
| ID | Descripción | Depende de | Tam. | Paralelo con | Estado | Plan | Revisión |
|---|---|---|---|---|---|---|---|
| F1-1 | Andamiaje Next + TS strict + Tailwind v4 + shadcn + pnpm; Vitest, Playwright, ESLint de capas, Prettier, lefthook, `verify:fast`/`verify`; primer commit | F0 | M | — | hecho (`a62b216`, en `main`) | [ADR-008](decisiones/ADR-008-next-16.md) | verify ✅ |
| F1-2 | Design system Club M² + `brand.ts` + `shared/ui/brand` + `legal-copy.ts` + página `/sistema` · **checkpoint visual del usuario** | F1-1 | M | F1-3 | hecho (aprobado por el usuario) | [plan 001](planes/001-F1-2-design-system.md) · capturas `docs/qa/F1/` | ronda 1 corregida |
| F1-3 | `shared/domain` + motor de reparto C1–C6 + propiedades + ruedas K2–K4 (`projects/backoffice.ts`) | F1-1 | L | F1-2 | hecho | [plan 002](planes/002-F1-3-motor.md) | código: 🟠 corregido (lint `module-api`) |
| F1-4 | Composition root + demo-store + reiniciar + 7 semillas `M2-001…007` + `seed-consistency.test.ts` | F1-3 | M | F1-5 | hecho | [plan 003](planes/003-F1-4-datos-simulados.md) | cumplimiento ✅ · código: 🟠 corregido |
| F1-5 | Layouts de 3 zonas + navegación + selector de rol + banner + las 14 rutas navegables | F1-2 | M | F1-4 | hecho | [plan 004](planes/004-F1-5-app-navegable.md) · capturas `docs/qa/F1/app-*` | ronda 1 corregida (3 🟠 copy, 1 🟠 E2E) |
| F1-6 | Repo GitHub privado `clubm2` + hosting con preview por rama | F1-1 | S | todas | repo GitHub hecho · despliegue movido a F5-1 (el usuario cerró F1 sin desplegar); el hosting pasa a Netlify (ADR-017, `netlify.toml` en `main`) | https://github.com/luiscarlos1602-hub/clubm2 | |

## F2 · Flujo del inversionista
| ID | Descripción | Depende de | Tam. | Paralelo con | Estado | Plan | Revisión |
|---|---|---|---|---|---|---|---|
| V-1 | **Maqueta visual completa** (ADR-012): ingresar, panel, fichas + simulador, participar, portafolio, cuenta, club, registro y backoffice B1–B6, con datos de ejemplo; se interconecta después fila por fila | P3 | L | — | hecho (`66d7ad7`; maqueta; la interconexión sigue por las filas W) | [plan 007](planes/007-maqueta-visual.md) · ADR-012 · capturas `docs/qa/maqueta/` | cumplimiento 2 🟠 (acceso: el usuario eligió aspecto real) · código 3 🟠 corregidos · E2E 97 ✅ |
| V-2 | **Ajustes de producto sobre la maqueta** (ADR-013): % junto a toda ganancia (motor), imágenes antes/después/proyección, simulador solo en abiertos, tablero de proceso, términos y condiciones, reserva abierta con asesor, agendar visita, backoffice con menú plegable, detalle y gráficas | V-1 | L | — | hecho (`f1761bc`) | [plan 008](planes/008-ajustes-maqueta.md) · ADR-013 | cumplimiento ✅ · código 2 🟠 corregidos |
| P1 | Landing del club (+ rebrand a la imagen de marca, ADR-009; su lenguaje visual pasa a ser la base de la app, ADR-010) | F1 | M | P2, P3 | hecho (`3179534`; copy ajustado con el usuario: titular "Participa…", notas del reparto sin garantía) | ADR-009 · ADR-010 · ADR-011 | verify ✅ · cumplimiento: 2 🔴 + 1 🟠 corregidos · código: 3 🟠 corregidos |
| P2 | Registro y onboarding de riesgos | F1 | M | P1, P3 | pendiente (Etapa 4) | | |
| P3 | Marketplace | F1 | M | P1, P2 | hecho (`6381c58`) | [plan 005](planes/005-P3-marketplace.md) · capturas `docs/qa/P3/` | código ✅ · cumplimiento ✅ (0 🔴/🟠) · E2E 93 ✅ |
| P4 | Ficha de proyecto + simulador 25/75 (prioridad 1), interconectada con el motor | P3 | L | — | hecho (`4b72ce3`, Etapa 0) | [plan 006](planes/006-P4-ficha-simulador.md) (resumen) · [brief](planes/brief-P4.md) | verify ✅ · build ✅ · código ✅ (menores en `mejoras.md`, `8926689`) |
| P5 | Flujo de participación (la reserva real entra en W-6) | P4 | M | — | pendiente (Etapa 4) | | |
| P6 | Mi portafolio (capital · realizado · proyección; lectura real en W-6) | P5 | L | P8 | pendiente (Etapa 4) | | |
| P8 | Cuenta | F1 | S | todas | pendiente (Etapa 4) | | |

## Etapa 2 · Backoffice operable en local (ADR-018 · plan 010)
Patrón por fila: puerto de escritura en `application/ports.ts` → caso de uso → método en `*.mock-repository.ts` (sobre `createDemoStore`) → hook de mutación que invalida TanStack Query → sustituir `MockAction`/`examples.ts`. Cada fila trae su **suite de contrato** del repositorio.

| ID | Descripción | Depende de | Tam. | Paralelo con | Estado | Plan | Revisión |
|---|---|---|---|---|---|---|---|
| W-1 | Puertos de escritura + suite de contrato base (`save` de proyecto, inmueble, economía, presupuesto, clase) | P4 | M | — | hecho (`53a8ab2`, en `main`) | sin plan aparte (fila M) · contratos en `modules/*/application/*.contract.ts` · deuda en `mejoras.md` [W-1] | código: 1 🟠 + 6 🟡 corregidos en 1 ronda · verify ✅ (1 E2E intermitente bajo carga, pasa aislado) · build ✅ |
| W-2 | Alta y edición de inmueble: `/admin/proyectos`, `/nuevo`, `/[id]/editar`; asistente por pasos (inmueble → economía → presupuesto → participaciones → riesgos/proceso → imágenes existentes → publicar). Campos obligatorios según S4 | W-1 | L | — | hecho (`c1da86d`, en `main`) | [plan 011](planes/011-W-2-alta-inmueble.md) · [brief](planes/brief-W-2.md) · deuda en `mejoras.md` [W-2] | código 2 🟠 + cumplimiento 1 🟠 corregidos en 1 ronda · verify: vitest 825 ✅, E2E 147 ✅ + 3 intermitentes por tiempo bajo carga (pasan aislados) · build ✅ · navegador: M2-008 sobrevive a recargar y aparece en `/proyectos` |
| W-3 | Cambio de etapa real (`changeProjectStatus`) y oportunidades como entidades (`opportunity`/`due_diligence`) en B2 | W-2 | M | — | hecho (rama `feat/projects-cambio-etapa`, `67cf405`; merge pendiente de aprobación) | sin plan aparte (fila M) · `changeProjectStage` + `PublishGuard` (finance, cierra [W-2 · para W-3]) · B2 por etapas reales, B3 sección Etapa · sin columna "Oferta" (S4) · deuda en `mejoras.md` [W-3] | código 4 🟡 + cumplimiento 3 🟡; corregidos en 1 ronda (anuncio y foco en B2, tipado, copy "simulados") · verify: vitest 858 ✅, E2E 154 ✅ sin intermitentes · build ✅ · navegador: compra de M2-007 y venta de M2-005 sobreviven a recargar |
| W-3b | Registro del avance por ítem del checklist de due diligence (G1) en B2: entidad, puerto, contrato y mock | W-3 | S | W-5 | pendiente (fuera de alcance de W-3) | `mejoras.md` [W-3] | |
| W-5 | Venta y liquidación: precio y costos reales → `sold` → "Liquidar" crea `Settlement` → `settled`; vista por titular. Incluye liquidar con pérdida según ADR-019 (espejo 25/75 con tope en el aporte): cambia el motor, `docs/02` y el copy "por definir" | W-3 | L | — | pendiente | | |
| W-4 | Obra: gasto por rubro y avances publicados (B3; `ProjectBudgetPanel.tsx` huérfano) | W-5 | M | — | pendiente | | |
| W-6 | Reserva → portafolio en el navegador del inversionista: `Participation` `pending_confirmation`, bandeja del equipo, cupos; panel/portafolio leen `listByHolder` y eliminan `EXAMPLE_*`/`PLACED_BY_CODE` | W-4 | L | — | pendiente | | |

**Puerta Etapa 2:** `ciclo-completo.spec.ts` (crear inmueble → liquidar → ficha y portafolio lo reflejan tras recargar) en 390 y 1440 px.

## Etapa 3 · Supabase y login del equipo (ADR-014 · ADR-015 · plan 009)
| ID | Descripción | Depende de | Tam. | Paralelo con | Estado | Plan | Revisión |
|---|---|---|---|---|---|---|---|
| DB-1 | `@supabase/supabase-js` + `@supabase/ssr`, `.env.example`, `docs/01` y `eslint.config.mjs` según ADR-015 (`team`, `proxy`, `supabase/`), `NEXT_PUBLIC_DATA_SOURCE=demo\|supabase`, `supabase/migrations/` (dinero `bigint` en centavos, % en pb), `seed.sql` desde las semillas (S6) | Etapa 2 | M | — | pendiente | [plan 009](planes/009-supabase.md) | |
| DB-2 | Login del equipo: módulo `team`, `team_members` (admin/editor, S1), `/ingresar/equipo`, `src/proxy.ts` protege `/admin/**`, registro abierto desactivado (S2). Sin recuperación de clave en la app en v1 (S3) | DB-1 | M | — | pendiente | | |
| DB-3 | RLS (lectura pública sin ruedas ni internos; escritura solo equipo) + pruebas como `anon`/`authenticated`; bucket público `project-images` (S7) y subida real en W-2; `get_advisors` limpio | DB-2 | L | — | pendiente | | |
| DB-4 | Adaptadores `*.supabase-repository.ts` que pasan la suite de contrato; selección en `composition/`; RPC `save_project_sheet` | DB-3 | L | — | pendiente | | |

**Puerta Etapa 3:** suite de contrato contra Supabase · `/admin` redirige sin sesión · `anon` no ve ruedas ni proyectos internos · `ciclo-completo.spec.ts` con `NEXT_PUBLIC_DATA_SOURCE=supabase`.

## Etapa 4 · Despliegue y cierre
| ID | Descripción | Depende de | Tam. | Paralelo con | Estado | Plan | Revisión |
|---|---|---|---|---|---|---|---|
| F5-1 | Netlify producción (ADR-017; `supabase` en producción, `demo` en local y tests: S9) + CI mínimo en GitHub Actions (`verify:fast` + vitest); dominio `clubm2.com` | DB-4 | S | — | pendiente | | |
| F5-3 | Decisión M-009: leads, reservas y visitas reales en Supabase (requiere aviso de privacidad y revisión legal, ADR-013/014) | F5-1 | M | — | pendiente (bloqueado por revisión legal) | | |

Después: P2, P5, P6, P8, B1 (resto), B6, F4 y F5-2.

## F3 · Flujo operativo (backoffice)
| ID | Descripción | Depende de | Tam. | Paralelo con | Estado | Plan | Revisión |
|---|---|---|---|---|---|---|---|
| B2 | Adquisiciones (kanban + due diligence) | F2 | M | B6 | absorbida por **W-3** | | |
| B6 | Inversionistas y CRM (registros de P2) | P2 | M | B2 | pendiente (Etapa 4; datos personales esperan M-009) | | |
| B3 | Proyectos y obras (avance publicado → P4) | B2 | L | — | absorbida por **W-2** y **W-4** | | |
| B4 | Comercialización | B3 | M | — | absorbida por **W-5** | | |
| B5 | Finanzas y liquidación → P6 | B4 | L | — | absorbida por **W-5** | | |
| B1 | Dashboard KPIs (ruedas solo aquí) | B5 | M | — | parcial en **W-6** (orquestación de `use-admin-projects.ts` a un caso de uso); resto en Etapa 4 | | |

## F4 · Club y pulido
| ID | Descripción | Depende de | Tam. | Paralelo con | Estado | Plan | Revisión |
|---|---|---|---|---|---|---|---|
| P7 | El club (eventos, academia, membresías como vitrina) | F3 | M | F4-2 | pendiente | | |
| F4-2 | Fotografía, microinteracciones, auditoría AA, Lighthouse ≥ 90, SEO/OG | F3 | M | P7 | pendiente | | |

## F5 · Lanzamiento
| ID | Descripción | Depende de | Tam. | Paralelo con | Estado | Plan | Revisión |
|---|---|---|---|---|---|---|---|
| F5-2 | Recorrido de 5 min (`docs/09-guion-demo.md`) | F4 | S | — | pendiente | | |

F5-1 y F5-3 se movieron a la Etapa 4 (plan 010).

Orden de valor si hay que recortar: W-2 > W-5 > W-6 (P6) > W-4 > resto. (P4 ya está hecho.)
