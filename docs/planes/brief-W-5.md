# Brief · W-5 · Venta y liquidación (backoffice, local) + política de pérdidas ADR-019

## Historia
Como miembro del equipo quiero registrar la venta real de un inmueble (precio y costos de venta) y luego liquidarlo desde el backoffice, con ganancia o con pérdida, para que la liquidación quede guardada en el almacén local y la ficha pública y la vista por titular muestren el resultado realizado.

## Criterios de aceptación (verificables)
- [ ] CA1 · **Motor de pérdidas (ADR-019), test primero.** `calculateDistribution` con excedente < 0 devuelve un resultado de pérdida (no `to_be_defined`): pérdida `L = |excedente|`; el conjunto de inversionistas absorbe el 25 % de `L` repartido entre las `total` participaciones con el mismo criterio que el fondo (las no colocadas van a la empresa); **tope**: ninguna participación pierde más que su `unitPrice` (devolución mínima 0); el exceso lo absorbe la empresa. Redondeo a favor del inversionista con el residuo a la empresa (análogo a K1) — el plan lo fija.
- [ ] CA2 · Excedente exactamente 0: cada titular recupera su aporte, sin ganancia.
- [ ] CA3 · Se elimina `LOSS_POLICY_UNDEFINED` y `lossPolicy: "to_be_defined"` de todo el código. `createSettlement` y `calculateHolderPayout` funcionan con pérdida (cobro por titular = aporte − su parte de la pérdida; `gain` negativa o un campo `loss` — el plan decide la forma, rotulada).
- [ ] CA4 · Casos canónicos nuevos en `docs/02 §4` y tests (C5 pasa a tener resultado: P 19.000 · C 10.000 · F 10.000 · O 0 · 100 colocadas → L 1.000, inversionistas 250, 2,50 por participación, devolución 97,50; empresa 750) + al menos un caso con tope (pérdida que agota el aporte) y uno con colocación parcial. Propiedades fast-check: devoluciones + empresa cuadran al centavo con `P − O`; ningún pago a titular negativo; ningún titular pierde más que su aporte. **Borde a resolver en el plan:** si `P − O` no alcanza para pagar las devoluciones de los externos, la empresa recibiría un monto negativo — el plan debe decir qué pasa y, si es decisión de producto, marcarlo para preguntar.
- [ ] CA5 · **Venta:** en B4 `/admin/comercializacion`, el equipo registra precio de venta real P y costos de venta reales O (y fecha de firma) de un proyecto en `listed`/`for_sale` (según `PROJECT_TRANSITIONS`) → pasa a `sold`. Caso de uso con `Result`, puerto de escritura, método mock sobre `createDemoStore` validado con `zod-schemas.ts`. Sustituye el `MockAction` "cerrar venta" (los de publicar anuncio / registrar oferta pueden quedar como están si no cierran el recorrido; el plan decide).
- [ ] CA6 · **Liquidar:** en B5 (`SettlementPanel`, `/admin/finanzas`), "Liquidar" en un proyecto `sold` crea `Settlement` con `createSettlement` (base `realized`, P y O reales, C y F del proyecto, colocadas actuales), lo guarda por `SettlementRepository` (nuevo método de escritura) y pasa el proyecto a `settled`. Un proyecto no se liquida dos veces. Sustituye el `MockAction` de liquidar.
- [ ] CA7 · **Vista por titular**: el panel muestra, para el proyecto liquidado, capital devuelto · ganancia realizada (o pérdida) · por participación, rotulado "realizado", calculado por el motor (ninguna pantalla calcula dinero).
- [ ] CA8 · Lo vendido/liquidado **sobrevive a recargar**; la ficha pública del proyecto muestra el resultado realizado. Hooks de mutación invalidan TanStack Query (plantilla `use-reset-demo-data.ts`).
- [ ] CA9 · Suites de contrato de los puertos nuevos (venta, settlement writer), escritas contra el puerto y reutilizables por Supabase (DB-4). `seed-consistency.test.ts` sigue verde.
- [ ] CA10 · E2E del recorrido: registrar venta → liquidar → recargar → el resultado persiste en finanzas y en la ficha. 390 y 1440 px.
- [ ] CA11 · Docs y copy: `docs/02` (fórmula y casos), skill `motor-reparto`, `docs/06`, `src/modules/finance/CLAUDE.md`, y los textos que dicen "por definir" sobre pérdidas/capital (`club/ui/copy.ts:66`, `finance/ui/components/admin/copy.ts:61`, `finance/ui/components/investor/copy.ts:71,90,142`, `copy-simulator.ts:32`, `profit-rate.ts` si aplica). El copy informa que el aporte puede recuperarse solo en parte y que no se devuelve antes de la venta. Nunca "bajo riesgo", "seguro", "garantizado". `check-copy` limpio. ADR-019 §4 queda marcado como confirmado.

## Fuera de alcance
- Gasto de obra y avances (W-4); reservas y portafolio real por `listByHolder` (W-6).
- `AuditEntry` persistido, remanente H3, reinvertir (E2), correos.
- Supabase, server actions, dependencias nuevas.

## Decisiones y supuestos aplicados
- ADR-019 completo; **§4 confirmado por el usuario el 22-nov: sin prelación de cobro**, empresa e inversionistas cobran en la misma liquidación según la fórmula.
- H1 orden de cobro (costos de venta → capital empresa → capital participaciones → excedente 25/75) queda informativo; con §4 no hay prelación entre partes.
- W2-3: `sold`/`settled` son solo lectura en la ficha de edición; su resultado se fija aquí.
- Las ruedas siguen solo en backoffice (B4 puede mostrarlas).
- Patrón técnico del prompt E2: puerto → caso de uso con `Result` → mock sobre demo-store validado con zod → suite de contrato → hook → pantalla; borrar literales de `examples.ts` que dejen de usarse.

## Lectura mínima
- `docs/decisiones/ADR-019-politica-de-perdidas-espejo-25-75.md`
- `docs/02-modelo-de-dominio.md` §4 · skill `.claude/skills/motor-reparto/SKILL.md`
- `docs/prompts/E2-backoffice-local.md` (patrón y límites)
- `src/modules/finance/CLAUDE.md`, `src/modules/finance/domain/{distribution,settlement,holder-payout}.ts`, `application/ports.ts`
- `src/modules/projects/domain/project-status.ts`, `application/change-project-stage.ts` (W-3)
- Pantallas: `projects/ui/components/admin/CommercializationScreen.tsx`, `finance/ui/components/admin/{SettlementPanel,FinanceScreen}.tsx`
