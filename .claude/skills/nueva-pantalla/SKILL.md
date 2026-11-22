---
name: nueva-pantalla
description: Crea una pantalla de la demo (ruta en src/app y componentes en modules/<m>/ui) con el checklist de calidad visual, estados, accesibilidad y copy.
---

# Nueva pantalla

1. Ubica la ruta en el grupo correcto: `(publico)`, `(inversionista)` o `admin/`.
2. `page.tsx`: solo importa y compone componentes del módulo (< 60 líneas). Metadata con título en español.
3. Componentes en `modules/<m>/ui/components/<Nombre>.tsx`; datos vía hook `modules/<m>/ui/hooks/use<Algo>.ts` que llama casos de uso del container.
4. Textos en `modules/<m>/ui/copy.ts`; avisos fijos importados de `shared/ui/brand/legal-copy.ts`.
5. **Lenguaje visual de la portada (ADR-010):** compón la pantalla con `PageHeader` (oscuro, único h1) y `Section`s de `@/shared/ui/layout` que alternan tono (`light` · `paper` · `sand` · `dark`); tarjetas con `Surface`, rótulos con `Eyebrow`, numeración con `IndexLabel`, listas con `BulletList`. Referencia: `modules/club/ui/components/landing/`. Sin colores de marca a mano en el módulo.
6. Reutiliza `shared/ui` antes de crear nada (catálogo en `src/shared/ui/README.md`). Montos con `MoneyDisplay`, cifras futuras con `ProjectionLabel`, estados con `StatusBadge`.
7. Checklist antes de entregar:
   - [ ] Móvil 390 px y desktop 1440 px sin desbordes.
   - [ ] Lenguaje de la portada: `PageHeader` + `Section`s con tono; lo que pide atención (riesgos, cifras clave, cierre) en `dark`; un botón principal por banda; ningún `bg-verde-profundo`/`text-crema`/`border-arena` a mano.
   - [ ] Estados: cargando (skeleton), vacío, error.
   - [ ] Foco visible, labels, contraste AA, navegable con teclado.
   - [ ] Copy revisado con `copy-sin-promesas`.
   - [ ] Banner de demo visible (lo pone el layout raíz).
   - [ ] Sin cálculos de dinero en el componente.
   - [ ] `data-testid` en los elementos que usa el E2E.
   - [ ] `node scripts/check-copy.mjs` sobre el módulo: 0 errores.
8. Corre `verificar`.
