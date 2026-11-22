# ADR-011 · Se retira el cintillo fijo de "Datos simulados"
Estado: **aceptado** (decisión del usuario, 22-nov-2026: "elimina el cintillo de datos simulados, es obvio para la demo")
Fecha: 2026-11-22

## Contexto
`docs/06` regla 5 y la regla 7 de `CLAUDE.md` pedían un banner fijo "Datos simulados · no es una oferta de inversión" en todas las zonas. El usuario lo considera redundante para la demo.

## Opciones consideradas
1. Mantener el cintillo en todas las pantallas.
2. Retirarlo del shell y dejar los avisos contextuales. **Elegida por el usuario.**

## Decisión
- `ZoneShell` y `/sistema` ya no pintan `DemoBanner`. El componente y `LEGAL_COPY.demoBanner` siguen en el catálogo.
- Se mantienen el pie del shell (ejemplo y riesgo), la barra "Simular rol", los avisos de riesgo y el descargo del simulador (reglas 3 y 4 de `docs/06`).

## Consecuencias
- Riesgo: una persona externa podría tomar la demo por una oferta real. Mitigación: no usar "reales", "Invierte" ni promesas (reglas añadidas en `docs/06`) y revisar de nuevo este ADR antes de F5 (dominio público y lanzamiento) o si la demo se muestra a terceros sin contexto.
- `revisor-cumplimiento` deja de exigir el banner; sigue exigiendo que ningún texto presente los proyectos de ejemplo como reales.
