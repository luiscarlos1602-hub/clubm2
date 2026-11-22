---
name: verificar
description: Definición de Hecho ejecutable. Corre typecheck, lint de capas, check-copy, tests unitarios y E2E en orden y resume resultados reales. Úsala antes de entregar cualquier cambio (modo rápido) y al cerrar funcionalidad o fase (modo completo).
---

# Verificar

## Modo rápido (cada cambio)
1. `pnpm tsc --noEmit`
2. `pnpm lint` — incluye `eslint-plugin-boundaries` y las reglas de `docs/01 §8`
3. `node scripts/check-copy.mjs <archivos o módulos tocados>`
4. `pnpm vitest run <rutas tocadas>`

`pnpm verify:fast` = 1 + 2 + 3 (desde F1).

## Modo completo (cierre de funcionalidad o fase)
Lo anterior +
5. `pnpm vitest run` (todo, incluido `seed-consistency.test.ts`)
6. `pnpm playwright test --trace off`

`pnpm verify` = 1–6.

## Reglas
- Detente en el primer paso que falle; corrige y reejecuta solo ese paso, luego continúa.
- Reporta la salida real (n.º de errores / tests pasados / fallidos), nunca "debería pasar".
- Si el mismo paso falla 3 veces seguidas, detente y replantea el diseño (`ESTADO: BLOQUEADO`).
- Antes de F1 (sin `package.json`) solo aplica el paso 3.

## Formato del resumen
```
verificar (rápido|completo) · <rama>
tsc ✅ 0 errores · lint ✅ · copy ✅ 0/0 · vitest ✅ 48/48 · e2e ⏭️
```
