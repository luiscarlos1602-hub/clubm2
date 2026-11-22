# modules/participations
Clase de participaciones (ref. 100 × USD 100) y tenencias de cada inversionista (F1-4). Mínimo: sin `ui/` hasta F2 (P5/P6).
- Importa solo de `projects` (orden de `architecture.modules.mjs`); `finance` NO importa de aquí.
- `HOLDING_LIMITS` 1–20 por inversionista y proyecto (D4); las confirmadas no pueden superar las colocadas.
- `infrastructure/` no importa otros módulos: `composition/demo-snapshot.ts` le pasa el contexto.
- Semillas con fechas relativas al Clock; sin cifras de dinero calculadas a mano.
