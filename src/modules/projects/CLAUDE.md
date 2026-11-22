# modules/projects
Proyecto, inmueble, estados con transiciones válidas y ruedas internas (ADR-004).
- `index.ts`: tipos, estados, `changeProjectStatus`, `checkProjectConsistency`. NUNCA exporta ruedas.
- `backoffice.ts`: `classifyWheel`, `classifyProjectWheel`. Solo lo importan `app/admin/**` y `ui/components/admin/**` (lint + `public-api.test.ts`).
- Bordes K2–K4 (3 y 6 meses desde la compra; fin de mes → último día del mes destino).
- Tabla única `PROJECT_TRANSITIONS`; `stalled` es estado interno: el inversionista ve "en venta" (L5).
- Sin `Date` en `domain/`: usa `Clock` y `IsoDate` de `shared/domain`.
- Puertos en `application/ports.ts`; `infrastructure/` (semillas y repos mock) no importa otros módulos: `composition/demo-snapshot.ts` le pasa el contexto.
