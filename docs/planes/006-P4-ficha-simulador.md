# Plan 006 · P4 · Ficha, simulador y reserva interconectados con el motor — resumen de lo entregado

Estado: **entregado** e integrado a `main` en `4b72ce3` (Etapa 0 del plan 010, 22-nov-2026) · Revisión: `revisor-codigo` ✅; hallazgos menores en `docs/mejoras.md` (`8926689`).
Fuentes: [brief-P4](brief-P4.md) · ADR-004, ADR-010–ADR-013. Este archivo era un plan de 778 líneas; se recortó en la Etapa 1 (ADR-016: planes ≤ 150 líneas). El detalle vive en el código y los tests; la versión completa está en el historial de git (`git show 4b72ce3:docs/planes/006-P4-ficha-simulador.md`).

## Qué se entregó
La UI de la ficha **no cambió de aspecto ni de `data-testid`**. Cambió el origen de los datos y dónde vive la lógica: de los hooks y `examples.ts` de la maqueta al dominio, los puertos y las semillas.

- **`projects/domain`**: `project-slug` (`isProjectSlug`), `property-profile` (descripción y destacados), `process` (6 etapas en días tras la compra), `project-update`, `project-risk` (sin niveles ni puntuaciones). Caso de uso `getProjectProcess`.
- **`finance/domain`**: `budget` (rubros de obra + bolsa), `simulator` (`simulateProjection`, que llama a `calculateDistribution` y `calculateHolderPayout`), `stress-presets`, `scenarios` (derivados con el motor, no sembrados), `holding-projection`, `project-detail` (`buildProjectDetail`). Casos de uso `getProjectDetail` y `getHoldingProjections`.
- **`finance/ui/hooks`**: `use-project-detail`, `use-simulator`, `use-reservation-estimate`, `use-process-stages`. Solo los hooks llaman al dominio; los componentes reciben datos calculados.
- **Datos**: snapshot `club-demo:v2` (perfiles, proceso, actualizaciones, riesgos y presupuestos tipados); la clave `club-demo:v1` se borra al crear el container (reinicio, sin migración). Fechas relativas al `Clock`.
- **Rutas**: `/proyectos/<slug>` y `/participar` sin `generateStaticParams`; `notFound()` solo con formato de slug inválido; un slug válido sin proyecto (p. ej. M2-007) muestra `ficha-no-encontrada`. La lista de publicables sale de `listMarketplace`.
- Se borraron `finance/ui/.../investor/examples.ts`, `simulate.ts`, `scenarios.ts`, `project-figures.ts`, `process-stages.ts` y `PUBLISHED_PROJECT_SLUGS`.

## Modos de la ficha
| Fase pública | Modo | Simulador | Escenarios | Resultado realizado |
|---|---|---|---|---|
| `open` | `open` | sí | sí | — |
| `placement_complete`, `renovation`, `on_sale`, `sold` | `fixed_projection` | no | sí | — |
| `finished` con liquidación | `realized` | no | no | sí (`calculateHolderPayout(dist, 1)`) |

Un `finished` sin liquidación es dato incoherente → `MISSING_SETTLEMENT` → `ficha-error`.

## Decisiones vigentes
- **Presets de estrés**: base, venta −20 %, retraso 3/6/9 meses y colocación 0 %. Los de sobrecosto de obra (`works-20`, `works-50`) se quitaron por decisión del usuario.
- **Sobrecosto (Q5)**: se aplica a todo el presupuesto integral F (`recoveryBudget`), no solo a la obra. El supuesto P4-4 del borrador **no se aplicó**; el usuario confirmó mantenerlo así el 22-nov (`docs/08`).
- **Costos de venta (Q6)**: fijos al valor estimado O.
- Supuestos aceptados al aprobar: Q1 (bolsa 2.500 · 1.500 · 1.000, rotulada como ejemplo), Q2 (el retraso solo alarga el plazo), Q3 (conservador venta −10 % y obra +20 %; optimista venta +5 %), P5-1 (la reserva se suma a lo colocado, con el total como tope).
- P4-11: "colocación 0 %" = 0 colocadas (C3), sin cobro externo. P4-12: si `held` > colocadas, se usa el mínimo y se muestra el aviso. P4-13: M2-007 tiene presupuesto (para B2) pero no perfil, proceso, actualizaciones ni riesgos.
- La ficha vive en `finance` (combina projects, participations y finance); `finance/domain` y `application` importan de `participations` solo tipos; `HOLDING_LIMITS.max` llega inyectado desde `composition`.
- Ninguna rueda ni `stalled` en tipos, claves ni texto de la ficha (ADR-004).

## Pruebas que lo sostienen
- `simulate-projection.canonical.test.ts` (C1, C3, C5, C6 de docs/02 §4) y `simulate-projection.properties.test.ts` (externos + empresa = excedente, al centavo).
- `stress-presets`, `scenarios`, `holding-projection`, `project-detail`, `budget`, `get-project-detail`, `get-holding-projections`.
- Guardia `src/modules/finance/money-in-ui.test.ts`: la UI de finance no importa valores de `money` ni opera con `.cents`.
- E2E `ficha.spec.ts` y `reiniciar-datos.spec.ts` (v2) en 390 y 1440 px.

## Quedó para después (en `docs/mejoras.md`)
- Lint de dinero: acotar el `ignores` de `modules/finance/**`; `admin/SettlementPanel.tsx` y `admin/FinanceScreen.tsx` operan con `.cents` (se corrige en W-5).
- Alias de compatibilidad (`loadProjectDetail`, `projectHolding`, `ProjectDetailData`, `ProjectProcessBoardProps`) y la prop `acquiredOn` sin uso (W-4/W-6).
- 404 real para slugs válidos sin proyecto cuando haya backend (Etapa 3).
- Campos `source`/`responsible`/`evidence` de `ProjectUpdate` cuando B3 publique avances (W-4).
- `examples.ts` que siguen en `investors/ui/.../{panel,admin}`, `projects/ui/.../admin` y `finance/ui/.../admin`: los sustituyen las filas W.
