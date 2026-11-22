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
- [F1-5] Índice para `/admin/proyectos`; mover el copy de pantallas a `modules/<m>/ui/copy.ts` en F2/F3; quitar el destello de `Suspense` en la navegación cuando haya `generateStaticParams` con semillas.
- [F1-4] Lint: prohibir en `src/modules/*/infrastructure/**` importar `@/modules/<otro>` (alinear con `01 §4`).
- [F1-4] Skill `datos-semilla`: subir la clave `club-demo:vN` cuando cambie la forma del snapshot o una cifra sembrada.
- [F2] Mapeo público estado → etapa visible (`stalled` → "en venta", L5) en `projects/index.ts`, con test.
- [F1-5] Hallazgos E2E: con `cacheComponents` la página anterior queda un instante oculta en el DOM tras navegar; usar `:visible` en testids globales. Cabecera de admin a 1440 px: wordmark centrado en contenedor de 1280 px, no alineado al aside. NavLinks: el CTA no tiene estado activo visual.
- [F1-4 · cumplimiento] Semillas: M2-002 `city: "Caracas"` con zona El Hatillo (mostrar "Caracas · El Hatillo" o ajustar); M2-003 y M2-006 tienen nombre ("Bello Campo", "El Rosal") distinto de la zona `Chacao` y comparten `slugZone` — alinear nombre y zona en la ficha; M2-003 liquida un excedente alto (34,5 por participación en ~4 meses): valorar bajar `salePrice`; la UI pública no debe mostrar "días sin vender" de M2-002; `demo-copy.warning` debe decir que los cambios viven solo en este navegador; excepción documentada: reinicio de la demo puede usar `destructive`.
- [F1-4 · código] Deep-freeze del snapshot en `createDemoStore`; `parseDemoSnapshot` podría recalcular liquidaciones con `createSettlement`; `seed-consistency.test.ts` lee archivos con ruta relativa al cwd (usar `import.meta.url`); `docs/02 §3` pendiente de ProjectEconomics.
