# modules/participations

Clase de participaciones (ref. 100 × USD 100), tenencias de cada inversionista (F1-4) y vista del marketplace (P3).

- Importa solo de `projects` (orden de `architecture.modules.mjs`); `finance` NO importa de aquí.
- `HOLDING_LIMITS` 1–20 por inversionista y proyecto (D4); las confirmadas no pueden superar las colocadas.
- `infrastructure/` no importa otros módulos: `composition/demo-snapshot.ts` le pasa el contexto.
- Semillas con fechas relativas al Clock; sin cifras de dinero calculadas a mano.
- Marketplace (plan 005, D1): la tarjeta une proyecto + inmueble + clase y vive aquí porque es el módulo más a la izquierda que ve los tres. `domain/marketplace-listing.ts` (fase, orden P3-2, omisiones) y `domain/marketplace-filters.ts`; `application/list-marketplace.ts` lee los repositorios. La etapa pública sale siempre de `toPublicStage` de projects; nunca se lee `status` en la UI.
- Disponibles = total − colocadas solo con colocación abierta (`phase "open"`); en el resto, 0 (P3-3). `unitPrice` se pasa tal cual: aquí no se calcula dinero.
- Trampa de ciclo (R4): `index.ts` exporta UI que llega a `composition`. `composition/**` e `infrastructure/` importan de aquí solo por ruta interna o con `import type`, nunca valores desde `@/modules/participations`.
