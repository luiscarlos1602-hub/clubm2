# Backlog de mejoras y deuda

> Lo alimentan las revisiones (hallazgos 🟡) y las retros de fase. Prioridad: P1 alta · P2 media · P3 baja.

| ID | Fecha | Origen | Descripción | Prioridad | Estado |
|---|---|---|---|---|---|
| M-001 | 2026-11-22 | F0 | Definir política de pérdidas y orden de cobro (maestro §6) para reemplazar "por definir" | P1 | abierto |
| M-002 | 2026-11-22 | F0 | Nombre comercial e identidad definitiva | P2 | cerrado (ADR-003 · ADR-005) |
| M-003 | 2026-11-22 | ADR-002 | Escribir `architecture.modules.mjs` y generar desde él las reglas de `eslint-plugin-boundaries` (F1-3) | P1 | abierto |
| M-004 | 2026-11-22 | ADR-002 | Reglas de lint de `01 §8.1` (domain puro, dinero solo en motor) con mensajes que citen el doc | P1 | abierto |
| M-005 | 2026-11-22 | ADR-002 | Pre-commit con lefthook → `pnpm verify:fast` | P2 | abierto |
| M-006 | 2026-11-22 | Revisión | Bordes de ruedas y redondeo sin definir (preguntas K1–K4) | P1 | cerrado (02 §4–§5) |
| M-007 | 2026-11-22 | Revisión | Identidad de la demo vs `marketing/` (pregunta K5) | P2 | cerrado (ADR-005) |
| M-008 | 2026-11-22 | ADR-003 | Comprar `clubm2.com` (+ `metroametroclub.com` defensivo), revisar `.com.ve`, handles `@clubm2` y registro de marca mixta en SAPI (36 y 41) | P1 | abierto (usuario) |
| M-009 | 2026-11-22 | ADR-006 | Decidir si el registro (P2) guarda leads reales desde la v1 → adaptador Supabase + aviso de privacidad | P2 | abierto |

- [M-001 · 22-nov · F1-1] `eslint-plugin-boundaries` imprime un aviso en stderr por el descriptor `module-api` (patrón de archivo). Migrar a `boundaries/files` cuando se verifique la API. `scaffold-tmp/` (residuo del scaffold, ignorado en git) debe borrarlo el usuario.
- [F1-3] Regla de lint: prohibir `Math.floor/ceil/round/trunc` en `src/modules/**` fuera de `shared/domain/money.ts`.
- [F1-3] L7 sin responder: instalar `@vitest/coverage-v8` para exigir 100 % de cobertura del motor (CA10 del plan 002).
- [F1-3] `module-api` usa `mode: "file"` (obsoleto, solo imprime aviso). Migrar a `boundaries/files` cuando se verifique la API; dejar prueba de regresión del lint.
- [F1-2] `MoneyLike` → `Money` de `shared/domain` ahora que F1-3 existe. Ampliar la regla de dinero a identificadores `cents` sueltos. Modo oscuro (P3).
- [F1-2] Cumplimiento: regla para `docs/06` — `destructive` solo para acciones irreversibles; tarjeta con cupos lleva aviso de riesgo cercano.
