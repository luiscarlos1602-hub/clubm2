# modules/projects

Proyecto, inmueble, estados con transiciones válidas y ruedas internas (ADR-004).

- `index.ts`: tipos, estados, `changeProjectStatus`, `checkProjectConsistency`. NUNCA exporta ruedas.
- `backoffice.ts`: `classifyWheel`, `classifyProjectWheel`. Solo lo importan `app/admin/**` y `ui/components/admin/**` (lint + `public-api.test.ts`).
- Bordes K2–K4 (3 y 6 meses desde la compra; fin de mes → último día del mes destino).
- Tabla única `PROJECT_TRANSITIONS`; `stalled` es estado interno: el inversionista ve "en venta" (L5).
- Cara pública (P3): `toPublicStage` (tabla `Record<ProjectStatus, PublicStage | null>`, `stalled → on_sale`) y `TARGET_TERM_MONTHS` (3, proyección; un test lo ata al umbral interno sin exponerlo).
- Sin `Date` en `domain/`: usa `Clock` y `IsoDate` de `shared/domain`.
- Puertos en `application/ports.ts`; `infrastructure/` (semillas y repos mock) no importa otros módulos: `composition/demo-snapshot.ts` le pasa el contexto.
- Ficha P4 (plan 006): `PropertyProfile` (descripción y destacados, sin dirección exacta), `ProjectProcess` (6 etapas en días tras la compra; `checkProjectProcess` + `toProcessTimeline`), `ProjectUpdate` (`sortUpdatesNewestFirst`) y `ProjectRisks` (solo claves; el texto vive en `finance/ui/copy`). Sin niveles ni puntuaciones.
- `isProjectSlug`: el servidor solo rechaza formatos inválidos (D4); si el slug existe lo decide el cliente. `getProjectProcess(code)` es la única fuente del tablero de proceso.
