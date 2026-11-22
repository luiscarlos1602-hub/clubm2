# ADR-018 · Escrituras locales antes de Supabase
Estado: **aceptado** (decisión del usuario, 22-nov-2026: "Escrituras: local primero (demo-store), luego Supabase detrás de los mismos puertos", plan 010)
Fecha: 2026-11-22
Relacionado: ADR-001 (puertos y adaptadores), ADR-007 (lo modifica), ADR-014, ADR-015, ADR-016; `docs/planes/010-revision-y-plan-de-ejecucion.md`

## Contexto
ADR-014 adelantó Supabase para que el equipo suba inmuebles, pero hoy no existe **ninguna escritura**: no hay puertos ni casos de uso de mutación; todo el backoffice es maqueta (`MockAction`, `examples.ts`). Conectar Supabase antes de definir esas escrituras obligaría a diseñar a la vez el esquema, RLS, la sesión del equipo y los propios casos de uso, en el mismo árbol que el resto. Así se atascó la Etapa 0 (plan 010).

## Opciones consideradas
1. Supabase directo (plan 009 tal cual). Descartada: mezcla dos frentes y no se puede probar sin base de datos.
2. **Escrituras locales primero** (esta): puertos de escritura y casos de uso sobre `createDemoStore` (que ya tiene `update`/`write`), con una suite de contrato por repositorio; luego Supabase como otro adaptador que pasa la misma suite.
3. Quedarse en local indefinidamente. Descartada: contradice ADR-014.

## Decisión
Nuevo orden de trabajo, por etapas del plan 010:
- **Etapa 2 · Backoffice operable en local** (W-1 → W-2 → W-3 → W-5 → W-4 → W-6): puertos de escritura + contrato base; alta y edición de inmueble; cambio de etapa real; venta y liquidación; obra; reserva → portafolio en el navegador del inversionista. Puerta: `ciclo-completo.spec.ts` (crear un inmueble, avanzarlo hasta liquidar y verlo reflejado en la ficha y el portafolio tras recargar).
- **Etapa 3 · Supabase y login del equipo** (DB-1 → DB-4): dependencias y esquema; login del equipo y protección de `/admin`; RLS y Storage; adaptadores que pasan la suite de contrato. Requiere ADR-015 (aceptado el 22-nov) y S1–S9 (respondidas el 22-nov).
- **Etapa 4 · Despliegue y cierre**: Netlify (ADR-017) + CI mínimo; luego P2, P6/P8 restantes y lo que espera revisión legal.
- El inversionista sigue en modo demostración y sin datos personales en servidor (ADR-014).
- La política de pérdidas sigue abierta (`docs/08` O1/H2): W-5 no liquida con resultado negativo hasta decidirla.

## Consecuencias
- **ADR-007 queda modificado por ADR-014 y ADR-018**: Supabase y el login del equipo ya no esperan a F5, y el backoffice operable (F3) va antes que el resto de F2 (P2, P5, P6, P8). Su principio "lo visual y el flujo del negocio primero" y la regla de capas siguen vigentes. ADR-007 está aceptado y `proteger-fuentes.sh` impide editarlo: la constancia vive aquí y en `docs/planes/000-hoja-de-ruta.md`.
- Se actualizan en el mismo cambio `docs/planes/000-hoja-de-ruta.md` y `docs/00-vision-y-alcance.md` §4.
- Las filas W-1…W-6 y DB-1…DB-4 entran en `docs/estado.md`. Las filas B2–B5 de F3 quedan absorbidas por W-3…W-5 (las pantallas ya existen como maqueta, ADR-012/013); B1 se toca en W-6 y B6 (CRM) sigue pendiente después de la Etapa 2.
- `docs/planes/009-supabase.md` se recorta a lo que deje definido la Etapa 2 cuando empiece DB-1.
