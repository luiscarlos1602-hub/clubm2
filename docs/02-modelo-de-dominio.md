# 02 · Modelo de dominio y reglas de cálculo

> Estado: **propuesta v0.1**. Las fórmulas vienen del documento maestro (§4–§7). Donde el maestro dice "pendiente" y no hay decisión registrada, aquí se marca **[POR DEFINIR]** y la demo lo muestra así (la política de pérdidas ya está decidida: ADR-019).

## 1. Lenguaje ubicuo (glosario)

| Término (UI, español) | Identificador (código) | Significado |
|---|---|---|
| Inmueble | `Property` | Activo físico. La empresa es siempre la titular legal |
| Proyecto | `Project` | Una operación completa sobre un inmueble: compra → reforma → venta → liquidación |
| Oportunidad | `Opportunity` | Inmueble en evaluación, antes de compra (adquisiciones) |
| Presupuesto integral de recuperación | `RecoveryBudget` | Lo que financian las participaciones (ref. USD 10.000 = obra 5.000 + honorarios/contingencia 5.000) |
| Participación | `Participation` | Derecho económico contractual sobre el fondo de participaciones de un proyecto. **No** es acción ni titularidad |
| Clase de participación | `ParticipationClass` | Configuración por proyecto: total (100), precio (USD 100) |
| Participación colocada / retenida | `placed` / `retained` | Comprada por tercero / no colocada y financiada por la empresa |
| Excedente distribuible | `DistributableSurplus` | Base del reparto, calculada al liquidar |
| Fondo de participaciones | `ParticipationFund` | 25% del excedente |
| Tramo directo de la empresa | `CompanyDirectShare` | 75% del excedente |
| Rueda | `Wheel` | Clasificación de velocidad: buena / media / mala. **Métrica interna del backoffice; nunca visible al inversionista** (ADR-004) |
| Escenario | `Scenario` | Conservador / base / optimista. Siempre proyección |
| Liquidación | `Settlement` | Cierre: devolución de capitales + reparto del excedente realizado o de la pérdida (ADR-019) |
| Venta del proyecto | `ProjectSale` | Venta real registrada en el backoffice: precio P, costos de venta O y fecha de firma. O ≤ P (W5-2); no se corrige (W5-3). Es la entrada de la liquidación con `buildRealizedInput` |
| Pérdida | `LossDistribution` | Excedente negativo. Se reparte en espejo 25/75 con tope en el aporte (ADR-019). En la UI: "pérdida realizada" / "capital devuelto", nunca ganancia negativa |
| % de recuperación | `calculateRecoveryRate` | Capital devuelto / capital aportado, en puntos básicos. Acompaña a una pérdida; el % de ganancia solo acompaña a una ganancia |

- **ProjectEconomics** — supuestos base del proyecto (C, F, P objetivo, O estimado); todo es proyección salvo lo que diga `Settlement`. No es la entrada de `createSettlement` (esa es `RealizedDistributionInput`).
- **HolderId** — `Id<"Investor">`: identifica al titular de participaciones (el perfil llega en F2).

## 2. Ciclo de vida del proyecto

```
opportunity → due_diligence → acquired → funding → renovation → on_sale → sold → settled
                    │                                                │
                    └──► discarded                                   └──► stalled (rueda mala)
```

Transiciones válidas en `modules/projects/domain/project-status.ts`. Cualquier otra transición devuelve `Result.err('INVALID_TRANSITION')`.

## 3. Entidades principales (resumen)

| Módulo | Entidades |
|---|---|
| projects | `Property`, `Project`, `Milestone`, `ProjectUpdate` (fecha, fuente, responsable, evidencia) |
| participations | `ParticipationClass`, `Participation`, `Reservation` |
| finance | `RecoveryBudget`, `BudgetLine`, `Expense`, `CashMovement`, `Settlement`, `Distribution` |
| acquisitions | `Opportunity`, `DueDiligenceCheck`, `Comparable`, `Offer` |
| renovations | `RenovationOrder`, `Contractor`, `ProgressPhoto` |
| sales | `Listing`, `Visit`, `SaleOffer` |
| investors | `User`, `InvestorProfile`, `Verification`, `Portfolio` (vista derivada) |
| club | `ClubEvent`, `Course`, `MembershipTier` |
| crm | `Lead`, `FunnelStage`, `Campaign` |
| shared | `AuditEntry` (todo movimiento financiero genera una) |

## 4. Motor de reparto (`modules/finance/domain/distribution.ts`)

### Entradas
- `salePrice` (P), `acquisitionCost` (C), `recoveryBudget` (F), `saleCosts` (O, comisiones/impuestos de venta)
- `totalParticipations` (100), `placedParticipations` (0–100)
- `fundShare` = 25% · `companyShare` = 75% (configurables por proyecto, defaults del maestro)

### Fórmula [SUPUESTO S5 — hipótesis contractual del maestro §6]
```
excedente      = P − C − F − O
si excedente < 0 → pérdida espejo 25/75 (ver "Pérdidas" abajo, ADR-019)
si excedente = 0 → reparto con todo en 0: cada titular recupera su aporte, sin ganancia (C10)
fondo          = 25% × excedente
porParticipación = fondo / totalParticipations
externos       = porParticipación × placed
empresaFondo   = porParticipación × (total − placed)
empresaDirecto = 75% × excedente
empresaTotal   = empresaDirecto + empresaFondo
capitalExterno = placed × precio           (se devuelve aparte de la ganancia)
capitalEmpresa = C + (total − placed) × precio
```
Invariante (test obligatorio): `externos + empresaTotal === excedente` al centavo, y `capitalExterno + capitalEmpresa + excedente + O === P`.

Redondeo [DECIDIDO 22-nov — K1]: `porParticipación` se redondea hacia abajo al centavo; el residuo (`fondo − porParticipación × total`) se asigna a la empresa y se registra en `AuditEntry`. Con los casos C1–C6 el residuo es 0.

### Pérdidas [DECIDIDO 22-nov — ADR-019, §4 y §5 confirmados]
No se devuelve dinero antes de la venta. Sin prelación de cobro: empresa e inversionistas cobran en la misma liquidación.
```
L                 = −excedente                                  (> 0)
pozo              = floor(25% × L)                               (redondeo a favor del inversionista)
espejo            = floor(pozo / total)                          residuo = pozo − espejo × total → empresa
pérdidaPorPart    = min(espejo, precio)                          tope: nadie pierde más que su aporte
excesoTope        = (espejo − pérdidaPorPart) × total            → empresa
devoluciónPorPart = precio − pérdidaPorPart
borde W5-1 (b): si devoluciónPorPart × placed > P − O
                  devoluciónPorPart = floor((P − O) / placed)    residuo → empresa; la empresa recibe 0
                  pérdidaPorPart    = precio − devoluciónPorPart
                  faltante (proceedsShortfall) = (espejo devuelto − devoluciónPorPart) × placed
devueltoExternos  = devoluciónPorPart × placed
devueltoEmpresa   = (P − O) − devueltoExternos                   (≥ 0 si O ≤ P)
pérdidaExternos   = pérdidaPorPart × placed      pérdidaEmpresa = L − pérdidaExternos
```
Invariantes (tests I10–I16): `devueltoExternos + devueltoEmpresa === P − O` al centavo; `pérdidaExternos + pérdidaEmpresa === L`; `0 ≤ devoluciónPorPart ≤ precio`; por titular `capitalDevuelto + pérdida === aporte` y cobro ≥ 0; la empresa nunca recibe un monto negativo con O ≤ P; subir P nunca baja la devolución. En el borde W5-1 nadie pone dinero que no salió de la venta: no es una protección del capital. Con P − O < 0 (solo posible en una proyección; la venta real lo rechaza, W5-2) los externos reciben 0.

Cobro por titular (`HolderPayout`): `capital` aportado, `loss`, `capitalReturned = capital − loss`, `gain` (0 en pérdida) y `total = capitalReturned + gain`; `result` = gain · break_even · loss.

### Casos canónicos (deben pasar exactamente)

| Caso | P | C | F | O | Colocadas | Excedente | Fondo | Por part. | Externos | Empresa fondo | Empresa 75% |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| C1 | 40.000 | 10.000 | 10.000 | 0 | 100 | 20.000 | 5.000 | 50 | 5.000 | 0 | 15.000 |
| C2 | 40.000 | 10.000 | 10.000 | 0 | 50 | 20.000 | 5.000 | 50 | 2.500 | 2.500 | 15.000 |
| C3 | 40.000 | 10.000 | 10.000 | 0 | 0 | 20.000 | 5.000 | 50 | 0 | 5.000 | 15.000 |
| C4 | 30.000 | 10.000 | 10.000 | 1.000 | 100 | 9.000 | 2.250 | 22,50 | 2.250 | 0 | 6.750 |
| C5 | 19.000 | 10.000 | 10.000 | 0 | 100 | −1.000 | — | — | pérdida (ver tabla de pérdidas) | — | — |
| C6 | 40.000 | 10.000 | 10.000 | 0 | 63 | 20.000 | 5.000 | 50 | 3.150 | 1.850 | 15.000 |

Cobro ilustrativo C1 por 1 participación: 100 capital + 50 ganancia = 150 (**proyección**, no promesa).

Casos de pérdida y cero (total 100, precio 100; tests en `distribution.loss.test.ts`):

| Caso | P | C | F | O | Coloc. | L | Pozo | Pérd./part. | Devol./part. | Devuelto externos | Empresa recibe |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| C5 | 19.000 | 10.000 | 10.000 | 0 | 100 | 1.000 | 250 | 2,50 | 97,50 | 9.750 | 9.250 (pierde 750) |
| C7 parcial | 19.000 | 10.000 | 10.000 | 0 | 40 | 1.000 | 250 | 2,50 | 97,50 | 3.900 | 15.100 (pierde 900) |
| C8 tope | 60.000 | 100.000 | 10.000 | 0 | 100 | 50.000 | 12.500 | 100 (tope; exceso 2.500) | 0 | 0 | 60.000 (pierde 40.000) |
| C9 residuo | 19.000 | 10.000 | 10.000 | 0,40 | 100 | 1.000,40 | 250,10 | 2,50 (residuo 0,10) | 97,50 | 9.750 | 9.249,60 (pierde 750,40) |
| C10 cero | 20.000 | 10.000 | 10.000 | 0 | 100 | — | — | 0 | 100 | 10.000 | 10.000 (reparto en 0) |
| C11 borde W5-1 | 5.000 | 10.000 | 10.000 | 0 | 100 | 15.000 | 3.750 | 50 (espejo 37,50; faltante 1.250) | 50 | 5.000 | 0 |

Cobro ilustrativo C5 por 1 participación: aporte 100, pérdida 2,50, capital devuelto 97,50 (97,5 % de recuperación).

### Pruebas de estrés del simulador (maestro §7)
El simulador de la ficha ofrece presets: venta −20%, obra +20% / +50%, retraso 3/6/9 meses, colocación 0%. El simulador del inversionista no muestra la rueda resultante.

## 5. Ruedas (`modules/projects/domain/classify-wheel.ts`) — solo backoffice

Se exponen por `modules/projects/backoffice.ts`, no por `index.ts` (`01 §8.3`). Las usan B1 (KPIs), B3 y B4. La cara del inversionista muestra en su lugar: etapa, cronograma, actualizaciones fechadas y "plazo objetivo" rotulado como proyección.

Medidas desde la fecha de compra hasta la fecha de venta (o "hoy" del `Clock` si no se ha vendido):

| Rueda | Regla |
|---|---|
| buena | vendido en ≤ 3 meses |
| media | vendido en > 3 y ≤ 6 meses |
| mala | > 6 meses sin venta |
| en curso | ≤ 6 meses y sin venta (la UI muestra "en curso · objetivo: buena") |

Nota interna junto a la rueda en el backoffice: "Mide velocidad, no garantiza rentabilidad."

Reglas de borde [DECIDIDO 22-nov, propuestas por defecto aceptadas — K2–K4]:
- **K2 · Unidad "mes"**: mes calendario sumado a la fecha de compra (compra 15-ene → 3 meses = 15-abr).
- **K3 · Vendido después de 6 meses**: "mala (vendida)".
- **K4 · Fin de la medición**: firma de venta; el cobro se registra aparte.

## 6. Presupuesto y honorarios (maestro §6, regla esencial)

`RecoveryBudget` tiene líneas tipadas: `works` (obra), `management_fee` (honorarios devengados), `contingency` (contingencia), `reserve`. El backoffice registra por separado lo **presupuestado**, lo **devengado/gastado** y lo **remanente**. Ninguna vista suma honorarios como utilidad adicional.
