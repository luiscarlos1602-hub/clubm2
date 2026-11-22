## Informe · qa-e2e · Cierre F1

**Alcance revisado:** 14 rutas (P1–P8, B1–B6) + /sistema, a 390 y 1440 px, contra `pnpm dev` en :3000 (reutilizado). Rama real: `feat/club-landing` (el encargo decía main), árbol limpio. Capturas de página completa en `docs/qa/F1/ruta-*-{390,1440}.png` (más las de F1-5 ya existentes). Sin fase anterior para comparar.
**Verificación automática (salida real):** `pnpm playwright test --trace off` → 71 pasados, 0 fallidos, 11 omitidos (4 capturas ×2 anchos y un test solo-desktop/solo-móvil por proyecto; omisiones por diseño: capturas, `navegación desktop` en móvil, `menú Sheet` en desktop, `sin desplazamiento horizontal en móvil` en desktop). Barrido propio (spec temporal, eliminado) sobre 15 URLs × 2 anchos: 

| Criterio | Resultado |
|---|---|
| Carga 200 y un solo h1 | OK en las 15 URLs, ambos anchos |
| Desborde horizontal | Ninguno (scrollWidth = 390 / 1440) |
| console.error / pageerror | Ninguno |
| "rueda" en texto visible | Ninguna en cara pública, inversionista, admin ni /sistema |
| Cintillo fijo `demo-banner` | Ausente en las 14 rutas y /sistema (solo existe `demo-banner-inline` dentro de la muestra de avisos legales de /sistema, correcto) |
| /sistema | 9 bloques (h2) |
| Selector de rol, siguiente paso, Reiniciar datos simulados (confirmar/cancelar, conserva rol) | OK (specs navegacion, rutas, reiniciar-datos) |
| `lang=es`, títulos por ruta | OK |

**Recorridos dorados:** no ejecutables aún. Solo P1 está construida; P2–P8 y B1–B6 son `RoutePlaceholder` con estado vacío ("Pantalla de ejemplo: aún sin datos ni funciones reales"). Los clics encadenados de "siguiente paso" funcionan (visitante→portafolio y admin→portafolio). El "momento wow" (avance de obra → liquidación → portafolio actualizado) pertenece a fases posteriores.

### Hallazgos
| Sev. | Ubicación | Problema | Corrección propuesta |
|---|---|---|---|
| 🔴 | — | Ninguno. | — |
| 🟠 | `/proyectos` (P3), `/proyectos/m2-001` (P4) | Los proyectos de ejemplo no aparecen en ninguna pantalla: P3 dice "Aún no se muestran los proyectos simulados" con un botón "Ver un proyecto de ejemplo". Las 7 semillas M2-001…007 solo viven en localStorage. Esperado en F1 (skeleton), pero la demo no muestra nada que evaluar; el botón de P3 sugiere que hay proyecto al que ir y lleva a otro vacío. | Priorizar F2 (listado y ficha). Mientras tanto, nada que corregir en copy. |
| 🟠 | Hero P1 y CTAs ("Explorar proyectos de ejemplo", "Ver proyectos de ejemplo") | Llevan a pantallas vacías; primera impresión del jurado. | Aceptable en F1; cubrir en F2. |
| 🟡 | Todas las pantallas placeholder | Texto "…funciones reales" y "gasto real" (B3) son correctos, pero el empty-state de B3 usa "gasto real" fuera de contexto de simulación; revisar cuando se construya. | Anotar en `docs/mejoras.md`. |
| 🟡 | Esquina inferior izquierda | Insignia "N" de Next dev tapa contenido en capturas (solo dev; no existe en build). | Capturar con build de producción en cierres futuros. |
| 🟡 | Proceso | `docs/qa` no tenía spec de barrido propio; `rutas.spec.ts` solo verifica desborde en 390, no en 1440 (el barrido manual dio OK en 1440). | Extender `rutas.spec.ts` para comprobar scrollWidth en ambos anchos y console.error por ruta. |

**Presentación de ejemplos como reales:** sin hallazgos. P1 y el pie ("Plataforma en construcción: lo que ves es el mapa del producto. Todo el contenido es de ejemplo.", "Toda inversión puede sufrir pérdidas.") rotulan todo; P5 dice "Ninguna reserva de esta demo es una operación real"; cifras de P1 (25 %/75 %, USD 100) sin promesas de rendimiento ("No se garantiza ninguna de las dos"). Plazos como "proyección, no garantizada".

**Resumen:** 🔴 0 · 🟠 2 · 🟡 3

VEREDICTO: APROBADO
