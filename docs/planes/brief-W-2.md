# Brief · W-2 · Alta y edición de inmueble (backoffice, local)

## Historia
Como miembro del equipo quiero dar de alta un inmueble nuevo y editar uno existente desde el backoffice, en un asistente por pasos, para que quede guardado en el almacén local y, si está en una etapa publicable, aparezca en `/proyectos` y en su ficha pública sin tocar código.

## Criterios de aceptación (verificables)
- [ ] CA1 · `/admin/proyectos` lista todos los proyectos del almacén (incluidos los internos) con código, nombre, zona y etapa, y enlaces a "Nuevo inmueble" y "Editar".
- [ ] CA2 · `/admin/proyectos/nuevo` abre un asistente por pasos: inmueble → economía → presupuesto por rubros → participaciones → riesgos/proceso → imágenes → revisar y guardar/publicar. Patrón de `RegisterWizard`; React Hook Form + Zod.
- [ ] CA3 · Campos obligatorios según S4: **siempre** nombre, ciudad, zona (sin dirección exacta), tipo, m², etapa, compra C (u oferta en due diligence), venta objetivo P, costos de venta O y rubros que suman F. **Para etapa publicable** además: fecha de compra, descripción + 1–5 destacados, proceso de 6 etapas, clase de participación, los 3 riesgos comunes e imagen "antes" y "proyección".
- [ ] CA4 · F = total × precio de la participación (S5) y Σ rubros = F se validan al guardar, con el error junto al campo (`ProjectSheetField`).
- [ ] CA5 · Un único comando de dominio `buildProjectSheet` (plan 009 §3.1) reúne todos los errores; el caso de uso `saveProjectSheet` escribe por los puertos de W-1 sobre `createDemoStore`. Ninguna pantalla calcula dinero.
- [ ] CA6 · Código `M2-NNN` siguiente libre (`nextProjectCode`) y slug (`buildProjectSlug`); el prefijo sale de `brand.ts`.
- [ ] CA7 · Imágenes: se eligen entre las ilustraciones de `public/images/proyectos/` (rótulo "Imagen de referencia"); sin subida real (DB-3).
- [ ] CA8 · `/admin/proyectos/[id]/editar` carga la ficha (`getProjectSheet`) y guarda cambios; la etapa no se cambia aquí (eso es W-3: `STATUS_CHANGE_NOT_ALLOWED`).
- [ ] CA9 · Lo creado o editado **sobrevive a recargar** y un inmueble en etapa publicable aparece en `/proyectos` y en su ficha. Hook de mutación invalida TanStack Query (plantilla `use-reset-demo-data.ts`).
- [ ] CA10 · Suite de contrato del nuevo puerto (`ProjectSheetWriter` / media si aplica) escrita contra el puerto, reutilizable por Supabase (DB-4).
- [ ] CA11 · E2E del recorrido: crear inmueble publicable → aparece en `/proyectos` tras recargar → editarlo → el cambio persiste. 390 y 1440 px.
- [ ] CA12 · Textos en `ui/copy.ts`; `check-copy` limpio; ruedas no aparecen; lenguaje `PageHeader` + `Section`.

## Fuera de alcance
- Cambio de etapa (W-3), gasto de obra y avances (W-4), venta y liquidación (W-5), reservas (W-6).
- Subida real de imágenes, login del equipo, borrar proyectos (S8 → con Supabase).
- Supabase, server actions, dependencias nuevas.

## Decisiones y supuestos aplicados
- S4 · campos obligatorios (arriba). S5 · F = total × precio, se valida al guardar. S7 · límites de imagen aplican solo a la subida real (DB-3).
- Patrón técnico fijo del prompt E2: puerto → caso de uso con `Result` → mock sobre demo-store validado con `zod-schemas.ts` → suite de contrato → hook → pantalla.
- W-1 dejó en `docs/mejoras.md` [W-1]: F = total × precio entre clase y economía lo debe validar `buildProjectSheet`; `saveProjectEconomics` no es atómico en local (aceptado hasta DB-4).

## Lectura mínima
- `docs/planes/009-supabase.md` §3.0 (D6, D7, D10) y §3.1 (contratos `buildProjectSheet`, `ProjectImage`, `nextProjectCode`, `buildProjectSlug`).
- `docs/planes/010-revision-y-plan-de-ejecucion.md` §Etapa 2.
- `docs/prompts/E2-backoffice-local.md` (patrón y límites).
- `docs/01-arquitectura.md` §4 (capas, regla 2b para comandos entre módulos).
- Código de W-1: `src/modules/*/application/{ports.ts,*.contract.ts,save-*.ts}`.
