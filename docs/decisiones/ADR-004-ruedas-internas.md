# ADR-004 · Las ruedas son una métrica interna

Estado: **aceptado** (decisión del usuario, 22-nov-2026)
Fecha: 2026-11-22

## Contexto
El maestro (§4, §10) define ruedas buena/media/mala y sugiere mostrarlas en la ficha. El usuario decide que son un tema interno de operación y no deben llegar a los inversionistas.

## Opciones consideradas
1. Mostrar las ruedas con el aviso "mide velocidad, no garantiza rentabilidad".
2. **Ruedas solo en el backoffice** (esta).

## Decisión
- La rueda se calcula en `modules/projects/domain` y se expone solo por `modules/projects/backoffice.ts` (`01 §8.3`).
- Cara pública, del inversionista, correos y marketing: sin ruedas. Se muestran etapa, cronograma, actualizaciones fechadas y "plazo objetivo" como proyección.
- Se verifica con código: `no-restricted-imports` (F1-3) y regla R9 de `scripts/check-copy.mjs`.

## Consecuencias
- Desvío consciente del maestro §10; el maestro no se edita (es solo lectura) y este ADR manda.
- B1 sigue mostrando % de ruedas como KPI interno.
- El revisor de cumplimiento trata cualquier rueda visible al inversionista como 🔴.
