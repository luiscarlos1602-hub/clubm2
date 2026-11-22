# ADR-002 · Arquitectura agéntica del proyecto

Estado: **aceptado** (usuario, 22-nov-2026)
Fecha: 2026-11-22

## Contexto
F0 dejó 7 subagentes y 7 skills en borrador (`claude-config/`), con el ciclo por funcionalidad descrito en prosa. Revisión desde la óptica de desarrollo con agentes:
- La configuración no se cargaba (Claude Code lee `.claude/`) y no había permisos ni hooks: todas las reglas dependían de que el modelo las recordara.
- El ciclo de `04-workflow.md` no era ejecutable: nadie lo orquestaba paso a paso con puertas.
- Los subagentes no tenían contrato de entrada/salida: el orquestador no podía decidir por la respuesta, solo interpretarla.
- No había un estado persistente del avance: una sesión nueva no sabía por dónde seguir.
- Puntos de conflicto al trabajar en paralelo (`container.ts`, config de ESLint por módulo).
- Reglas de dominio incompletas que un agente tendería a "resolver" inventando (bordes de rueda, redondeo).

## Opciones consideradas
1. Mantener el borrador y moverlo a `.claude/` sin cambios.
2. **Capa agéntica con guardarraíles deterministas, contratos y orquestación ejecutable** (esta).
3. Un agente por módulo de negocio (9+ agentes).

## Decisión
Opción 2:
1. **Determinismo antes que prosa**: hooks (`proteger-fuentes`, `post-edicion`), permisos en `settings.json`, `scripts/check-copy.mjs` y reglas de lint (`01 §8`). Una regla que se puede comprobar con código no se deja solo en un prompt.
2. **Orquestación ejecutable**: skills `ciclo-funcionalidad` y `cerrar-fase`; el agente principal es el único orquestador.
3. **Contratos de handoff**: plantillas en `docs/plantillas/` (brief, plan, entrega, informe) con última línea parseable (`ESTADO:` / `VEREDICTO:`).
4. **Contratos de código primero**: el arquitecto fija tipos y puertos y divide en paquetes con archivos exclusivos → construcción en paralelo con worktrees.
5. **Contexto local**: un `CLAUDE.md` de ≤ 30 líneas por módulo; cada agente declara su "lectura mínima".
6. **Estado persistente**: `docs/estado.md` como tablero único.
7. **Modelo por rol**: opus para planificar, dominio financiero y revisión de código; sonnet para UI, datos, cumplimiento (apoyado por `check-copy`) y QA.
8. Se mantienen 7 agentes (opción 3 descartada: más agentes = más contexto repetido y más handoffs, sin más calidad).

## Consecuencias
- Errores de capas, copy y motor se detectan en el momento de editar, no en la revisión.
- El orquestador decide por `ESTADO`/`VEREDICTO`, con máx. 2 rondas de revisión antes de escalar.
- Copy centralizado en `ui/copy.ts` por módulo: la revisión de cumplimiento es barata y completa.
- Coste: algo más de estructura por funcionalidad; se compensa con el modo S (directo) para cambios de 1–2 archivos.
- Los hooks de prettier/eslint/vitest se activan solos cuando existan `package.json` y `node_modules` (F1).
