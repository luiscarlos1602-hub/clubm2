# CLAUDE.md — Club M² · club de inversión inmobiliaria

Lee este archivo completo antes de cualquier tarea. Es corto a propósito; el detalle está en `docs/`.

## Arranque de cada sesión
1. Lee `docs/estado.md` (fase activa y siguiente fila pendiente).
2. Si vas a construir un ID del tablero → skill `ciclo-funcionalidad <ID>`. Si cierras fase → `cerrar-fase`.
3. Lee solo las secciones de `docs/` que cite el brief o la skill; no todo.

## Qué es
Plataforma web responsive (v1 = Etapa 1 del maestro: comunidad y demanda, sin recibir inversiones) de un club de inversión inmobiliaria en Venezuela: la empresa compra inmuebles con capital propio, los reforma y los vende; los inversionistas financian solo la reforma con participaciones económicas (ref. 100 × USD 100) y reciben su parte del fondo del 25% del excedente; la empresa recibe el 75%. Proyectos, participaciones y liquidaciones con datos simulados hasta que exista estructura legal habilitada. Se construye como producto serio, no como demo desechable (ADR-006).

Nombre comercial: **Club M²** · eslogan *"Juntos sumamos metros."* (ADR-003) → en código solo se usa `src/shared/config/brand.ts`. Nunca escribas el nombre a mano en otro archivo.

## Documentos (orden de lectura)
1. `docs/00-vision-y-alcance.md` — qué entra y qué no
2. `docs/01-arquitectura.md` — **ley** de capas, carpetas y convenciones
3. `docs/02-modelo-de-dominio.md` — glosario, fórmulas, casos canónicos
4. `docs/03-agentes-y-skills.md` — quién hace qué
5. `docs/04-workflow.md` — fases y ciclo por funcionalidad
6. `docs/05-revision-y-mejora.md` — Definición de Hecho y checklists
7. `docs/06-guia-de-contenido.md` — vocabulario permitido/prohibido
8. `docs/07-herramientas-de-terceros.md` · `docs/08-preguntas-por-funcionalidad.md`
9. `docs/referencia/modelo-negocio-club-inmobiliario.md` — documento maestro del negocio (fuente de verdad, **solo lectura**: un hook bloquea su edición)
10. `docs/estado.md` (tablero) · `docs/plantillas/` (brief, plan, entrega, informe) · `docs/decisiones/` (ADR)

## Reglas no negociables
1. **Nunca prometer rentabilidad fija, plazos ciertos ni seguridad.** Cifras futuras = "proyección" o "escenario". Usa la skill `copy-sin-promesas`.
2. **Capital · ganancia realizada · proyección** siempre separados y rotulados.
3. **"Participación económica"**, nunca "acción" ni "dueño".
4. **Un solo motor de cálculo** (`modules/finance`, `modules/projects`). Ninguna pantalla calcula dinero.
5. **Dinero en centavos** (`Money`), porcentajes en puntos básicos.
6. **Capas**: `domain` puro ← `application` (puertos) ← `infrastructure` (adaptadores) / `ui` (hooks) ← `app/` (solo composición). Entre módulos solo por `index.ts`. Ver tabla en `01-arquitectura.md §4`.
7. **Todo es simulado.** El cintillo fijo "Datos simulados" se retiró a pedido del usuario (ADR-011); la UI lo dice en el pie, el registro y las fichas. No presentes los proyectos de ejemplo como reales.
8. **Las ruedas (buena/media/mala) son internas**: solo existen en el backoffice. Nunca aparecen en la cara pública, del inversionista ni en marketing (ADR-004).

## Cómo trabajar
- Ciclo (skill `ciclo-funcionalidad`): Definir → Planificar (`arquitecto`) → Construir por paquetes (dominio → datos → UI, en paralelo si el plan fija contratos) → `verificar` (lo reejecuta el orquestador) → Revisar (`revisor-codigo` ∥ `revisor-cumplimiento`) → Corregir (máx. 2 rondas) → Integrar → Registrar en `docs/estado.md`.
- El agente principal es el **único orquestador** y el único que hace commits/merge. Los subagentes entregan con `docs/plantillas/entrega.md` o `informe-revision.md` y terminan en `ESTADO:` / `VEREDICTO:`.
- Tareas S (1–2 archivos, sin dinero ni copy de riesgo): hazlas directo, sin subagentes.
- **Diseño:** toda pantalla usa el lenguaje de la portada (ADR-010): `PageHeader` + `Section`s con tono de `@/shared/ui/layout`. Referencia: `modules/club/ui/components/landing/`; catálogo: `src/shared/ui/README.md`.
- Textos visibles en `src/modules/<m>/ui/copy.ts`; antes de entregar copy: `node scripts/check-copy.mjs <rutas>`.
- Al trabajar dentro de un módulo, su `src/modules/<m>/CLAUDE.md` manda sobre lo general en detalles locales.
- Lo que se repite 2+ veces en revisiones se convierte en lint, test o `check-copy`, no en más prosa.
- Cambias una decisión → skill `registrar-decision` (ADR) y actualiza el doc afectado en el mismo cambio.
- No inventes reglas de negocio: si el documento maestro dice "pendiente", muéstralo como "por definir" y agrega la pregunta a `docs/08-preguntas-por-funcionalidad.md`.
- Hallazgos menores o deuda → `docs/mejoras.md`.

## Convenciones rápidas
- Código en inglés; UI, docs y commits en español; URLs en español.
- `kebab-case.ts`, `PascalCase.tsx`, tests `*.test.ts` junto al archivo.
- Exportaciones nombradas; `export default` solo en `page.tsx`/`layout.tsx`.
- Commits: `feat(finance): …`, `fix(ui): …`, `docs: …`. Ramas `feat/<modulo>-<desc>`.

## Comandos (disponibles desde F1)
```
pnpm dev               # servidor local
pnpm verify:fast       # tsc + lint de capas
pnpm verify            # + vitest + playwright
pnpm vitest run <ruta>
pnpm playwright test --trace off
node scripts/check-copy.mjs [rutas]   # disponible ya en F0
```

## Estado actual
**F1 cerrada (tag `f1-fundacion-visual`) → F2 · Flujo del inversionista** (P1 landing ya hecha; sigue P2/P3 → P4 → P5 → P6 + P8) (orden de fases: ADR-007, `docs/planes/000-hoja-de-ruta.md`; prompt de arranque: `docs/prompts/F1-fundacion-visual.md`). Decisiones 🔴 respondidas el 22-nov (`docs/08` §Decisiones). Capa agéntica activa en `.claude/` (ADR-002, aceptado). El usuario trabaja **solo**: él aprueba merges y decisiones de producto. Siguiente fila: `docs/estado.md`.
