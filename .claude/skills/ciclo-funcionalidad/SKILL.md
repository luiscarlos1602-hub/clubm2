---
name: ciclo-funcionalidad
description: Orquesta una funcionalidad completa del tablero (ID P1–P8, B1–B6, F1-x o M-NNN) de principio a fin — definir, planificar, construir en paquetes, verificar, revisar en paralelo, corregir, integrar y registrar. Úsala cuando el usuario diga "haz P4", "sigue con lo próximo del tablero" o /ciclo-funcionalidad <ID>. La ejecuta el agente principal; los subagentes no la invocan.
---

# Ciclo por funcionalidad (orquestador)

Argumento: `<ID>`. Sin ID → toma la primera fila `pendiente` de la fase activa en `docs/estado.md` cuyas dependencias estén `hecho`.

## 0 · Preparar (agente principal)
1. Lee la fila del ID en `docs/estado.md` y las preguntas de su bloque en `docs/08-preguntas-por-funcionalidad.md`.
2. ¿Hay preguntas 🔴/🟠 sin respuesta que cambian lo que se construye? → pregunta al usuario (máx. 4 a la vez, con la propuesta por defecto como primera opción). Si no está presente, usa la propuesta por defecto, márcala [SUPUESTO] en el brief y dilo en el resumen final.
3. Clasifica el tamaño:
   - **S**: 1–2 archivos y no toca dinero ni copy de riesgo → hazlo tú directo, salta a §4 (sin arquitecto ni subagentes revisores; aplica tú el checklist de `docs/05 §3–§4` y `check-copy`).
   - **M/L**: sigue el ciclo completo.
4. Marca la fila `en curso` y crea la rama `feat/<modulo>-<desc>`.

## 1 · Definir
Escribe el brief con `docs/plantillas/brief-tarea.md` (historia, criterios verificables, fuera de alcance, preguntas resueltas).

## 2 · Planificar → `arquitecto`
Pásale el brief. Espera `docs/planes/NNN-<id>.md` con contratos y paquetes.
- `NO_REQUIERE_PLAN` → trátalo como S.
- El plan propone un ADR o cambia una decisión de producto → **detente y pregunta al usuario** antes de construir.

## 3 · Construir por paquetes
Orden por defecto: `dominio-financiero` → `datos-demo` → `constructor-ui`.
- Si el plan fijó los contratos (tipos + puertos) y marca paquetes paralelos, lanza los paralelos a la vez con aislamiento `worktree` y archivos disjuntos. Si dos paquetes tocan el mismo archivo, van en serie.
- A cada subagente pásale un brief de paquete (plantilla, sección "Paquete"): plan, archivos permitidos, criterios que cubre, comando de verificación, formato de entrega.
- Lee la **última línea** de cada entrega: `HECHO` → sigue · `BLOQUEADO` → resuelve tú si es técnico y reversible; si es de producto, pregunta al usuario.

## 4 · Verificar (tú, no el constructor)
Corre la skill `verificar` (modo rápido) sobre todo lo tocado. No te fíes de los autorreportes: reejecuta. En rojo → vuelve al constructor del paquete con la salida real.

## 5 · Revisar en paralelo
Lanza **en el mismo mensaje**:
- `revisor-codigo` (siempre en M/L);
- `revisor-cumplimiento` (si el diff toca `ui/`, `app/`, `copy.ts`, correos o `marketing/`).
Pásales brief + plan + rama. Lee `VEREDICTO:`.

## 6 · Corregir
- 🔴 y 🟠 → al constructor original (continúa su sesión si es posible), con el hallazgo literal.
- 🟡 → a `docs/mejoras.md` (no bloquean).
- Reverifica solo lo que falló y re-revisa solo con el revisor que pidió cambios.
- **Máximo 2 rondas de revisión.** A la tercera, detente y replantea con el usuario: probablemente es un problema de diseño, no de implementación.

## 7 · Integrar
Commit Conventional en español (`feat(finance): …`), uno por cambio coherente que pasa `verificar`. Merge a `main` (pide confirmación si el usuario no lo autorizó de forma general).

## 8 · Registrar
1. `docs/estado.md`: fila → `hecho`, con enlaces a plan e informes.
2. `docs/mejoras.md`: 🟡 y deuda.
3. Si un error ya apareció 2+ veces en revisiones → propone la regla nueva para la skill, el `CLAUDE.md` del módulo o una regla de lint (mejor lint que prosa).
4. Respuesta al usuario: qué quedó (2–3 líneas), supuestos tomados, decisiones que necesitas. Sin recapitular los pasos.

## Reglas de escalamiento (siempre)
Pregunta al usuario antes de: cambiar una fórmula, un texto de riesgo, el alcance de una pantalla, el nombre o la marca; romper una regla de `01-arquitectura.md`; instalar una dependencia no listada en `01 §1`.
