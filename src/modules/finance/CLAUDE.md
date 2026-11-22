# modules/finance

Motor único de reparto 25/75 (docs/02, skill `motor-reparto`). Ninguna pantalla calcula dinero.

- API pública: `index.ts` (motor, liquidación, % de ganancia, y desde P4 presupuesto, simulador, presets, escenarios, reserva y ficha). Sin UI: la UI va por `ui.ts` / `backoffice-ui.ts` (ADR-012).
- Invariantes: fondo + empresa = excedente al centavo; residuo de redondeo a la empresa (K1); `basis` rotula proyección vs realizado.
- Tests canónicos `C1…C11` y propiedades I1–I16 (fast-check): no los cambies sin ADR. El simulador los repite en `simulate-projection.canonical.test.ts`.
- Redondeo solo vía `shared/domain/money.ts`; sin `Date`, `Math.random` ni React en `domain/`; sin aritmética con `.cents` fuera del motor.
- Trampa: las funciones de `Money` lanzan `RangeError` ante precondiciones violadas; valida antes (`validateDistributionInput`, `checkProjectBudget`).
- Pérdida (ADR-019): excedente < 0 → `LossDistribution` espejo 25/75 con tope en el aporte; borde W5-1 (b) aislado en `capReturnToProceeds` (`proceedsShortfall`). Excedente 0 = `distributed` en 0. La pérdida se rotula aparte (`loss`, `capitalReturned`); su % es `calculateRecoveryRate`. La venta real es `ProjectSale` (`checkProjectSale`) y entra a liquidar solo por `buildRealizedInput`.
- Puertos en `application/ports.ts`; `infrastructure/` (semillas y repos mock) no importa otros módulos: `composition/demo-snapshot.ts` le pasa el contexto.

## Ficha P4 (plan `docs/planes/006-P4-ficha-simulador.md`)

- La ficha se arma en `buildProjectDetail` (modos D5: open · fixed_projection · realized); `getProjectDetail` solo lee repos.
- Único cálculo del simulador: `simulateProjection` (normaliza → `calculateDistribution` → `calculateHolderPayout`). Escenarios, reserva y tenencias lo reutilizan.
- D2: `domain/` y `application/` importan de `@/modules/participations` **solo con `import type`**; `HOLDING_LIMITS.max` llega inyectado (`holdingMax`) desde composition. `finance/ui` sí puede importar valores de participations.
- D7: solo `ui/hooks` llama funciones del dominio; los componentes reciben datos calculados. `money-in-ui.test.ts` lo vigila.
- Supuestos: Q1 bolsa 2.500 · 1.500 · 1.000 · Q2 el retraso solo alarga el plazo · Q3 conservador venta −10 % y obra +20 %, optimista venta +5 % · P5-1 la reserva se suma a lo colocado (tope: total) · P4-12 `heldUsed = min(held, placed)`.
- P4-4 NO aplicado (decisión del usuario 22-nov): el sobrecosto se aplica a todo F; Q5 sigue abierta. Sin presets de sobrecosto de obra.
