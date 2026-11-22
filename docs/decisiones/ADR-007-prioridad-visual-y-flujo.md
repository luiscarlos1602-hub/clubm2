# ADR-007 · Prioridad: lo visual y el flujo del negocio primero

Estado: **aceptado** (decisión del usuario, 22-nov-2026)
Fecha: 2026-11-22

## Contexto
El orden de fases de F0 separaba "cara pública" (F2), "miembro" (F3) y "backoffice" (F4). El usuario pide arrancar en Claude Code con **todo lo visual y el flujo del negocio** primero.

## Decisión
Nueva secuencia de fases (`docs/planes/000-hoja-de-ruta.md`):
1. **F1 · Fundación visual**: andamiaje, design system Club M² visible en `/sistema`, motor de reparto (lo exige el simulador: ninguna pantalla calcula dinero), semillas y app navegable con las 14 pantallas.
2. **F2 · Flujo del inversionista**: P1 → P2 → P3 → P4 → P5 → P6 + P8.
3. **F3 · Flujo operativo**: B2 → B3 → B4 → B5 (liquidación que se refleja en P6) + B6 + B1.
4. **F4 · Club y pulido**: P7, fotografía, microinteracciones, auditoría AA, rendimiento, SEO.
5. **F5 · Lanzamiento**: dominio, Vercel producción, decisión de leads reales (M-009), analítica.

Lo que se pospone a propósito: integraciones reales (Supabase, auth, KYC, correos, analítica, IA) hasta F5 o posterior.

## Consecuencias
- Cada fase termina con un recorrido **visible** desplegado en Vercel (preview por rama, producción desde `main`).
- La arquitectura de capas, el motor único y los guardarraíles no se relajan: "visual primero" no significa "lógica en la pantalla".
- Sustituye la tabla de fases de `04-workflow.md §1` (actualizada en el mismo cambio).
