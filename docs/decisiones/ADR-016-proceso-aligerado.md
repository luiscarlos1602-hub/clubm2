# ADR-016 · Proceso aligerado
Estado: **aceptado** (decisión del usuario, 22-nov-2026: "Proceso: aligerar", plan 010)
Fecha: 2026-11-22
Relacionado: ADR-002 (lo ajusta, no lo reemplaza); `docs/planes/010-revision-y-plan-de-ejecucion.md`

## Contexto
La revisión del 22-nov (plan 010) encontró que el proceso de ADR-002 frenaba más de lo que protegía:
- `post-edicion.sh` corría `vitest run` del módulo completo en cada edición de `finance`, `projects` o `shared/domain`, y bloqueaba (`exit 2`) en estados intermedios de un refactor.
- Cada funcionalidad lanzaba 8–12 subagentes, con planes de hasta 778 líneas (006) y contradicciones internas.
- Dos frentes (P4 y Supabase) convivieron en el mismo árbol y dos sesiones escribieron en la misma carpeta: P4 quedó sin commitear y el tablero sin actualizar.
- `docs/04-workflow.md` decía a la vez que verifica "quien construyó" y que verifica el orquestador.

## Opciones consideradas
1. Mantener ADR-002 tal cual y solo pedir más disciplina. Descartada: el coste lo pone el proceso, no la disciplina.
2. Quitar subagentes y revisiones por completo. Descartada: el motor de dinero y el copy de riesgo necesitan una segunda lectura.
3. **Aligerar** (esta): mismas capas y mismas reglas, menos ceremonia.

## Decisión
- **Hook:** `post-edicion.sh` deja solo `check-copy`, prettier y eslint. Los tests se corren al cerrar cada paquete (`pnpm vitest run <módulo>`).
- **Subagentes solo para tamaño L.** S y M los hace el agente principal directamente.
- **Un solo revisor por cambio:** `revisor-codigo`; `revisor-cumplimiento` en su lugar (o además, solo en L) cuando el cambio trae copy nuevo visible. En S basta el checklist de `docs/05` y `check-copy`.
- **Planes de máximo 150 líneas**: contratos y paquetes, no el código.
- **Verificación completa (`pnpm verify`) una vez por funcionalidad**, al final; durante la construcción basta `verify:fast` + vitest del módulo. Siempre la ejecuta el orquestador, nunca se acepta un autorreporte.
- **Una rama y un commit por fila del tablero**; nunca dos frentes en el mismo árbol.
- **Una sola sesión escribiendo por carpeta.**
- Cada sesión termina actualizando `docs/estado.md`.
- Las decisiones del usuario se piden en tanda al inicio de cada etapa, no a mitad.

## Consecuencias
- Se actualizan en este mismo cambio `.claude/hooks/post-edicion.sh`, `.claude/skills/ciclo-funcionalidad/SKILL.md` y `docs/04-workflow.md` (que además corrige quién verifica y los nombres de tags).
- Un error de motor ya no se detecta en la edición siguiente sino al cerrar el paquete: el paquete de dominio sigue siendo test primero y no se cierra en rojo.
- Si una funcionalidad L vuelve a necesitar más de 2 rondas de revisión, se replantea con el usuario (sin cambio respecto de ADR-002).
