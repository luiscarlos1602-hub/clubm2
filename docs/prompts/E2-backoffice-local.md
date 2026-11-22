# Prompt de arranque — Etapa 2 · Backoffice operable en local

Prompt reutilizable: **una sesión nueva por fila** (W-1, W-2, W-3, W-5, W-4, W-6, en ese orden). Pega esto como primer mensaje; la sesión toma la siguiente fila pendiente del tablero. Una sola sesión abierta sobre la carpeta.

---

Lee `docs/estado.md` y `docs/planes/010-revision-y-plan-de-ejecucion.md` §"Etapa 2". Construye **solo la siguiente fila W pendiente** del tablero (orden W-1 → W-2 → W-3 → W-5 → W-4 → W-6) y detente al terminarla. No relances auditorías: el diagnóstico de qué es maqueta y qué reutilizar ya está en el plan 010.

## Cómo trabajar (ADR-016, proceso aligerado)

- Rama `feat/<modulo>-<desc>` desde `main`; un commit por paquete y merge al cerrar la fila.
- Filas **M** (W-1, W-3, W-4): hazlas directo, sin subagentes ni plan aparte; escribe en el chat un esquema de 10–15 líneas antes de empezar.
- Filas **L** (W-2, W-5, W-6): skill `ciclo-funcionalidad <ID>` con plan de máximo 150 líneas en `docs/planes/`, que apruebo antes de construir.
- Un solo revisor al final (`revisor-codigo`; `revisor-cumplimiento` solo si hay copy nuevo), máximo una ronda de corrección.
- Tests: `pnpm vitest run <módulo>` al cerrar cada paquete; `pnpm verify` y `pnpm build` una sola vez, al cerrar la fila.

## Patrón técnico (igual en todas las filas)

Todo se guarda en el almacén local: `createDemoStore` (`src/shared/infrastructure/demo-store.ts`) ya tiene `update`/`write` sin usar. Nada de Supabase, ni dependencias nuevas, ni server actions.

1. Puerto de escritura en `src/modules/<m>/application/ports.ts`.
2. Caso de uso en `application/` que valida con el dominio existente y devuelve `Result`.
3. Método en `infrastructure/*.mock-repository.ts` que escribe en el snapshot (validado con los esquemas de `zod-schemas.ts`).
4. **Suite de contrato** del repositorio, escrita contra el puerto y no contra el mock: la reutilizarán los adaptadores Supabase en la Etapa 3.
5. Hook de mutación en `ui/hooks/` que invalida TanStack Query (plantilla: `use-reset-demo-data.ts`).
6. En la pantalla, sustituir `MockAction` y los literales de `examples.ts` por el caso de uso. Borra el literal que deje de usarse.

Reglas que no cambian: dinero en centavos (`Money`), porcentajes en puntos básicos, ninguna pantalla calcula dinero, dominio puro, textos en `ui/copy.ts` y `node scripts/check-copy.mjs` antes de entregar, ruedas solo en backoffice, lenguaje visual de `PageHeader` + `Section`.

## Qué reutilizar por fila

| Fila | Ya existe y se debe usar |
|---|---|
| W-1 | `checkProjectConsistency`, `checkProjectBudget`, `checkParticipationClass`, esquemas de slice en `zod-schemas.ts`, tests de mock y `seed-consistency.test.ts` como base del contrato |
| W-2 | Contratos `buildProjectSheet` de `docs/planes/009-supabase.md` §3; campos obligatorios según S4 (`docs/08`); patrón por pasos de `RegisterWizard`; React Hook Form + Zod ya instalados. Imágenes: elegir entre las ilustraciones de `public/images/proyectos/` (la subida real llega en DB-3) |
| W-3 | `changeProjectStatus`, `PROJECT_TRANSITIONS`; pantallas `AcquisitionsBoard` y `OpportunityDetailScreen` |
| W-5 | `createSettlement`, `calculateDistribution`, `calculateHolderPayout`; pantallas `CommercializationScreen` y `SettlementPanel`. Incluye la política de pérdidas de ADR-019 (ver Límites) |
| W-4 | `ProjectBudget`, `ProjectUpdate`, `ProjectBudgetPanel.tsx` (huérfano); pantalla `ProjectWorksSections` |
| W-6 | `estimateReservation`, `HOLDING_LIMITS`, `createGetHoldingProjections`, `participationRepository.listByHolder`; mover la orquestación de `use-admin-projects.ts` a un caso de uso |

## Límites

- **Pérdidas (ADR-019):** W-5 implementa el espejo 25/75 con tope en el aporte, test primero y con el agente `dominio-financiero` y la skill `motor-reparto`: elimina `LOSS_POLICY_UNDEFINED`, actualiza `docs/02-modelo-de-dominio.md` y el copy que dice "por definir". Confírmame antes el punto 4 del ADR (sin prelación de cobro). Ningún texto visible puede decir "bajo riesgo".
- **Sin datos personales en servidor (ADR-014):** las reservas y visitas de W-6 viven solo en el navegador del inversionista.
- Si una fila destapa una decisión de producto que no está en `docs/08`, pregúntame antes de seguir y regístrala ahí.
- Si una fila resulta más grande de lo previsto, entrega la parte que cierra un recorrido completo y deja el resto como fila nueva en el tablero; no la estires.
- Pídeme aprobación antes de cada merge a `main` y de cualquier `git push`.

## Hecho cuando

- Lo que el usuario crea o cambia en pantalla **sobrevive a recargar la página** y se refleja en el otro lado (por ejemplo: un inmueble publicado en W-2 aparece en `/proyectos`). Compruébalo en el navegador y adjunta captura.
- Suite de contrato y tests del módulo en verde; `pnpm verify` y `pnpm build` en verde.
- Un E2E que cubra el recorrido de la fila. En la última fila (W-6) añade `tests/e2e/ciclo-completo.spec.ts`: crear inmueble → avanzar etapas → vender → liquidar → ver el resultado en ficha y portafolio tras recargar, en 390 y 1440 px.
- `docs/estado.md` actualizado: fila hecha con su commit y cuál es la siguiente.

Termina con un resumen corto: qué funciona ahora, qué quedó fuera y qué espera mi aprobación. No empieces la fila siguiente.

## Notas vigentes (verificación del 22-nov tras W-3)

Estado comprobado en `main` (`a9f95cd`): W-1, W-2 y W-3 hechas; siguiente fila **W-5** (L). El E2E intermitente y las capturas de P3 que ensuciaban el árbol quedaron resueltos en W-3.

1. **W-5 toca el motor de pérdidas (ADR-019).** Antes de escribir código, confírmame el punto 4 del ADR (sin prelación de cobro). `src/modules/finance/CLAUDE.md` aún dice que en pérdida no hay reparto (`LOSS_POLICY_UNDEFINED`): se corrige en el mismo cambio.
2. **Rama ya integrada sin borrar:** `feat/projects-cambio-etapa`. Bórrala con mi aprobación.
3. Al cerrar la fila, pregúntame si hago `git push` de `main`.
