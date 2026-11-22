# ADR-019 · Política de pérdidas: espejo 25/75, se liquida solo al vender
Estado: **aceptado** (decisión del usuario, 22-nov-2026: "no hay una forma donde devolvamos el dinero sino hasta que se venda, sea con pérdida o no" + opción elegida "Espejo 25/75")
Fecha: 2026-11-22
Relacionado: maestro §6 (lo marca "pendiente"; es de solo lectura, la constancia vive aquí), `docs/08` O1/H2, `docs/mejoras.md` M-001, ADR-018 (W-5), skill `motor-reparto`

## Contexto
El maestro deja pendiente qué pasa si un proyecto se vende sin excedente. El motor lo refleja con `LOSS_POLICY_UNDEFINED` (`finance/domain/holder-payout.ts`, `settlement.ts`) y la UI con "política de pérdidas por definir". Eso bloqueaba liquidar con resultado negativo en W-5.

## Opciones consideradas
1. **Espejo 25/75** (esta): la pérdida se reparte igual que la ganancia.
2. La empresa absorbe primero. Descartada por el usuario.
3. Proporcional al capital aportado por cada parte. Descartada por el usuario.
4. Dejarlo por definir. Descartada: bloquea W-5.

## Decisión
1. **Cuándo:** no se devuelve dinero a los inversionistas antes de la venta del inmueble, haya ganancia o pérdida. Mientras no se venda, el proyecto sigue abierto; no existe devolución anticipada ni rescate.
2. **Cuánto, si hay pérdida** (excedente negativo; pérdida `L` = valor absoluto del excedente):
   - El conjunto de inversionistas absorbe el **25 % de `L`**; la empresa, el **75 %**.
   - El 25 % se reparte entre participaciones con el mismo criterio que hoy reparte el fondo del 25 % de la ganancia (incluido el trato de las participaciones no colocadas).
   - **Tope:** ningún titular pierde más que su aporte; su devolución mínima es 0. Lo que exceda el tope lo absorbe la empresa.
   - Devolución por titular = aporte − su parte de la pérdida.
3. **Excedente exactamente cero:** cada titular recupera su aporte, sin ganancia.
4. **Orden de cobro** (interpretación del orquestador, no dicha literalmente por el usuario; confirmar en W-5): no hay prelación entre empresa e inversionistas; ambos cobran en la misma liquidación según la fórmula.

## Consecuencias
- **W-5** implementa la regla en `modules/finance/domain` (test primero): elimina `LOSS_POLICY_UNDEFINED`, añade casos canónicos y de propiedades (la suma de devoluciones más la parte de la empresa cuadra con lo recibido en la venta; ningún pago negativo), y permite liquidar con resultado negativo.
- En el mismo cambio se actualizan `docs/02-modelo-de-dominio.md` (fórmulas y casos canónicos), la skill `motor-reparto`, `docs/06-guia-de-contenido.md` y los textos que hoy dicen "por definir" (p. ej. `modules/club/ui/copy.ts`), pasando por `check-copy`.
- **Copy:** se informa que el aporte puede recuperarse solo en parte y que no se devuelve antes de la venta. Sigue prohibido prometer seguridad o describir la inversión como de "bajo riesgo" (regla 1 de `CLAUDE.md`).
- El simulador y los escenarios pueden mostrar resultados negativos con esta regla, rotulados como "escenario".
- Pendiente antes de abrir al público (Etapa 4): revisión legal de esta política junto con `/terminos` (ADR-013).
- Cierra `docs/08` O1/H2 y `docs/mejoras.md` M-001 (salvo la confirmación del punto 4).
