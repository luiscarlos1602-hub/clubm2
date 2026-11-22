# Plan NNN · <ID> · <título>

Estado: borrador | aprobado · Fecha: AAAA-MM-DD · Autor: arquitecto

## 1. Historia y criterios
<copiados del brief; los añadidos por el arquitecto marcados [PROPUESTO]>

## 2. Módulos afectados
| Módulo | Por qué | Nuevo |
|---|---|---|

## 3. Contratos (TypeScript)
```ts
// Tipos de dominio, puertos y firmas de casos de uso nuevos o modificados.
// Es el acuerdo entre paquetes: cambiarlo exige avisar al agente principal.
```

## 4. Paquetes
| # | Agente | Archivos (exclusivos) | Depende de | Paralelo con | Criterios |
|---|---|---|---|---|---|
| 1 | dominio-financiero | `src/modules/finance/domain/...` | — | 2 | CA1 |
| 2 | datos-demo | `src/modules/.../infrastructure/...` | contratos §3 | 1 | CA2 |
| 3 | constructor-ui | `src/modules/.../ui/...`, `src/app/...` | 1, 2 | — | CA3 |

## 5. Pruebas
- Dominio: <casos, incluidos bordes>
- E2E: <escenario y `data-testid` necesarios>

## 6. Riesgos, supuestos y preguntas
- …

## 7. ADR requerido
No | Sí → `docs/decisiones/ADR-NNN-...` (propuesto)
