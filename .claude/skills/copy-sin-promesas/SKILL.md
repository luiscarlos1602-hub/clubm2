---
name: copy-sin-promesas
description: Reglas para escribir o revisar cualquier texto visible de la demo o de marketing (títulos, botones, tooltips, correos, cifras, anuncios) sin prometer rentabilidad y separando capital, ganancia y proyección.
---

# Copy sin promesas

Fuente única: `docs/06-guia-de-contenido.md`. Si una regla cambia, cambia ese doc **y** `scripts/check-copy.mjs` en el mismo commit.

## Dónde vive el copy
Todo texto visible de un módulo va en `src/modules/<m>/ui/copy.ts` (objeto `as const`, claves en inglés, valores en español). Los avisos fijos (riesgo del simulador, rueda, banner demo) viven en `src/shared/ui/brand/legal-copy.ts` y se importan; nunca se reescriben.

## Prohibido
acción/accionista/dueño · garantizado/asegurado/fijo/seguro/sin riesgo · "ganas X%" · duplicar dinero · urgencia o escasez falsa · fechas de pago prometidas.

## Obligatorio
- "participación económica", "proyección", "escenario", "resultado realizado", "plazo objetivo".
- Cifras futuras con `ProjectionLabel`.
- Portafolio: Capital aportado · Ganancia realizada · Proyección, siempre separados.
- Bajo cada simulador: el aviso de riesgo de `legal-copy.ts`.
- **Nunca ruedas** (buena/media/mala) de cara al inversionista, en correos ni en marketing (ADR-004). En su lugar: etapa, cronograma, "plazo objetivo · proyección". `check-copy` regla R9.

Tono: premium, cercano, frases cortas, tuteo (ADR-005). Marca Club M² · "Juntos sumamos metros." (ADR-003).

## Antes de entregar
`node scripts/check-copy.mjs <archivos tocados>` → 0 errores. Excepción legítima (p. ej. una objeción citada que la respuesta niega): añade `copy-ok: <motivo>` en esa línea; el revisor de cumplimiento la valida.
