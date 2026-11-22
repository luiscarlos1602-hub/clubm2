---
name: cerrar-fase
description: Cierra una fase del proyecto (F1–F5) comprobando su puerta de salida, corriendo QA E2E, haciendo la mini-retro, aplicando mejoras a skills/lint y etiquetando. Úsala cuando todas las filas de la fase en docs/estado.md estén hechas o el usuario diga "cierra la fase".
---

# Cerrar fase

1. **Inventario**: en `docs/estado.md`, todas las filas de la fase `hecho` o movidas explícitamente a otra fase (con motivo).
2. **Verificar completo**: skill `verificar` modo completo. Todo verde o no se cierra.
3. **Puerta de salida**: la de la fase en `docs/04-workflow.md §1` (p. ej. F1: C1–C6 pasan; F2: cumplimiento sin 🔴). Comprueba cada punto con evidencia.
4. **QA**: lanza `qa-e2e` con la fase. Revisa `docs/qa/<fase>/informe.md`; 🔴/🟠 → vuelven al ciclo como funcionalidades `fix-<fase>-N`.
5. **Mini-retro** (escribe el resultado en `docs/mejoras.md`, sección "Retro <fase>"):
   - ¿Qué hallazgo se repitió 2+ veces en revisiones? → regla de lint o de skill (preferir lint).
   - ¿Qué tardó más de lo esperado y por qué? → ajusta el tamaño de paquetes o la lectura mínima de los agentes.
   - ¿Qué regla faltó o sobró? → edita la skill o `CLAUDE.md`. Si `CLAUDE.md` pasa de ~120 líneas, mueve detalle a `docs/` o al `CLAUDE.md` del módulo.
   - ¿Algún agente leyó de más o de menos? → ajusta su "Lectura mínima".
6. **Actualizar estado**: `CLAUDE.md` → "Estado actual" con la fase siguiente; `docs/estado.md` → fase cerrada con fecha.
7. **Tag**: `git tag f<N>-<nombre>`.
8. **Informe al usuario**: qué quedó, capturas clave (rutas en `docs/qa/`), supuestos que cambiaron, decisiones que necesitas para la fase siguiente.
