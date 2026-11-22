# Prompt de arranque — Etapa 0 · Estabilizar

Pega esto como primer mensaje de una sesión nueva (una sola sesión abierta sobre esta carpeta).

---

Lee `docs/planes/010-revision-y-plan-de-ejecucion.md` completo antes de nada: es el plan vigente y manda sobre `docs/estado.md` y sobre la sección "Estado actual" de `CLAUDE.md`, que están desactualizados. No relances auditorías ni replanifiques: el diagnóstico ya está hecho.

Ejecuta solo la **Etapa 0 · Estabilizar**, sin subagentes y sin la skill `ciclo-funcionalidad`:

1. Corre `pnpm verify` y `pnpm build` sobre el árbol actual de la rama `feat/finance-ficha-interconectada`. Corrige únicamente lo que falle; no agregues funcionalidad ni refactors.
2. Descarta los cambios de `docs/qa/P3/*.png` (capturas regeneradas sin motivo).
3. Haz el commit de P4 en esta rama: `feat(finance): ficha interconectada con el motor (P4)` con `src/`, `tests/`, `docs/planes/006-P4-ficha-simulador.md` y `docs/planes/brief-P4.md`.
4. Separa lo que no es P4:
   - rama `docs/supabase-plan`: ADR-014, ADR-015, `docs/planes/009-supabase.md`, cambios de `docs/08-preguntas-por-funcionalidad.md`;
   - rama `chore/netlify`: `netlify.toml` y el cambio de `.gitignore`;
   - `docs/planes/010-revision-y-plan-de-ejecucion.md` y `docs/prompts/E0-estabilizar.md` van en un commit `docs:` propio.
5. Una sola pasada de `revisor-codigo` sobre el diff de P4. Corrige lo bloqueante (máximo una ronda).
6. Detente y pídeme aprobación antes de hacer merge a `main`, antes de borrar ramas y antes de cualquier `git push`.

Nota: el hook `.claude/hooks/post-edicion.sh` corre toda la suite de vitest del módulo en cada edición. Si te bloquea en un estado intermedio, no entres en bucle: termina el grupo de ediciones relacionadas y vuelve a verificar al final. Quitarlo es tarea de la Etapa 1, no de esta.

Hecho cuando: `pnpm verify` y `pnpm build` en verde, `git status` limpio, P4 commiteado y listo para merge. Termina con un resumen de qué falló, qué corregiste y qué queda para mi aprobación. No empieces la Etapa 1.
