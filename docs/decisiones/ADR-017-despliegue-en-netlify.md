# ADR-017 · Despliegue en Netlify
Estado: **aceptado** (decisión del usuario, 22-nov-2026: "Despliegue: Netlify", plan 010)
Fecha: 2026-11-22
Relacionado: ADR-001, ADR-007 (punto de despliegue), ADR-015; `netlify.toml`

## Contexto
Los documentos dan Vercel como hosting (respuesta B5 de `docs/08`, `00-vision` S6, ADR-007, hoja de ruta, plan 009). F1-6 nunca llegó a desplegar en Vercel (sin CLI y el usuario cerró F1 sin desplegar). Mientras tanto se preparó `netlify.toml` (rama `chore/netlify`, integrada el 22-nov) y el usuario eligió Netlify en la revisión del plan 010.

## Opciones consideradas
1. Vercel (lo documentado). Sin cuenta enlazada ni despliegue hecho.
2. **Netlify** (esta). Ya hay configuración en el repo; Next.js 16 corre con el adaptador OpenNext que Netlify instala solo.
3. Hosting propio. Descartado: más trabajo de operación sin beneficio en v1.

## Decisión
- El destino de despliegue es **Netlify**: producción desde `main`, preview por rama (deploy previews).
- Configuración en `netlify.toml`: `pnpm build`, publicación de `.next`, Node 22 y `LEFTHOOK=0` para que el build no ejecute hooks de git.
- Las variables de entorno (`NEXT_PUBLIC_DATA_SOURCE`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) se cargan en el panel de Netlify; ninguna clave va al repo.
- Sustituye la parte de despliegue de ADR-007 ("desplegado en Vercel"); el resto de ADR-007 sigue vigente (ver ADR-018).

## Consecuencias
- Se corrige Vercel → Netlify en `00-vision-y-alcance.md` (§4 y §6), `01-arquitectura.md`, `04-workflow.md`, `07-herramientas-de-terceros.md`, `estado.md` (F1-6, F5-1), `planes/000-hoja-de-ruta.md`, `planes/009-supabase.md` (variables, redirect URLs, S9) y `mejoras.md`.
- ADR-007 está aceptado y el hook `proteger-fuentes.sh` impide editarlo: la constancia de que su punto de despliegue queda sustituido vive aquí y en la hoja de ruta.
- Las menciones a Vercel que quedan en docs son históricas (respuesta B5 original, prompts y planes ya ejecutados de F1) y se anotan como reemplazadas.
- El CI mínimo de la Etapa 4 (GitHub Actions) no depende del hosting.
