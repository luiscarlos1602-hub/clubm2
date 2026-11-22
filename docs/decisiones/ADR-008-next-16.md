# ADR-008 · Next.js 16 como versión base (actualiza el stack de ADR-001)
Estado: aceptado (instrucción del usuario en `docs/prompts/F1-fundacion-visual.md`: "última versión estable")
Fecha: 2026-11-22

## Contexto
`docs/01 §1` y ADR-001 fijan "Next.js 15". Al hacer el andamiaje (F1-1) la última versión estable es Next.js 16.4.6 (React 19.3, Tailwind 4.3, TypeScript 5.9). El prompt de F1 pide la última estable y un ADR si difiere.

## Opciones consideradas
1. Next.js 15 (según ADR-001): versión anterior, sin ventajas para el proyecto.
2. Next.js 16 (última estable): mismo App Router y modelo de capas; ADR-001 no cambia en lo esencial.

## Decisión
Se usa **Next.js 16.4.6** con App Router, `src/`, TypeScript `strict` y Tailwind v4. El resto de ADR-001 (arquitectura modular, capas, pnpm, shadcn/ui) sigue vigente. `docs/01 §1` se actualiza en el mismo cambio. El `AGENTS.md` generado por Next se conserva: indica leer `node_modules/next/dist/docs/` antes de usar APIs de Next, porque esta versión cambió convenciones.

## Consecuencias
- Los agentes deben consultar la documentación incluida en `node_modules/next/dist/docs/` ante dudas de API.
- `shadcn` se configura con alias propios (`@/shared/ui/primitives`, `@/shared/lib/utils`) para respetar `docs/01 §3`.
