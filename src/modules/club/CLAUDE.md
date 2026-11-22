# modules/club · contexto local

La cara pública del club: portada P1 (`ui/components/landing/`) y, en F4, El club P7 (eventos, academia, membresías como vitrina).

- Hoy solo tiene capa `ui`. `domain/`, `application/` e `infrastructure/` se crean con la skill `nuevo-modulo` cuando P7 tenga datos (eventos, academia).
- API pública: `index.ts` (`ClubLanding`). Nadie importa rutas internas.
- Puede importar de `projects`, `participations` y `finance` solo por su `index.ts` (orden en `architecture.modules.mjs`).
- Textos visibles: `ui/copy.ts`. Antes de entregar: `node scripts/check-copy.mjs src/modules/club`.
- La portada no calcula dinero: el reparto 25/75 se lee de `DEFAULT_DISTRIBUTION_SHARES` (`modules/finance`) y el precio de referencia es un literal de marketing (`REFERENCE_UNIT_PRICE`).
- Nada de ruedas, testimonios ni métricas inventadas (docs/08 C3–C4). Las cifras futuras van con `ProjectionLabel`.
- Ningún botón nombra una acción que la demo no ejecuta: «Ver cómo será el registro», no «Regístrate».
- Colores: Verde Profundo / Crema por bloques; Arena y Salvia como texto solo sobre Verde Profundo (ADR-009).
