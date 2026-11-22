# Tablero de estado

> Fuente única del avance. La actualiza el agente principal (skills `ciclo-funcionalidad` §8 y `cerrar-fase`). Cualquier sesión nueva empieza leyendo esto: así se retoma el trabajo sin depender de la memoria de la conversación.
> Estados: `pendiente` · `en curso` · `bloqueado` · `revisión` · `hecho`. Tamaño: S (directo) · M · L (arquitecto + revisores).

**Fase activa:** F2 · Flujo del inversionista (F1 cerrada el 22-nov-2026, tag `f1-fundacion-visual`; F0 cerrada el 22-nov · orden de fases según ADR-007 y `docs/planes/000-hoja-de-ruta.md`). Trabajo de una sola persona: el usuario aprueba planes L, decisiones de producto y merges.

## F0 · Fundamentos
| ID | Descripción | Estado |
|---|---|---|
| F0-1 | Documentación de producto, arquitectura y dominio | hecho |
| F0-2 | Arquitectura agéntica: `.claude/` (agentes, skills, hooks, permisos), plantillas, tablero, `check-copy` (ADR-002) | hecho |
| F0-3 | Respuestas del usuario a supuestos S1–S7 y preguntas 🔴 (ADR-003 a ADR-006) | hecho |
| F0-4 | `.git` inicializado sin commits (el primer commit lo hace F1-1); GitHub y Vercel pasan a F1-6 | hecho |

## F1 · Fundación visual
| ID | Descripción | Depende de | Tam. | Paralelo con | Estado | Plan | Revisión |
|---|---|---|---|---|---|---|---|
| F1-1 | Andamiaje Next + TS strict + Tailwind v4 + shadcn + pnpm; Vitest, Playwright, ESLint de capas, Prettier, lefthook, `verify:fast`/`verify`; primer commit | F0 | M | — | hecho (rama `feat/app-andamiaje`, pendiente merge) | [ADR-008](decisiones/ADR-008-next-16.md) | verify ✅ |
| F1-2 | Design system Club M² + `brand.ts` + `shared/ui/brand` + `legal-copy.ts` + página `/sistema` · **checkpoint visual del usuario** | F1-1 | M | F1-3 | hecho (aprobado por el usuario) | [plan 001](planes/001-F1-2-design-system.md) · capturas `docs/qa/F1/` | ronda 1 corregida |
| F1-3 | `shared/domain` + motor de reparto C1–C6 + propiedades + ruedas K2–K4 (`projects/backoffice.ts`) | F1-1 | L | F1-2 | hecho | [plan 002](planes/002-F1-3-motor.md) | código: 🟠 corregido (lint `module-api`) |
| F1-4 | Composition root + demo-store + reiniciar + 7 semillas `M2-001…007` + `seed-consistency.test.ts` | F1-3 | M | F1-5 | hecho | [plan 003](planes/003-F1-4-datos-simulados.md) | cumplimiento ✅ · código: 🟠 corregido |
| F1-5 | Layouts de 3 zonas + navegación + selector de rol + banner + las 14 rutas navegables | F1-2 | M | F1-4 | hecho | [plan 004](planes/004-F1-5-app-navegable.md) · capturas `docs/qa/F1/app-*` | ronda 1 corregida (3 🟠 copy, 1 🟠 E2E) |
| F1-6 | Repo GitHub privado `clubm2` + Vercel con preview por rama | F1-1 | S | todas | repo GitHub hecho · Vercel pendiente del usuario (movido a F5-1 con motivo: el CLI no está instalado y el usuario eligió cerrar F1 sin desplegar) | https://github.com/luiscarlos1602-hub/clubm2 | |

## F2 · Flujo del inversionista
| ID | Descripción | Depende de | Tam. | Paralelo con | Estado | Plan | Revisión |
|---|---|---|---|---|---|---|---|
| P1 | Landing del club (+ rebrand a la imagen de marca, ADR-009; su lenguaje visual pasa a ser la base de la app, ADR-010) | F1 | M | P2, P3 | hecho (integrado a `main`; copy ajustado con el usuario: titular "Participa…", notas del reparto sin garantía) | ADR-009 · ADR-010 · ADR-011 | verify ✅ · cumplimiento: 2 🔴 + 1 🟠 corregidos · código: 3 🟠 corregidos |
| P2 | Registro y onboarding de riesgos | F1 | M | P1, P3 | pendiente | | |
| P3 | Marketplace | F1 | M | P1, P2 | pendiente | | |
| P4 | Ficha de proyecto + simulador 25/75 (prioridad 1) | P3 | L | — | pendiente | | |
| P5 | Flujo de participación | P4 | M | — | pendiente | | |
| P6 | Mi portafolio (capital · realizado · proyección) | P5 | L | P8 | pendiente | | |
| P8 | Cuenta | F1 | S | todas | pendiente | | |

## F3 · Flujo operativo (backoffice)
| ID | Descripción | Depende de | Tam. | Paralelo con | Estado | Plan | Revisión |
|---|---|---|---|---|---|---|---|
| B2 | Adquisiciones (kanban + due diligence) | F2 | M | B6 | pendiente | | |
| B6 | Inversionistas y CRM (registros de P2) | F2 | M | B2 | pendiente | | |
| B3 | Proyectos y obras (avance publicado → P4) | B2 | L | — | pendiente | | |
| B4 | Comercialización | B3 | M | — | pendiente | | |
| B5 | Finanzas y liquidación → P6 | B4 | L | — | pendiente | | |
| B1 | Dashboard KPIs (ruedas solo aquí) | B5 | M | — | pendiente | | |

## F4 · Club y pulido
| ID | Descripción | Depende de | Tam. | Paralelo con | Estado | Plan | Revisión |
|---|---|---|---|---|---|---|---|
| P7 | El club (eventos, academia, membresías como vitrina) | F3 | M | F4-2 | pendiente | | |
| F4-2 | Fotografía, microinteracciones, auditoría AA, Lighthouse ≥ 90, SEO/OG | F3 | M | P7 | pendiente | | |

## F5 · Lanzamiento
| ID | Descripción | Depende de | Tam. | Paralelo con | Estado | Plan | Revisión |
|---|---|---|---|---|---|---|---|
| F5-1 | Dominio `clubm2.com` + Vercel producción | F4 | S | F5-2 | pendiente | | |
| F5-2 | Recorrido de 5 min (`docs/09-guion-demo.md`) | F4 | S | F5-1 | pendiente | | |
| F5-3 | Decisión M-009: leads reales (Supabase + aviso de privacidad) | F4 | M | — | pendiente | | |

Orden de valor si hay que recortar una fase: P4 > P6 > B5 > B3 > resto.
