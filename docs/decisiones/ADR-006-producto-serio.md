# ADR-006 · De demo de hackathon a producto

Estado: **aceptado** (decisión del usuario, 22-nov-2026)
Fecha: 2026-11-22

## Contexto
F0 se escribió para una demo de hackathon (jurado, 5 minutos, "modo hackathon"). El usuario decide trabajarlo como proyecto serio.

## Decisión
- La v1 es la plataforma de la **Etapa 1 del maestro** (comunidad y demanda, sin recibir inversiones), con calidad de producto.
- Se mantiene: datos simulados para proyectos y participaciones, banner de simulación, stack de ADR-001, arquitectura de puertos lista para Supabase.
- Se elimina el "modo hackathon" (`04 §2.2`): no se salta revisión para ir más rápido.
- F5 pasa a "Pulido y lanzamiento".

## Consecuencias
- Cuando el registro deba guardar leads reales (CRM de Etapa 1), se escribe el adaptador Supabase de `investors`/`crm` sin tocar dominio ni UI; requiere ADR propio (datos personales, aviso de privacidad).
