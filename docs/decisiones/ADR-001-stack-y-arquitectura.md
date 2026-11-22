# ADR-001 · Stack y arquitectura de la demo

Estado: **aceptado** (usuario, 22-nov-2026)
Fecha: 2026-11-22

## Contexto
Demo de hackathon completa (público + backoffice) con datos simulados, que debe poder evolucionar a producto real sin reescribirse. El documento maestro deja el stack "pendiente de decisión" (§12, §17).

## Opciones consideradas
1. Next.js + TypeScript + Tailwind + shadcn/ui, sin backend, repositorios mock tras puertos.
2. Igual que 1 pero con Supabase desde el día uno.
3. Vite + React SPA.

## Decisión
Opción 1, con monolito modular por dominios y capas domain / application / infrastructure / ui (ver `docs/01-arquitectura.md`). Reglas de capas verificadas con `eslint-plugin-boundaries`.

## Consecuencias
- Cero costo y cero dependencias externas para la demo.
- Los datos viven en el navegador de cada visitante (no se comparten entre dispositivos).
- Pasar a Supabase = nuevos adaptadores en `infrastructure/` + una línea en `composition/container.ts`.
