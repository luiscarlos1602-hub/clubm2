# Prompt de arranque — Etapa 1 · Poner la casa en orden

Pega esto como primer mensaje de una sesión nueva (una sola sesión abierta sobre esta carpeta).

---

Lee `docs/planes/010-revision-y-plan-de-ejecucion.md` completo: es el plan vigente y manda sobre `docs/estado.md` y sobre "Estado actual" de `CLAUDE.md`, que siguen desactualizados (arreglarlos es parte de esta etapa). No relances auditorías ni replanifiques.

**Punto de partida (verificado el 22-nov-2026):** la Etapa 0 está hecha. `main` contiene P4 (`4b72ce3`) y el árbol está limpio. Quedan sin integrar las ramas `docs/supabase-plan` (ADR-014, ADR-015, plan 009, cambios de `docs/08`) y `chore/netlify` (`netlify.toml`, `.gitignore`), y sin borrar las ramas viejas `feat/app-andamiaje`, `feat/club-landing`, `feat/finance-ficha-interconectada`, `feat/maqueta-ajustes`, `feat/participations-ficha-simulador`, `feat/projects-marketplace`.

Ejecuta solo la **Etapa 1**. Es trabajo de documentación y configuración: sin subagentes, sin la skill `ciclo-funcionalidad`, sin tocar `src/`. Trabaja en una rama `docs/etapa-1-orden`.

## Orden de trabajo

0. **Integrar lo pendiente.** Pídeme aprobación y luego haz merge a `main` de `docs/supabase-plan` y `chore/netlify` (los ADR nuevos dependen de que ADR-014 y `netlify.toml` estén en `main`). Con mi aprobación, borra las seis ramas viejas, comprobando antes con `git branch --merged main` que están integradas.

1. **Decisiones mías, en una sola tanda al inicio.** Antes de escribir nada, pregúntame de una vez (con opciones y tu recomendación):
   - S1–S9 de `docs/planes/009-supabase.md` §6;
   - Q5 y Q6 de `docs/08-preguntas-por-funcionalidad.md`;
   - política de pérdidas y orden de cobro (O1/H2, M-001);
   - si apruebo ADR-015.
   Lo que yo deje sin responder se registra como "por definir"; no inventes reglas de negocio.

2. **ADR-016 · Proceso aligerado** (skill `registrar-decision`) y aplicarlo en el mismo cambio:
   - `.claude/hooks/post-edicion.sh`: quitar la ejecución de `vitest`; dejar prettier y eslint.
   - `.claude/skills/ciclo-funcionalidad/SKILL.md` y `docs/04-workflow.md`: subagentes solo para tamaño L; un solo revisor por cambio (`revisor-cumplimiento` solo si hay copy nuevo); planes de máximo 150 líneas; verificación completa una vez por funcionalidad; una rama y un commit por fila del tablero; una sola sesión por carpeta. Resolver de paso la contradicción de `04-workflow.md` sobre quién verifica y los nombres de tags viejos.

3. **ADR-017 · Despliegue en Netlify**: corregir Vercel → Netlify en `docs/00-vision-y-alcance.md` §6, `docs/estado.md` (F1-6, F5-1), `docs/planes/000-hoja-de-ruta.md` y `docs/planes/009-supabase.md`.

4. **ADR-018 · Escrituras locales antes de Supabase**: registra el orden Etapa 2 (W-1…W-6 sobre el demo-store) → Etapa 3 (DB-1…DB-4). Actualiza `000-hoja-de-ruta.md` y `00-vision-y-alcance.md` §4, y deja constancia de que ADR-007 queda modificado por ADR-014 y ADR-018.

5. **Tablero y estado.**
   - `docs/estado.md`: P4 hecho con su commit; filas nuevas W-1…W-6 y DB-1…DB-4 tal como las define el plan 010; corregir el texto viejo de F1-1; mover F5-3.
   - `CLAUDE.md` §"Estado actual" y el paso 1 de "Arranque de cada sesión" (que apunte al plan 010 además del tablero).
   - `docs/mejoras.md`: cerrar M-003, M-004 y M-005.

6. **Recortar `docs/planes/006-P4-ficha-simulador.md`** a un resumen de lo entregado (máximo 80 líneas) y corregir su cabecera contradictoria.

7. **Registrar mis respuestas** del paso 1 en `docs/08-preguntas-por-funcionalidad.md` y, si aprobé ADR-015, cambiar su estado.

## Límites

- El hook `proteger-fuentes.sh` bloquea editar ADR aceptados y el documento maestro. Si te impide marcar ADR-007, no lo rodees: deja la constancia en ADR-018 y en la hoja de ruta, y avísame.
- No instales dependencias, no crees `supabase/`, no toques `src/`.
- Pídeme aprobación antes de cada merge a `main`, de borrar ramas y de cualquier `git push`.
- Commits pequeños y separados: uno por ADR con sus documentos, uno para tablero y `CLAUDE.md`, uno para el recorte del plan 006.

## Hecho cuando

- `pnpm verify:fast` en verde y `git status` limpio.
- Editar un archivo de `src/modules/finance` ya no dispara vitest.
- `docs/estado.md` y `CLAUDE.md` coinciden con `git log`.
- No queda ninguna mención a Vercel como destino de despliegue en `docs/`.

Termina con un resumen de lo que cambió, lo que quedó "por definir" y lo que espera mi aprobación. No empieces la Etapa 2.
