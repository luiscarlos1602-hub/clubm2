# 04 · Workflow de desarrollo

> Estado: **v0.3** (ADR-002, aligerado por ADR-016). El ciclo de §2 lo ejecuta la skill `ciclo-funcionalidad`; el cierre de fase, `cerrar-fase`. El avance vive en `docs/estado.md`.

## 1. Fases del proyecto

| Fase | Objetivo | Entregable | Puerta de salida |
|---|---|---|---|
| **F0 · Fundamentos** ✅ | Docs, agentes, skills, decisiones | `docs/` + `.claude/` + `CLAUDE.md` | Decisiones 🔴 respondidas (22-nov) |
| **F1 · Fundación visual** | Andamiaje, design system Club M² (`/sistema`), motor de reparto, semillas, 14 rutas navegables | App navegable desplegada en Vercel | `verify` verde · C1–C6 · `/sistema` aprobado por el usuario |
| **F2 · Flujo del inversionista** | P1 → P2 → P3 → P4 → P5 → P6 + P8 | Recorrido visitante → inversionista → portafolio | E2E inversionista · cumplimiento sin 🔴 |
| **F3 · Flujo operativo** | B2, B6 → B3 → B4 → B5 → B1 | Backoffice que alimenta la cara del inversionista | E2E admin con el "momento wow" |
| **F4 · Club y pulido** | P7, fotografía, microinteracciones, AA, rendimiento, SEO | Producto pulido | Auditoría AA · Lighthouse ≥ 90 móvil |
| **F5 · Lanzamiento** | Dominio, producción, recorrido de 5 min, leads reales (M-009) | URL pública `clubm2.com` | Ensayo completo sin errores |

Detalle por fila: `docs/planes/000-hoja-de-ruta.md` (ADR-007).

Orden de valor (si hay que recortar alcance de una fase): F2 ficha + simulador > F3 portafolio > F4 finanzas/liquidación > resto del backoffice > club.

## 2. Ciclo por funcionalidad

```
1. Definir ──► 2. Planificar ──► 3. Construir ──► 4. Verificar ──► 5. Revisar ──► 6. Corregir ──► 7. Integrar ──► 8. Registrar
```

| Paso | Quién | Qué | Salida |
|---|---|---|---|
| 1. Definir | Tú + agente principal | Historia: "Como inversionista quiero… para…" + criterios de aceptación. Preguntas abiertas de `08-preguntas-por-funcionalidad.md` resueltas | Entrada en el plan de fase |
| 2. Planificar | `arquitecto` (solo L); en M el agente principal si hace falta | Módulos, archivos, puertos, casos de uso, riesgos | `docs/planes/NNN-*.md`, **máximo 150 líneas**. Si cambia arquitectura → ADR |
| 3. Construir | Orden **obligatorio**: dominio (domain + tests) → datos (semillas) → UI (hooks + componentes + ruta). En S/M lo hace el agente principal; en L, `dominio-financiero` → `datos-demo` → `constructor-ui` | Código | Al cerrar cada paquete: `verify:fast` + vitest del módulo |
| 4. Verificar | **Agente principal** (orquestador), con skill `verificar` en modo completo, **una vez por funcionalidad**; nunca se acepta el autorreporte del constructor | tsc, lint de capas, vitest, e2e | Todo verde o no se pasa al 5 |
| 5. Revisar | **Un revisor por cambio**: `revisor-codigo`; `revisor-cumplimiento` solo si hay copy nuevo (en L pueden ir los dos en paralelo) | Informe con severidades | Ver `05-revision-y-mejora.md` |
| 6. Corregir | Quien construyó (agente principal o constructor original en L) | Resolver bloqueantes e importantes | Re-verificar solo lo que falló |
| 7. Integrar | Agente principal | **Una rama y un commit por fila** del tablero, merge a `main` con aprobación del usuario | |
| 8. Registrar | Agente principal | Actualizar `docs/estado.md` (toda sesión termina así), `docs/mejoras.md` y, si se aprendió algo, la skill o `CLAUDE.md` | |

Tamaños (ADR-016):
- **S** (1–2 archivos, sin dinero ni copy de riesgo): sin paso 2; el paso 5 lo hace el agente principal con el checklist y `check-copy`.
- **M**: el agente principal construye sin subagentes; un revisor.
- **L**: subagentes constructores y `arquitecto`; los únicos casos con trabajo en paralelo.

El hook `post-edicion.sh` solo corre `check-copy`, prettier y eslint; los tests no se ejecutan en cada edición.

Puertas (las aplica el orquestador leyendo la última línea de cada entrega):

| Después de | Avanza si | Si no |
|---|---|---|
| 2 · Planificar | `ESTADO: HECHO` y sin ADR/decisión de producto pendiente | Pregunta al usuario |
| 3 · Construir | Todos los paquetes `ESTADO: HECHO` | `BLOQUEADO` técnico → lo resuelve; de producto → pregunta |
| 4 · Verificar | `verificar` en verde, ejecutado por el orquestador | Se corrige con la salida real (máx. 3 intentos) |
| 5 · Revisar | El revisor (o ambos en L) `VEREDICTO: APROBADO` | Paso 6; máx. 2 rondas, luego replantear con el usuario |

## 2.1 Mapa de paralelismo

Solo aplica a funcionalidades **L**. Construir en paralelo solo es seguro si los contratos (tipos y puertos) están fijados y cada paquete tiene **archivos exclusivos**. El tablero (`docs/estado.md`, columna "Paralelo con") marca qué puede ir a la vez:

| Fase | En paralelo | En serie |
|---|---|---|
| F1 | F1-2 ∥ F1-3 | F1-1 → … → F1-4 → F1-5 · F1-6 cuando exista F1-1 |
| F2 | P1 ∥ P2 ∥ P3 · P8 libre | P3 → P4 → P5 → P6 |
| F3 | B2 ∥ B6 | → B3 → B4 → B5 → B1 |
| F4 | P7 ∥ pulido | — |

Mecánica: el orquestador lanza los subagentes en el mismo mensaje con aislamiento `worktree` (una rama por paquete) e integra en orden. Si hay una sola persona revisando, más de 3 paquetes a la vez no acelera: el cuello de botella pasa a ser tu revisión.

## 2.2 Trabajo con una sola persona (decisión B4, 22-nov)

- Tú eres dueño de producto **y** único revisor humano: los agentes revisores hacen la revisión técnica; tú apruebas el plan de las funcionalidades L, las decisiones de producto y el merge a `main`.
- Máximo 3 paquetes en paralelo: más no acelera porque tu atención es el cuello de botella.
- Ramas cortas (`feat/<modulo>-<desc>`), una por funcionalidad, merge en cuanto pasa la revisión. `main` siempre desplegable en Vercel.
- Ritmo de producto, no de hackathon: no se salta la revisión para ir más rápido, pero basta un revisor por cambio (ADR-016).
- **Una sola sesión escribiendo por carpeta**: dos sesiones en el mismo árbol ya rompieron el tablero (retro F1, plan 010).

## 3. Git

- Ramas: `main` (siempre demostrable) · `feat/<modulo>-<descripcion>` · `fix/<descripcion>` · `docs/<tema>`.
- Commits en español, estilo Conventional Commits: `feat(finance): motor de reparto 25/75 con casos canónicos`.
- Un commit por fila del tablero, que pasa `verificar`. Los docs y la configuración pueden ir en commits propios (uno por ADR con sus documentos).
- Tag al cerrar cada fase con el nombre de la fase: `f1-fundacion-visual` (hecho), `f2-flujo-inversionista`, `f3-flujo-operativo`…

## 4. Comunicación contigo

- Al cerrar cada fase te envío: qué quedó, capturas, qué cambió en supuestos, y qué necesito que decidas.
- Decisiones que cambian el producto (pantallas, fórmulas, textos de riesgo, nombre) → te pregunto antes.
- Decisiones técnicas internas reversibles → las tomo, las registro en un ADR y te aviso.
