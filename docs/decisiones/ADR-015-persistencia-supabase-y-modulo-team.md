# ADR-015 · Cómo se conecta Supabase: escrituras bajo RLS, módulo `team` y `proxy`
Estado: propuesto
Fecha: 2026-11-22
Relacionado: ADR-001, ADR-004, ADR-012, ADR-014; plan `docs/planes/009-supabase.md`

## Contexto
ADR-014 decide usar Supabase con adaptadores de los puertos existentes. Para implementarlo hay que fijar piezas que `docs/01` no prevé: dónde vive la sesión del equipo, cómo se protege `/admin` en Next 16 (`proxy.ts` reemplaza a `middleware`; `cacheComponents: true` obliga a envolver en `<Suspense>` toda lectura de `cookies()`), por dónde pasan las escrituras y cómo se oculta el estado interno `stalled` (ADR-004, L5) cuando RLS filtra filas y no columnas.

## Opciones consideradas
1. **Server Actions + cliente de servidor con cookies** para escrituras; lectura en el navegador. Requiere que `app/` importe acciones de `composition` (hoy prohibido), choca con el límite de 1 MB del cuerpo de una Server Action para imágenes y obliga a `<Suspense>` en `/admin`.
2. **Escrituras desde el navegador con la sesión del miembro, RLS como única barrera** (esta). El container de cliente ya existe; las imágenes suben directo a Storage.
3. Service role en el servidor para escrituras privilegiadas. Descartada: un secreto más que proteger y RLS dejaría de ser la regla.

## Decisión
- Opción 2. Sin Server Actions ni service role en v1; la semilla y las migraciones las aplica el orquestador por el MCP de Supabase.
- Nuevo módulo **`team`** (sesión y rol del equipo: `admin` | `editor`), primero en `architecture.modules.mjs`; no importa otros módulos.
- Nuevo elemento de capas **`proxy`** (`src/proxy.ts`): solo importa `shared/infrastructure` y `shared/config`; refresca la sesión y redirige `/admin/**` sin sesión de equipo (comodidad; la seguridad es RLS).
- Carpeta raíz **`supabase/`**: `migrations/NNNN_*.sql` (fuente de verdad; nunca se edita una migración aplicada) y `seed.sql` generado desde las semillas TS.
- `projects.status` nunca guarda `stalled`; la demora interna vive en `project_internal_flags` (solo equipo) y el adaptador la traduce. Lo interno siempre en tablas propias, nunca en columnas de tablas públicas. Ruedas y márgenes no se guardan.
- `NEXT_PUBLIC_DATA_SOURCE=demo|supabase` (por defecto `demo`; tests siempre `demo`) decide el backend en una sola línea de `composition/container.ts`.

## Consecuencias
- `docs/01` se actualiza al aceptar: §1 (fila Datos), §3 (árbol: `supabase/`, `modules/team`, `src/proxy.ts`), §4 (orden con `team` y fila `proxy`), §6–§7; `eslint.config.mjs` gana el elemento `proxy`.
- Cuando los inversionistas tengan cuentas (F5) RLS ya distingue equipo de no equipo por filas; no hay que rehacer políticas.
- Se revisa la opción 1 si se necesita auditoría en servidor, SSR de datos o tareas privilegiadas.
