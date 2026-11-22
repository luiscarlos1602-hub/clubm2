# 02 · Modelo de dominio y reglas de cálculo

> Estado: **propuesta v0.1**. Las fórmulas vienen del documento maestro (§4–§7). Donde el maestro dice "pendiente", aquí se marca **[POR DEFINIR]** y la demo lo muestra así.

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
| Liquidación | `Settlement` | Cierre: devolución de capitales + reparto del excedente realizado |

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
si excedente ≤ 0 → no hay reparto; se muestra "Política de pérdidas: por definir" [POR DEFINIR]
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

### Casos canónicos (deben pasar exactamente)

| Caso | P | C | F | O | Colocadas | Excedente | Fondo | Por part. | Externos | Empresa fondo | Empresa 75% |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| C1 | 40.000 | 10.000 | 10.000 | 0 | 100 | 20.000 | 5.000 | 50 | 5.000 | 0 | 15.000 |
| C2 | 40.000 | 10.000 | 10.000 | 0 | 50 | 20.000 | 5.000 | 50 | 2.500 | 2.500 | 15.000 |
| C3 | 40.000 | 10.000 | 10.000 | 0 | 0 | 20.000 | 5.000 | 50 | 0 | 5.000 | 15.000 |
| C4 | 30.000 | 10.000 | 10.000 | 1.000 | 100 | 9.000 | 2.250 | 22,50 | 2.250 | 0 | 6.750 |
| C5 | 19.000 | 10.000 | 10.000 | 0 | 100 | −1.000 | — | — | sin reparto | — | — |
| C6 | 40.000 | 10.000 | 10.000 | 0 | 63 | 20.000 | 5.000 | 50 | 3.150 | 1.850 | 15.000 |

Cobro ilustrativo C1 por 1 participación: 100 capital + 50 ganancia = 150 (**proyección**, no promesa).

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
