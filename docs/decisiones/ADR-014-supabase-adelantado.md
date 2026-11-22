# ADR-014 · Supabase como base de datos real, adelantado desde F5
Estado: **aceptado** (decisión del usuario, 22-nov-2026: "tenemos que crear toda la base de datos en supabase para poder hacer el proceso de subir los inmuebles")
Fecha: 2026-11-22
Relacionado: ADR-001 (puertos y adaptadores), ADR-006, ADR-007 (posponía Supabase a F5), ADR-012/013

## Contexto
La maqueta y P4 funcionan con semillas + `localStorage`. El usuario quiere que el backoffice suba y edite inmuebles/proyectos reales (con imágenes), lo que exige persistencia compartida.

## Decisión
- Proyecto Supabase `clubm2` (ref `qatwjyreqshiwtdkovbd`, us-east-1, org "Basik ads", USD 0/mes).
- Se implementan **adaptadores Supabase** de los mismos puertos de `application/ports.ts` (ADR-001 §7: cambiar a datos reales = otro adaptador + una línea en `composition/container.ts`). Dominio y UI no cambian.
- Esquema con migraciones versionadas en `supabase/migrations/`, RLS en todas las tablas, Storage para imágenes de proyectos.
- Escritura (subir/editar proyectos) solo para usuarios del equipo autenticados (Supabase Auth); lectura pública solo de lo publicable (sin ruedas: se calculan en el backoffice, nunca se exponen en vistas públicas — ADR-004).
- Los datos personales (reservas, leads, visitas) **no se guardan** hasta tener aviso de privacidad y base legal (F5-3 / M-009); hasta entonces esas acciones siguen simuladas.
- El modo demo (`localStorage`) se mantiene como adaptador alternativo para desarrollo y tests.

## Consecuencias
- Hace falta una variable de entorno por adaptador (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`; nunca la service role en el cliente) y la dependencia `@supabase/supabase-js` (+ `@supabase/ssr`), aprobadas con este ADR.
- Se reabre la pregunta de auth real (ADR-012 mantenía acceso de demostración): el acceso del **equipo** pasa a ser real; el del inversionista sigue de demostración hasta F5.
