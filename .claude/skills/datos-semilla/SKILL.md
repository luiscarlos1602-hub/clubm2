---
name: datos-semilla
description: Cómo escribir datos semilla y escenarios de demo tipados, verosímiles y consistentes con el motor de reparto.
---

# Datos semilla

1. Un `seed.ts` por módulo en `infrastructure/`, exportando arreglos tipados y validados con su esquema Zod.
2. Ids estables y legibles: `prj_chacao_01`, `inv_maria`.
3. Fechas relativas: `daysAgo(45)` usando el `Clock` de la demo, nunca fechas fijas.
4. Montos derivados se calculan con el motor (`modules/finance`), nunca se escriben a mano.
5. Escenarios mínimos (ver `docs/01-arquitectura.md §6`): due diligence, colocación 63/100, obra, venta, liquidado bueno, liquidado medio, rueda mala.
6. Personas ficticias; zonas reales de Venezuela; fotos de Unsplash con crédito en `public/images/CREDITOS.md`.
7. Mantén `src/shared/infrastructure/seed-consistency.test.ts` actualizado: recalcula cada liquidación sembrada y compara.
