# Plan 000 · Hoja de ruta Club M² (visual y flujo de negocio primero)

Estado: aprobado · Fecha: 2026-11-22 · ADR-007

## Principio
Cada fase entrega un **recorrido de negocio completo y visible** (desplegado en Netlify, ADR-017) antes de profundizar. La lógica sigue en el motor y en los módulos; lo visual se construye sobre datos semilla coherentes desde el primer día.

## El flujo de negocio que la app tiene que contar
```
INVERSIONISTA (F2)                                   OPERACIÓN (F3)
Landing → Registro gratis → Onboarding de riesgos     Oportunidad → Due diligence → Compra (capital propio)
   → Marketplace → Ficha M2-00X + simulador 25/75        → Presupuesto integral → Publicar en el club
   → Participar (reserva simulada)                        → Colocación de participaciones
   → Portafolio: capital · realizado · proyección  ◄──── → Obra (avances publicados) → Venta
                                                         → Liquidación con el motor → reparto 25/75
```
El "momento wow": una acción del backoffice (avance de obra, liquidación) aparece al instante en la ficha y el portafolio del inversionista.

## F1 · Fundación visual
| ID | Entrega | Agente(s) | Depende | Paralelo |
|---|---|---|---|---|
| F1-1 | Andamiaje: Next (última estable) + TS strict + Tailwind v4 + shadcn/ui + pnpm · Vitest · Playwright · ESLint (boundaries desde `architecture.modules.mjs` + reglas `01 §8.1` básicas) · Prettier · lefthook · scripts `verify:fast` / `verify` (incluye `check-copy`) | principal | — | — |
| F1-2 | Design system Club M² (ADR-003, ADR-005): tokens cal y arcilla en `@theme`, Fraunces/Inter/Plex Mono con `next/font`, `brand.ts`, primitivas shadcn tematizadas, `shared/ui/brand` (MoneyDisplay, ProjectionLabel, StatusBadge, DemoBanner, ProjectSeal `M2-001`, SectionHeading, EmptyState, Skeletons), `legal-copy.ts`, catálogo `shared/ui/README.md` y página `/sistema` | constructor-ui | F1-1 | F1-3 |
| F1-3 | `shared/domain` (Money, Percentage, Result, Id, Clock) + motor de reparto C1–C6 + tests de propiedades + ruedas K2–K4 por `projects/backoffice.ts` | dominio-financiero | F1-1 | F1-2 |
| F1-4 | Composition root + demo-store (`club-demo:v1`) + reiniciar datos + 7 proyectos semilla `M2-001…M2-007` (Caracas: Chacao, Los Palos Grandes, El Hatillo, El Paraíso; Valencia) + `seed-consistency.test.ts` | datos-demo | F1-3 | F1-5 (layouts) |
| F1-5 | Layouts de 3 zonas (público, inversionista, admin) responsive, navegación, selector de rol, banner de simulación y **las 14 rutas creadas** con encabezado, estado vacío de marca y enlace al flujo siguiente → app navegable de punta a punta | constructor-ui | F1-2 (+F1-4 para datos) | — |
| F1-6 | Repo GitHub privado `clubm2` + hosting con preview por rama (Netlify, ADR-017; despliegue movido a F5-1) | principal | F1-1 | — |

**Puerta F1:** `pnpm verify` verde · C1–C6 + propiedades verdes · `/sistema` aprobado por el usuario (capturas 390/1440) · las 14 rutas navegables · URL pública (movida a F5-1).

## F2 · Flujo del inversionista
P1 Landing · P2 Registro + onboarding · P3 Marketplace · P4 Ficha + simulador (L, prioridad 1) · P5 Participar · P6 Portafolio (L) · P8 Cuenta (S).
Paralelo: P1 ∥ P2 ∥ P3 → P4 → P5 → P6; P8 en cualquier momento.
**Puerta F2:** E2E recorrido inversionista en 390/1440 · cumplimiento sin 🔴 · ninguna rueda visible · deploy preview en Netlify.

## F3 · Flujo operativo (backoffice)
B2 Adquisiciones ∥ B6 CRM → B3 Obras (publicar avance → ficha P4) → B4 Comercialización → B5 Finanzas y liquidación (→ P6) → B1 Dashboard (ruedas solo aquí).
**Puerta F3:** E2E admin con el "momento wow" (avance de obra y liquidación reflejados en la cara del inversionista).

## F4 · Club y pulido
P7 El club · fotografía documental (Unsplash con créditos) · microinteracciones · auditoría AA · Lighthouse ≥ 90 en móvil · SEO y Open Graph con la marca.

## F5 · Lanzamiento
Dominio `clubm2.com` · Netlify producción (ADR-017) · recorrido de 5 minutos (`docs/09-guion-demo.md`) · decisión M-009 (leads reales con Supabase) · analítica.

## Lo que NO se hace hasta F5 o después
Auth real, KYC, pagos, correos reales, Supabase, analítica de producto, IA en vivo.
