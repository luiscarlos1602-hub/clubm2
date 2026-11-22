---
name: motor-reparto
description: Referencia obligatoria al tocar el motor de reparto 25/75, presupuestos, liquidaciones o ruedas en modules/finance o modules/projects. Contiene fórmulas, invariantes y casos canónicos.
---

# Motor de reparto

Fuente: `docs/02-modelo-de-dominio.md §4–§6`. Si cambias la fórmula, primero cambia ese documento y crea un ADR.

## Fórmula
```
excedente = P − C − F − O            (si ≤ 0: sin reparto, "política de pérdidas por definir")
fondo = 25% × excedente
porParticipación = fondo / total
externos = porParticipación × colocadas
empresaFondo = porParticipación × (total − colocadas)
empresaDirecto = 75% × excedente
```

## Invariantes (tests obligatorios)
- `externos + empresaFondo + empresaDirecto === excedente` al centavo.
- `capitalExterno + capitalEmpresa + excedente + O === P` cuando `F = total × precio`.
- Ningún resultado negativo para externos.
- Redondeo (K1, decidido): se redondea por participación hacia abajo al centavo; el residuo va a la empresa y se registra en `AuditEntry`.

## Casos canónicos C1–C6
Ver tabla en `docs/02-modelo-de-dominio.md §4`. Deben existir como tests con nombre `C1`…`C6`.

## Tests de propiedades (además de C1–C6)
Con `fast-check`, para entradas aleatorias válidas (P, C, F, O ≥ 0; 0 ≤ colocadas ≤ total):
- invariante de suma al centavo;
- externos ≥ 0 y monotonía: más colocadas ⇒ externos no disminuye;
- excedente ≤ 0 ⇒ ningún reparto.
Son la red que impide que un agente "arregle" un caso rompiendo otro.

## Ruedas
buena ≤ 3 meses · media > 3 y ≤ 6 · mala > 6 sin venta. "Mes" = mes calendario sumado a la fecha de compra (K2). Vendido después de 6 meses = "mala (vendida)" (K3). Se mide hasta la firma de venta (K4). **Solo backoffice**: se exporta por `modules/projects/backoffice.ts`, nunca por `index.ts` (ADR-004). Prueba los bordes exactos (3 meses, 3 meses + 1 día, 6 meses, 6 meses + 1 día).

Al terminar: `pnpm vitest run src/modules/finance src/modules/projects`.
