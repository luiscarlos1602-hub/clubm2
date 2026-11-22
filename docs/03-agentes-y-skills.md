# 03 · Agentes, subagentes, skills y hooks

> Estado: **propuesta v0.2** (ADR-002). Todo vive en `.claude/`, que es donde Claude Code lo carga.

## 1. Modelo de trabajo

```
                        Tú (dueño del producto)
                               │  decisiones de producto, aprobación de fase
                               ▼
                 ┌───────────────────────────────┐
                 │ Agente principal = ORQUESTADOR │  skills ciclo-funcionalidad · cerrar-fase
                 │ lee docs/estado.md · integra   │  único que hace commits y merge
                 └───────┬───────────────┬───────┘
        brief            │               │  lee ESTADO / VEREDICTO (última línea)
   ┌─────────────┐       │               │
   │ arquitecto  │──plan + contratos + paquetes
   │ (opus, lee) │       │
   └─────────────┘       ▼
          ┌──────────────┬──────────────┬──────────────┐   paquetes con archivos
          │dominio-      │ datos-demo   │constructor-ui│   exclusivos; en paralelo
          │financiero    │ (sonnet)     │ (sonnet)     │   con worktrees si el plan
          │(opus)        │              │              │   lo permite
          └──────┬───────┴──────┬───────┴──────┬───────┘
                 └──── verificar (lo reejecuta el orquestador) ────┘
                               │
               ┌───────────────┴───────────────┐   en paralelo, solo lectura
               │ revisor-codigo  ∥  revisor-    │
               │ (opus)             cumplimiento│
               │                    (sonnet)    │
               └───────────────┬───────────────┘
                               ▼  al cerrar fase
                        ┌─────────────┐
                        │   qa-e2e    │
                        └─────────────┘

  Siempre activos (deterministas, sin tokens):  hooks · permisos · lint · check-copy · tests
```

Reglas de oro:
1. **Los que revisan no escriben; los que escriben no se aprueban.**
2. **Lo comprobable se comprueba con código** (hooks, lint, tests, `check-copy`); el prompt es la última línea de defensa, no la primera.
3. **Todo handoff es un documento con formato fijo** (`docs/plantillas/`) y termina en una línea parseable.
4. **Un solo orquestador.** Los subagentes no lanzan otros subagentes ni invocan `ciclo-funcionalidad`.

## 2. Subagentes (`.claude/agents/*.md`)

| Agente | Modelo | Escribe en | Entrada | Salida (última línea) | Cuándo |
|---|---|---|---|---|---|
| `arquitecto` | opus | `docs/planes/`, ADR propuestos, `docs/08` | brief | `ESTADO: HECHO \| NO_REQUIERE_PLAN \| BLOQUEADO` | Paso 2, funcionalidades M/L |
| `dominio-financiero` | opus | `domain/`, `application/`, `shared/domain/`, `index.ts` | brief de paquete | `ESTADO: HECHO \| BLOQUEADO` | Cualquier regla o cálculo |
| `datos-demo` | sonnet | `infrastructure/`, `composition/modules/`, semillas | brief de paquete | `ESTADO: …` | Semillas y escenarios |
| `constructor-ui` | sonnet | `ui/`, `app/`, `shared/ui/` si el plan lo dice | brief de paquete | `ESTADO: …` | Pantallas P1–P8, B1–B6 |
| `revisor-codigo` | opus | nada | brief + plan + diff | `VEREDICTO: APROBADO \| CAMBIOS_REQUERIDOS` | Paso 5, siempre en M/L |
| `revisor-cumplimiento` | sonnet | nada | brief + diff | `VEREDICTO: …` | Paso 5 si toca UI/copy/marketing |
| `qa-e2e` | sonnet | `docs/qa/`, `tests/e2e/` | fase | `VEREDICTO: …` | `cerrar-fase`, antes de presentar |

Cada agente declara su **lectura mínima**: no relee todos los docs, solo las secciones que su tarea necesita. Así arranca rápido y con menos ruido.

Cuándo **no** usar subagentes: tareas S (1–2 archivos, sin dinero ni copy de riesgo). El orquestador las hace directo y aplica él mismo el checklist y `check-copy`.

## 3. Skills (`.claude/skills/<nombre>/SKILL.md`)

| Skill | Tipo | Qué hace | La usa |
|---|---|---|---|
| `ciclo-funcionalidad` | **orquestación** | Ejecuta el ciclo completo de un ID del tablero con puertas, máx. 2 rondas de revisión y escalamiento | agente principal |
| `cerrar-fase` | **orquestación** | Puerta de salida, QA, mini-retro → mejoras en skills/lint, tag | agente principal |
| `verificar` | verificación | tsc → lint → check-copy → vitest → playwright; resumen con salida real | todos |
| `nuevo-modulo` | andamiaje | Estructura de capas + `CLAUDE.md` local + `copy.ts` + registro sin conflictos | arquitecto, dominio-financiero |
| `nueva-pantalla` | andamiaje | Ruta + componentes + checklist (responsive, estados, a11y, copy, testids) | constructor-ui |
| `motor-reparto` | referencia | Fórmulas, invariantes, C1–C6, tests de propiedades, bordes de rueda | dominio-financiero, revisor-codigo |
| `datos-semilla` | referencia | Semillas tipadas, escenarios mínimos, test de consistencia | datos-demo |
| `copy-sin-promesas` | referencia | Vocabulario, dónde vive el copy, uso de `check-copy` | constructor-ui, revisor-cumplimiento, marketing |
| `registrar-decision` | proceso | ADR con plantilla; nunca editar uno aceptado | arquitecto, agente principal |

Las skills de referencia **apuntan** a la fuente (`docs/02`, `docs/06`) y solo resumen; si una regla cambia, se cambia la fuente y la skill en el mismo commit.

## 4. Hooks y permisos (`.claude/settings.json`)

| Evento | Script | Qué hace | Desde |
|---|---|---|---|
| Antes de Edit/Write | `hooks/proteger-fuentes.sh` | Bloquea `docs/referencia/**`, `.env*` y ADR aceptados, explicando cómo proceder | F0 |
| Después de Edit/Write en `src/**/*.ts(x)` o `marketing/*.md` | `hooks/post-edicion.sh` | `check-copy` del archivo | F0 |
| ídem, `*.ts(x)/css/json/md` | ídem | `prettier --write` + `eslint --fix`; errores vuelven al agente | F1 (con `node_modules`) |
| ídem, `finance/`, `projects/`, `shared/domain/` | ídem | `vitest run` del módulo; si se rompe C1–C6 el agente lo ve al instante | F1 |
| `git commit` (humanos y agentes) | pre-commit (lefthook) | `pnpm verify:fast` | F1-3 |

Permisos: se permiten `pnpm`, lectura de git, `add/commit/switch/worktree/tag` sin preguntar; `push`, `merge`, `rebase` y añadir dependencias **preguntan**; `rm -rf`, `push --force`, `reset --hard`, leer `.env` y editar `docs/referencia/` están **denegados**.

## 5. Memoria del proyecto (qué lee cada sesión)

| Capa | Archivo | Tamaño objetivo |
|---|---|---|
| Global | `CLAUDE.md` | ≤ 120 líneas: reglas no negociables + punteros |
| Avance | `docs/estado.md` | Tablero; lo primero que lee una sesión nueva |
| Local | `src/modules/<m>/CLAUDE.md` | ≤ 30 líneas; se carga al trabajar en el módulo |
| Bajo demanda | `docs/*`, skills | Solo las secciones citadas en el brief |
| Aprendizaje | `docs/mejoras.md` (retros) → skills / lint | Lo que se repite 2+ veces deja de depender de la memoria |
