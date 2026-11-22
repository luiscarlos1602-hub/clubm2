# 05 · Proceso de revisión y mejora continua

> Estado: **propuesta v0.2**. Los informes siguen `docs/plantillas/informe-revision.md`. Varios puntos de los checklists ya los comprueban herramientas (`01 §8.1`): el revisor confirma su salida y dedica su atención a lo que no se automatiza.

## 1. Definición de Hecho (DoD)

Una funcionalidad está hecha solo si:

- [ ] Cumple los criterios de aceptación de su historia.
- [ ] `tsc --noEmit` sin errores, ESLint (incluidas reglas de capas) sin errores.
- [ ] Lógica de dominio con tests; si toca `finance`, C1–C6 siguen pasando.
- [ ] Pantalla probada en 390 px y 1440 px, con estados vacío / cargando / error.
- [ ] Accesible: foco visible, labels en formularios, contraste AA.
- [ ] Copy revisado con `copy-sin-promesas`; cifras futuras etiquetadas como proyección.
- [ ] Datos semilla coherentes (test de consistencia verde).
- [ ] Sin `console.log`, sin `any`, sin TODO sin entrada en `docs/mejoras.md`.
- [ ] `node scripts/check-copy.mjs` con 0 errores sobre lo tocado.
- [ ] Fila actualizada en `docs/estado.md`; si el módulo aprendió una trampa, línea en su `CLAUDE.md`.

## 2. Severidades de revisión

| Severidad | Significado | Ejemplo | Acción |
|---|---|---|---|
| 🔴 Bloqueante | Rompe una regla no negociable | Texto "ganas 50%", cálculo de dinero en un componente, import entre capas prohibido, invariante del motor rota | No se integra hasta corregir |
| 🟠 Importante | Bug o deuda que se notará en la demo | Estado de error ausente, desborde en móvil | Se corrige en la misma funcionalidad |
| 🟡 Menor | Mejora de estilo o claridad | Nombre poco claro | Se corrige o va a `docs/mejoras.md` |

## 3. Checklist del `revisor-codigo`

1. **Capas**: ¿algún import viola la tabla de `01-arquitectura.md §4`? ¿`domain/` usa React, IO, `Date.now()`?
2. **API pública**: ¿se importa algo de otro módulo que no sea su `index.ts`?
3. **Dinero**: ¿todo monto es `Money` en centavos? ¿algún cálculo fuera de `finance`/`projects`?
4. **Correctitud**: casos borde (0 colocadas, excedente negativo, 100 colocadas, fechas límite de rueda 3 y 6 meses).
8. **Visibilidad**: ¿alguna pantalla de inversionista o pública importa `modules/*/backoffice` o muestra ruedas? (ADR-004)
5. **Simplicidad**: ¿hay abstracción sin segundo uso? ¿código duplicado que ya existe en `shared/`?
6. **Tests**: ¿prueban comportamiento y no implementación?
7. **UI**: Server vs Client component correcto, sin lógica en `page.tsx`.

## 4. Checklist del `revisor-cumplimiento`

1. ¿Alguna frase promete rendimiento, plazo o seguridad? (ver lista prohibida en `06-guia-de-contenido.md`)
2. ¿Capital, ganancia realizada y proyección aparecen separados y rotulados?
3. ¿Toda cifra futura dice "proyección" o "escenario"?
4. ¿Aparece alguna rueda (buena/media/mala) en una pantalla pública o de inversionista, en un correo o en marketing? Debe ser 🔴 (ADR-004).
5. ¿Se dice "participación económica", nunca "acción" ni "eres dueño"?
6. ¿El banner "Datos simulados" está visible?
7. ¿Hay escasez o presión falsa ("¡últimos cupos!", contadores de urgencia)?

## 5. Mejora continua

| Mecanismo | Cuándo | Qué se hace |
|---|---|---|
| `docs/mejoras.md` | Siempre | Backlog de mejoras, deuda y hallazgos menores con prioridad |
| Mini-retro de fase | Al cerrar cada fase | 3 preguntas: ¿qué falló en revisión más de una vez? ¿qué tardó más de lo esperado? ¿qué regla faltó? |
| Mejora de skills | Tras la retro | Si un error se repitió 2+ veces: primero intenta convertirlo en regla de lint, test o `check-copy`; si no se puede, regla en la skill o en el `CLAUDE.md` del módulo |
| ADR | Cuando cambia una decisión | Nunca se edita un ADR aceptado: se crea otro que lo reemplaza |
| QA visual | Cierre de fase | `qa-e2e` guarda capturas en `docs/qa/<fase>/` para comparar contra la anterior |

Límite de reintentos: si la misma verificación falla 3 veces, se detiene y se replantea (posible problema de diseño, no de implementación).
