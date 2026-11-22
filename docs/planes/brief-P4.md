# Brief · P4 · Ficha de proyecto + simulador 25/75 (prioridad 1)

## Historia
Como visitante o inversionista quiero abrir la ficha de un proyecto y ver qué es, cuánto cuesta, cómo avanza, qué riesgos tiene y simular cuánto podría tocarme en distintos escenarios, para decidir si participo, sabiendo que nada está garantizado.

## Criterios de aceptación (verificables)
- [ ] CA1 · `/proyectos/<slug>` (slug real, p. ej. `m2-001-palos-grandes`) muestra la ficha de cualquier proyecto **publicable** (mismo criterio que P3; M2-007 y slugs inexistentes → `not-found` de marca, sin romper el shell). El enlace de las tarjetas de P3 y el `siguiente-paso` del shell apuntan a slugs reales (cambiar `EXAMPLE_PROJECT_SLUG`; actualizar `rutas.spec.ts`).
- [ ] CA2 · Secciones (ADR-010: `PageHeader` + `Section` con tonos): resumen (sello `M2-00X`, nombre, zona sin dirección exacta D6, etapa pública, participaciones disponibles, precio por participación); el inmueble (tipo, m², zona); **presupuesto desglosado** (compra, reforma por rubros, costos de venta, honorarios de la empresa desglosados, D7) con cifras de datos simulados; **escenarios conservador/base/optimista** siempre rotulados proyección; **simulador**; cronograma y actualizaciones fechadas (sin rueda ni "días sin vender"); riesgos; CTA "Participar" a P5 (vista previa) con el aviso de riesgo cercano.
- [ ] CA3 · **Simulador** (D3): permite mover precio de venta, participaciones a comprar (1–20 por persona, D4, y no más que las disponibles), colocación total, sobrecosto de obra y retraso; presets de estrés (venta −20 %, obra +20 %/+50 %, retraso 3/6/9 meses, colocación 0 %). Todo número sale de `modules/finance` (`calculateDistribution` / `calculateHolderPayout`): **ninguna pantalla calcula dinero** (lint verde). Resultado en tres bloques rotulados: **capital aportado · ganancia proyectada · cobro proyectado**, con `ProjectionLabel`; sin excedente → "no hay reparto del fondo" y la política del capital "por definir" (O1/H2), nunca sugerir devolución. Debajo, el descargo exacto de `LEGAL_COPY.simulatorDisclaimer` (docs/06 regla 4).
- [ ] CA4 · El simulador **no muestra la rueda** resultante ni lenguaje de velocidad buena/media/mala (ADR-004). El retraso se expresa solo como plazo/proyección, no como rueda.
- [ ] CA5 · Casos canónicos: con las entradas de C1 y C6 (docs/02) el simulador devuelve exactamente las cifras de esos casos (test de integración contra el motor); en pérdida (C5) no hay reparto; la suma fondo + empresa = excedente al centavo (invariante del motor).
- [ ] CA6 · Proyectos finalizados: la ficha muestra el **resultado realizado** (liquidación sembrada) separado de capital y sin simulador de proyección activo (solo histórico); proyectos en obra/en venta/abiertos: simulador activo. Capital, realizado y proyección nunca mezclados ni la proyección en mayor jerarquía visual que el capital.
- [ ] CA7 · Datos: extender las semillas (datos-demo) con lo que la ficha necesita y hoy no existe (rubros del presupuesto, honorarios, hitos del cronograma, actualizaciones fechadas, riesgos del proyecto, escenarios), todo **derivado con el motor o citado de casos canónicos**, con fechas relativas al Clock, versión del snapshot (`club-demo:v2`) y `seed-consistency.test.ts` actualizado. Sin ruedas en los datos ni `stalled` visible.
- [ ] CA8 · Responsive 390/1440, estados de carga/error/vacío, a11y (controles con etiqueta, valores anunciados con `aria-live`, foco visible), `data-testid` estables; copy en `modules/<m>/ui/copy.ts` y `check-copy` en verde; sin cintillo (ADR-011); sin "reales"/verbos de transacción (docs/06).
- [ ] CA9 · E2E en 390 y 1440: abrir ficha desde P3, ver secciones y avisos, mover el simulador y comprobar cifras de C1/C6, presets de estrés, 404 de M2-007, finalizado sin simulador, reiniciar datos, sin `console.error`, sin "rueda". `pnpm verify` y `pnpm build` verdes; `src/architecture-rules.test.ts` verde.

## Fuera de alcance
- Reservar/participar (P5), portafolio (P6), fotografía real (F4-2), mapa, publicación de avances desde backoffice (B3: aquí solo se leen datos sembrados), simulador compartible/PDF.
- Perfil del inversionista y verificación.

## Decisiones y supuestos aplicados
- D1 excedente = venta − compra − presupuesto integral − costos de venta; D3 variables del simulador y presets; D4 1–20 por persona; D6 sin dirección exacta; D7 honorarios desglosados; L5 `stalled` → "en venta"; O1/H2 capital sin excedente "por definir"; P3-Q1..Q5 (marketplace); ADR-004, ADR-010, ADR-011.
- [SUPUESTO P4-1] Los escenarios conservador/base/optimista se derivan variando precio de venta y sobrecosto con deltas fijos documentados (el arquitecto propone los deltas y los lista para confirmación).
- [SUPUESTO P4-2] El retraso solo alarga el plazo proyectado (no resta ganancia salvo costos de mantenimiento si el maestro los define; si el maestro no define costo de retraso → solo plazo y se anota pregunta en docs/08).
- [SUPUESTO P4-3] La ficha de un proyecto sin colocación abierta (obra, venta) permite simular "como si" participaras con las participaciones ya colocadas indicadas; el arquitecto define el comportamiento y lo marca.
- Capas: la ficha combina `projects` + `participations` + `finance`; la vista vive en el módulo más a la derecha del orden que puede importar a todos los necesarios (`finance`; docs/01 §4 2b), salvo que el arquitecto justifique otra cosa. No se toca `eslint.config.mjs`. `composition` no importa valores de `@/modules/participations` (R4).

## Lectura mínima
- `docs/02` §4–§6 (motor, casos C1–C6, estrés), `docs/referencia/modelo-negocio-club-inmobiliario.md` §6–§7 y §10 (solo lectura), `docs/06` (reglas 3–4 y vocabulario), ADR-004/010/011
- `docs/planes/005-P3-marketplace.md` (patrones de vista y composition), `src/modules/finance/index.ts` y CLAUDE.md de módulos, `src/composition/*`, `src/shared/ui/README.md`
- `src/shared/ui/app-shell/route-map.ts` (p4/p5, `EXAMPLE_PROJECT_SLUG`) y `src/app/(inversionista)/proyectos/[slug]/page.tsx`
