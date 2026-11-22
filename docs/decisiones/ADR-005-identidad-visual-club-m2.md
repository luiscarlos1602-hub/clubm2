# ADR-005 · Identidad visual y tono de Club M²

Estado: **reemplazado por ADR-009** en paleta, tipografía y logo (22-nov-2026). Tono y estados siguen vigentes.
Fecha: 2026-11-22
Relacionado: ADR-003 (nombre y eslogan, del hilo de marketing)

## Contexto
La v0.1 de producto usaba un placeholder negro + dorado. `marketing/02-branding.md` propuso la identidad "cal y arcilla", tipografía y tono, como propuesta pendiente.

## Decisión
Se adopta completa la referencia de `marketing/`:
- **Paleta** "cal y arcilla": Cal `#F4EFE6`, Grafito noche `#16181A`, Verde Ávila `#1F3A33`, Arcilla `#9A4529` (CTA), Arcilla clara `#B5573A`, Latón `#B8935A` (detalle; el "²"), Piedra `#6B655C`. Contrastes AA de `marketing/02`.
- **Tipografía:** Fraunces (títulos), Inter (texto e interfaz, cifras tabulares), IBM Plex Mono (códigos `M2-001` y fechas).
- **Tono:** anfitrión sabio, transparente; tuteo ("usted" en contratos y asesoría de tickets altos).
- **Estados:** nunca rojo/verde de bolsa. Como las ruedas son internas (ADR-004), sus colores solo se usan en el backoffice.

## Consecuencias
- F1-6 implementa estos valores como tokens de Tailwind v4 (`globals.css` `@theme`) y `brand.ts` (nombre/eslogan según ADR-003).
- Fuente de verdad visual: `marketing/02-branding.md`; si cambia, cambian los tokens en el mismo commit.
