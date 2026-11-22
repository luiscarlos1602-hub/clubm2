---
name: motor-reparto
description: Referencia obligatoria al tocar el motor de reparto 25/75, presupuestos, liquidaciones o ruedas en modules/finance o modules/projects. Contiene fórmulas, invariantes y casos canónicos.
---

# Motor de reparto

Fuente: `docs/02-modelo-de-dominio.md §4–§6`. Si cambias la fórmula, primero cambia ese documento y crea un ADR.

## Fórmula
```
excedente = P − C − F − O            (si < 0: pérdida espejo, abajo; si = 0: reparto en 0, C10)
fondo = 25% × excedente
porParticipación = fondo / total
externos = porParticipación × colocadas
empresaFondo = porParticipación × (total − colocadas)
empresaDirecto = 75% × excedente
```

## Pérdidas (ADR-019: espejo 25/75, sin prelación, solo al vender)
```
L = −excedente · pozo = floor(25% × L) · espejo = floor(pozo / total)   (residuo → empresa)
pérdidaPorPart = min(espejo, precio)          (tope; excesoTope = (espejo − tope) × total → empresa)
devoluciónPorPart = precio − pérdidaPorPart
borde W5-1 (b): si devoluciónPorPart × colocadas > P − O → devoluciónPorPart = floor((P − O) / colocadas),
  residuo a la empresa, la empresa recibe 0; se registra en proceedsShortfall. Aislado en capReturnToProceeds.
devueltoExternos = devoluciónPorPart × colocadas · devueltoEmpresa = (P − O) − devueltoExternos
pérdidaExternos = pérdidaPorPart × colocadas · pérdidaEmpresa = L − pérdidaExternos
```
`LossDistribution` (`kind: "loss"`); `HolderPayout` trae `result`, `loss`, `capitalReturned`, `gain` ≥ 0 y `total`. El % de una pérdida es de recuperación (`calculateRecoveryRate`), nunca "% de ganancia" negativo. La venta real (`ProjectSale`, `checkProjectSale`: O ≤ P, firma ≤ hoy) entra a la liquidación solo por `buildRealizedInput`.

## Invariantes (tests obligatorios)
- `externos + empresaFondo + empresaDirecto === excedente` al centavo.
- `capitalExterno + capitalEmpresa + excedente + O === P` cuando `F = total × precio`.
- Ningún resultado negativo para externos (ni ganancia ni cobro).
- En pérdida: `devueltoExternos + devueltoEmpresa === P − O`; `pérdidaExternos + pérdidaEmpresa === L`; nadie pierde más que su aporte; la empresa nunca recibe negativo con O ≤ P.
- Redondeo (K1, decidido): se redondea por participación hacia abajo al centavo; el residuo va a la empresa y se registra en `AuditEntry`.

## Casos canónicos C1–C11
Ver tablas en `docs/02-modelo-de-dominio.md §4`. Deben existir como tests con nombre `C1`…`C11` (C1–C6 en `distribution.canonical.test.ts`; C5 con resultado y C7–C11 en `distribution.loss.test.ts`).
- C5: P 19.000 · C 10.000 · F 10.000 · O 0 · 100 → pierde 2,50 por participación, devuelve 97,50; empresa recibe 9.250.
- C7 parcial 40/100 → externos 3.900, empresa 15.100 · C8 tope (C 100.000, P 60.000) → devolución 0, exceso 2.500 · C9 O 0,40 → residuo 0,10 · C10 P 20.000 → todo en 0 · C11 P 5.000 → borde W5-1: 50 por participación, externos 5.000, empresa 0.

## Tests de propiedades (además de C1–C6)
Con `fast-check`, para entradas aleatorias válidas (P, C, F, O ≥ 0; 0 ≤ colocadas ≤ total):
- invariante de suma al centavo;
- externos ≥ 0 y monotonía: más colocadas ⇒ externos no disminuye;
- excedente < 0 ⇔ `kind: "loss"` (I6, I10); pérdida I10–I16 en `distribution.loss-properties.test.ts`.
Son la red que impide que un agente "arregle" un caso rompiendo otro.

## Ruedas
buena ≤ 3 meses · media > 3 y ≤ 6 · mala > 6 sin venta. "Mes" = mes calendario sumado a la fecha de compra (K2). Vendido después de 6 meses = "mala (vendida)" (K3). Se mide hasta la firma de venta (K4). **Solo backoffice**: se exporta por `modules/projects/backoffice.ts`, nunca por `index.ts` (ADR-004). Prueba los bordes exactos (3 meses, 3 meses + 1 día, 6 meses, 6 meses + 1 día).

Al terminar: `pnpm vitest run src/modules/finance src/modules/projects`.
