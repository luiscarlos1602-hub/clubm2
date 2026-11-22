# Plan 012 · W-5 · Venta y liquidación (backoffice, local) + pérdidas ADR-019

Estado: aprobado por el usuario el 22-nov (W5-1 = b; W5-2/W5-3 aceptadas) · Fecha: 2026-11-22 · Autor: arquitecto · Brief: `docs/planes/brief-W-5.md` (CA1–CA11, sin cambios)

## 1. Historia y criterios
Historia y CA1–CA11 del brief, sin cambios. Añadidos:
- CA12 [PROPUESTO] · Venta: `signedOn` ≤ hoy (`Clock`) y ≥ última fecha del timeline; `O ≤ P`; `P > 0`. Una venta por proyecto; en W-5 no se puede corregir.
- CA13 [PROPUESTO] · `settledOn` = hoy del `Clock`. C y F salen de `ProjectEconomics` (el gasto real llega en W-4); `total/placed/unitPrice` salen de la `ParticipationClass` al liquidar.

## 2. Módulos afectados
| Módulo | Por qué | Nuevo |
|---|---|---|
| finance | motor de pérdidas, `ProjectSale`, casos de uso venta/liquidación, B5, ficha realizada, copy | `project-sale.ts`, `settlement-input.ts`, 2 casos de uso, contrato, 2 hooks, `SaleRegistration` |
| projects | B4 pierde el `MockAction` "cerrar venta"; texto de `STAGE_RESERVED_FOR_SETTLEMENT` | — |
| composition | escritor atómico venta/liquidación (2 slices), registro, semilla | `sale-settlement.demo-writer.ts` |
| club | copy `club/ui/copy.ts:66` | — |

Regla 2b: los comandos viven en **finance** (a la derecha de projects) y usan del `index.ts` de projects `changeProjectStatus` + `checkProjectConsistency`. `createChangeProjectStage` (W-3) **no se reutiliza** para `→ sold/settled`: escribe solo el slice de projects y no sería atómico con la venta/liquidación; sigue devolviendo `STAGE_RESERVED_FOR_SETTLEMENT`.

## 3. Contratos (TypeScript)
```ts
// finance/domain/distribution.ts — Distribution ("distributed") sin cambios salvo: surplus ≥ 0 (excedente 0 = todo en 0, CA2).
export type LossDistribution = {
  readonly kind: "loss"; readonly basis: ValueBasis;
  readonly participations: ParticipationTerms & { readonly retained: number };
  readonly surplus: Money;              // < 0 (P − C − F − O)
  readonly loss: Money;                 // L = −surplus > 0
  readonly investorsLossPool: Money;    // floor(25 % × L) — a favor del inversionista
  readonly lossPerParticipation: Money; // min(floor(pool / total), unitPrice) — y borde W5-1
  readonly roundingResidue: Money;      // pool − floor(pool/total) × total → empresa (análogo K1)
  readonly capExcess: Money;            // (floor(pool/total) − lossPerParticipation) × total → empresa
  readonly proceedsShortfall: Money;    // borde W5-1; 0 salvo ese caso
  readonly externalLoss: Money;         // lossPerParticipation × placed
  readonly companyLoss: Money;          // L − externalLoss
  readonly returnPerParticipation: Money; // unitPrice − lossPerParticipation (≥ 0)
  readonly capital: CapitalReturn;      // lo APORTADO (mismo sentido que en ganancia)
  readonly returned: { readonly external: Money; readonly company: Money }; // external + company = P − O
};
export type DistributionOutcome = Distribution | LossDistribution; // se eliminan NoDistribution y lossPolicy
// calculateDistribution: misma firma. surplus < 0 → LossDistribution; ≥ 0 → Distribution.

// finance/domain/holder-payout.ts
export type HolderPayout = { basis; held;
  readonly result: "gain" | "break_even" | "loss";
  readonly capital: Money;          // aportado = held × unitPrice
  readonly loss: Money;             // held × lossPerParticipation (0 si no hay pérdida)
  readonly capitalReturned: Money;  // capital − loss
  readonly gain: Money;             // held × perParticipation (0 en pérdida; nunca negativo)
  readonly total: Money };          // capitalReturned + gain (≥ 0)
export type HolderPayoutErrorCode = "HELD_OUT_OF_RANGE"; // se elimina LOSS_POLICY_UNDEFINED

// finance/domain/settlement.ts
Settlement.distribution: DistributionOutcome; SettlementErrorCode = DistributionInputErrorCode;

// finance/domain/simulator.ts — se elimina "no_distribution"
SimulationOutcome = | { kind: "payout"; distribution: Distribution; payout: HolderPayout }
  | { kind: "loss"; distribution: LossDistribution; payout: HolderPayout }
  | { kind: "no_placement"; distribution: DistributionOutcome } | { kind: "invalid" };
// projectHoldingGain: sin cambio (null fuera de "payout"); el portafolio con pérdida es de W-6.

// finance/domain/profit-rate.ts — calculateProfitRate sin cambio; nuevo:
calculateRecoveryRate(capitalReturned: Money, capital: Money): Result<Percentage, DomainError<"CAPITAL_NOT_POSITIVE">> // floor

// finance/domain/project-sale.ts (nuevo)
export type ProjectSale = { readonly projectId: ProjectId; readonly salePrice: Money; readonly saleCosts: Money; readonly signedOn: IsoDate };
export type ProjectSaleErrorCode = "NON_POSITIVE_SALE_PRICE" | "NEGATIVE_AMOUNT" | "AMOUNT_TOO_LARGE" | "SALE_COSTS_EXCEED_PRICE" | "SALE_DATE_IN_FUTURE";
checkProjectSale(sale: ProjectSale, today: IsoDate): Result<ProjectSale, DomainError<ProjectSaleErrorCode>>;
// finance/domain/settlement-input.ts (nuevo): única forma de armar la entrada realizada (la usan liquidar y la vista previa de B5)
buildRealizedInput(a: { sale: ProjectSale; economics: ProjectEconomics; terms: ParticipationTerms }): RealizedDistributionInput;

// finance/application/ports.ts (nuevos)
interface ProjectSaleRepository { list(): Promise<readonly ProjectSale[]>; findByProject(id: ProjectId): Promise<ProjectSale | null> }
/** Atómico: guarda la venta y el proyecto ya en `sold`. DUPLICATE si ya hay venta; REFERENCE_NOT_FOUND si no existe el proyecto; INVALID_RECORD por esquema. Si rechaza, nada cambia. */
interface ProjectSaleWriter { record(a: { project: Project; sale: ProjectSale }): SaveResult<ProjectSale> }
/** Atómico: guarda la liquidación y el proyecto en `settled`. DUPLICATE si ya hay liquidación; REFERENCE_NOT_FOUND sin venta; INVALID_RECORD. */
interface SettlementWriter { settle(a: { project: Project; settlement: Settlement }): SaveResult<Settlement> }

// finance/application/record-project-sale.ts
RecordProjectSale = (i: { projectId; salePrice: Money; saleCosts: Money; signedOn: IsoDate }) => Promise<Result<ProjectSale, DomainError<
  "PROJECT_NOT_FOUND" | ProjectSaleErrorCode | "INVALID_TRANSITION" | "DATE_OUT_OF_ORDER" | "INCONSISTENT_TIMELINE" | RepositoryWriteErrorCode>>>;
// deps: projects (findById), sales: ProjectSaleWriter, clock. Origen válido: on_sale | stalled (PROJECT_TRANSITIONS).
// finance/application/settle-project.ts
SettleProject = (projectId: ProjectId) => Promise<Result<Settlement, DomainError<
  "PROJECT_NOT_FOUND" | "NOT_SOLD" | "ALREADY_SETTLED" | "SALE_NOT_FOUND" | "ECONOMICS_NOT_FOUND" | "CLASS_NOT_FOUND"
  | DistributionInputErrorCode | "INVALID_TRANSITION" | "DATE_OUT_OF_ORDER" | "INCONSISTENT_TIMELINE" | RepositoryWriteErrorCode>>>;
// deps: projects, sales (repo), settlements (repo + writer), economics, classes (import type de participations, D2), clock, ids.
```
**Dónde vive la venta (punto 3):** entidad `ProjectSale` en el slice `finance.sales` (no en `ProjectEconomics`, que es proyección; no en `Settlement`, que no existe hasta liquidar). La fecha queda también en `timeline.saleSignedOn`. La semilla crea `ProjectSale` para los 2 liquidados (P y O de `REALIZED`) y `seed-consistency` comprueba que coincide con `settlement.input`. Esquema: `sales` con `.default([])` para no invalidar snapshots `club-demo:v2` guardados (sin subir versión). **Ficha:** sin cambios en `buildProjectDetail`: al liquidar la fase pasa a `finished` → modo `realized` → `calculateHolderPayout(distribution, 1)`, que ya funciona con pérdida; `RealizedResult` ramifica por `result`. En `sold` la ficha sigue en `fixed_projection` (igual que hoy).

## 4. Paquetes
| # | Agente | Archivos (exclusivos) | Depende de | Paralelo con | CA |
|---|---|---|---|---|---|
| 1 | dominio-financiero (skill `motor-reparto`, test primero) | `finance/domain/{distribution,holder-payout,settlement,simulator,profit-rate,project-sale,settlement-input}.ts` y sus `*.test.ts`, `distribution.{canonical,properties}.test.ts`, `simulate-projection.{canonical,properties}.test.ts`, `scenarios.test.ts`, `holding-projection.test.ts`, `project-detail.test.ts`, `finance/index.ts`, `finance/CLAUDE.md`, `docs/02` §1 y §4, `.claude/skills/motor-reparto/SKILL.md` | §3 y W5-1 | 2 tras commit 1a | CA1–CA4 |
| 2 | datos-demo | `finance/application/{ports,record-project-sale,settle-project}.ts` (+tests), `finance/application/sale-settlement-writer.contract.ts`, `finance/infrastructure/{seed,finance.mock-repository,finance.mock-writer}.ts` (+tests), `composition/{sale-settlement.demo-writer.ts,sale-settlement.demo-writer.contract.test.ts,modules/finance.ts,demo-snapshot.ts,seed-consistency.test.ts,write-persistence.test.ts}`, `projects/application/change-project-stage.ts` (solo el texto) | 1a | 1 (resto), 3a | CA5–CA6 (lógica), CA9, CA12, CA13 |
| 3a | constructor-ui | `finance/ui/components/investor/{SimulatorResultPanel,ScenariosSection,ProjectParticipate,RealizedResult}.tsx`, `investor/{copy,copy-simulator}.ts`, `finance/ui/hooks/profit-rate.ts` (+test), `club/ui/copy.ts`, `docs/06` | 1 | 2 | CA3 (UI), CA8 (ficha), CA11 |
| 3b | constructor-ui | `finance/ui/hooks/{use-record-sale,use-settle-project,settlement-view}.ts`, `finance/ui/components/admin/{SettlementPanel,SaleRegistration,FinanceScreen,use-admin-finance,copy,examples}.ts(x)` (borra `settlement-view.ts` de admin y `PLACED_BY_CODE`), `FinanceScreen.test.tsx`, `finance/backoffice-ui.ts`, `projects/ui/components/admin/{CommercializationScreen.tsx,copy.ts}`, `app/admin/comercializacion/page.tsx`, `tests/e2e/venta-liquidacion.spec.ts` | 1, 2 | — | CA5–CA8, CA10 |

- **1a** = primer commit del paquete 1: solo tipos de §3 (`LossDistribution`, `HolderPayout`, `ProjectSale`, `Settlement`) con la implementación anterior adaptada; desbloquea 2.
- B4: `SaleRegistration` (finance) la compone `app/admin/comercializacion/page.tsx` junto a `CommercializationScreen` (projects no puede importar finance). Se quita solo "cerrar venta"; "publicar anuncio" y "registrar oferta" quedan como `MockAction` (no cierran el recorrido). Formulario con React Hook Form + Zod reutilizando el campo de dinero de `project-sheet/StepEconomics`.
- B5: `settlementView` pasa a `ui/hooks` (D7); `placed` sale de la clase (deja de usar `PLACED_BY_CODE`). En `sold` muestra la vista previa con `buildRealizedInput` rotulada "venta registrada · por liquidar" y el botón real "Liquidar"; en `settled`, el resultado y la vista por participación (CA7: capital aportado · capital devuelto · ganancia o pérdida · cobro, "realizado"). `EXTERNAL_CAPITAL_BY_CODE` y KPIs de caja quedan (W-4/W-6).
- Hooks: `use-record-sale` y `use-settle-project` siguen `use-change-project-stage.ts` (`invalidateQueries()` al `ok`).

## 5. Pruebas
**Canónicos** (total 100, USD 100; en USD):
| Caso | P | C | F | O | Coloc. | L | Pool | Pérd./part. | Devol./part. | Ext. devuelto | Empresa recibe |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| C5 | 19.000 | 10.000 | 10.000 | 0 | 100 | 1.000 | 250 | 2,50 | 97,50 | 9.750 | 9.250 (pierde 750) |
| C7 parcial | 19.000 | 10.000 | 10.000 | 0 | 40 | 1.000 | 250 | 2,50 | 97,50 | 3.900 | 15.100 (pierde 900) |
| C8 tope | 60.000 | 100.000 | 10.000 | 0 | 100 | 50.000 | 12.500 | 100 (tope; capExcess 2.500) | 0 | 0 | 60.000 (pierde 40.000) |
| C9 residuo | 19.000 | 10.000 | 10.000 | 0,40 | 100 | 1.000,40 | 250,10 | 2,50 (residuo 0,10) | 97,50 | 9.750 | 9.249,60 (pierde 750,40) |
| C10 cero | 20.000 | 10.000 | 10.000 | 0 | 100 | — | — | 0 | 100 | 10.000 | 10.000 (`distributed`, todo 0) |
| C11 borde | 5.000 | 10.000 | 10.000 | 0 | 100 | 15.000 | 3.750 | espejo 37,50 → **W5-1** | 62,50 (a) / 50 (b) | 6.250 / 5.000 | −1.250 (a) / 0 (b) |
- Propiedades fast-check (I10–I16): `kind` = loss ⇔ excedente < 0 · `returned.external + returned.company = P − O` al centavo · `externalLoss + companyLoss = L` · `0 ≤ returnPerParticipation ≤ unitPrice` y `lossPerParticipation ≤ unitPrice` · ningún `total` de `HolderPayout` < 0 y `capitalReturned + loss = capital` · `returned.company ≥ 0` (con opción b) · subir P nunca baja la devolución. I1–I9 siguen; se ajusta la de "no_distribution".
- Casos de uso: venta desde `on_sale` y `stalled`; desde `renovation` → `INVALID_TRANSITION`; fecha futura y anterior a la compra; O > P; liquidar `on_sale` → `NOT_SOLD`; dos veces → `ALREADY_SETTLED`; pérdida C5 se liquida.
- Contrato `describeSaleSettlementWriterContract(label, setup)` (proyecto `prj_contrato_01` en `on_sale`, DB-4 lo crea): record → venta legible y proyecto `sold` con `saleSignedOn`; segundo record → DUPLICATE; INVALID_RECORD no cambia proyecto ni venta; settle sin venta → REFERENCE_NOT_FOUND; settle → `settled` + liquidación; segundo → DUPLICATE; una `LossDistribution` vuelve idéntica. `write-persistence`: venta y liquidación sobreviven a un contenedor nuevo sobre el mismo storage.
- **E2E** `venta-liquidacion.spec.ts` (390 y 1440): B4 elige M2-004 (`on_sale`), P 47.000 · O 1.000 · hoy → `venta-registrar` → B5 `finanzas-selector` M2-004 → vista previa → `finanzas-liquidar` → recarga → `finanzas-ya-liquidado`, `finanzas-titular-perdida` 5,00, `finanzas-titular-capital-devuelto` 95,00 → ficha pública → `seccion-resultado-realizado` con `realizado-capital-devuelto` 95,00 y `realizado-perdida` 5,00. testids nuevos: `venta-proyecto`, `venta-precio`, `venta-costos`, `venta-fecha`, `venta-registrar`, `venta-error`, `finanzas-vista-previa`, `finanzas-perdida`, `finanzas-titular-*`, `realizado-*`.

## 6. Riesgos, supuestos y preguntas
- **PREGUNTA AL USUARIO · W5-1 (borde CA4):** si `P − O` no alcanza para las devoluciones espejo de los externos (C11), ¿(a) la empresa pone la diferencia de su bolsillo (devolución espejo intacta; equivale a una protección parcial que la empresa ofrece y exige revisión legal y cuidado con la regla 1) o (b) los externos reciben todo `P − O` repartido por participación (redondeo hacia abajo, residuo a la empresa), la empresa recibe 0 y nadie pone dinero que no salió de la venta? **Por defecto: (b)**, aislado en una función para que cambiar a (a) toque un solo lugar. Hay que responder antes de cerrar el paquete 1; la respuesta va como §5 de ADR-019 (adenda) o ADR-020. Con las semillas y los rangos del simulador no se llega a este borde.
- Supuestos [PROPUESTO, en `docs/08` W5-2/W5-3]: O > P se rechaza al registrar; la venta no se corrige en W-5 (solo con "Reiniciar datos"); `settledOn` = hoy; F = presupuesto, no gasto real (W-4).
- Riesgo: el cambio de `HolderPayout`/`SimulationOutcome` toca ficha, simulador, escenarios y participar; 3a compila contra 1 y corre `pnpm vitest run src/modules/finance`. `holding-rows` (investors) solo lee `gain` y sigue igual.
- Riesgo de copy: la pérdida se muestra como monto ("pérdida realizada", "capital devuelto"), nunca con signo negativo ni como "% de ganancia"; el % es de recuperación (`calculateRecoveryRate`). Prohibido "bajo riesgo", "seguro", "garantizado"; `check-copy` sobre todos los copy tocados.
- Docs (CA11): `docs/02` §1 (glosario `ProjectSale`, pérdida) y §4 (fórmula de pérdida, C5 con resultado, C7–C11); skill `motor-reparto`; `docs/06`; `finance/CLAUDE.md`; copy `club/ui/copy.ts:66`, `finance/ui/components/admin/copy.ts:61`, `investor/copy.ts:71,90,142`, `copy-simulator.ts:31-32`, comentario de `profit-rate.ts`; `docs/08` O1/H2 y H2 cerradas; `docs/mejoras.md` M-001 cerrada; ADR-019 §4 ya figura confirmado (verificar). `docs/estado.md` lo actualiza el orquestador.

## 7. ADR requerido
No para el plan. Sí tras responder W5-1: adenda a ADR-019 (§5 borde) o `ADR-020-borde-liquidacion-sin-producto-suficiente.md`, con la skill `registrar-decision`.
