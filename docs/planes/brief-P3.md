# Brief · P3 · Marketplace de proyectos

## Historia
Como visitante o inversionista quiero ver la lista de proyectos del club, con su etapa, las participaciones disponibles y el plazo objetivo como proyección, y filtrarla, para elegir cuál abrir.

## Criterios de aceptación (verificables)
- [ ] CA1 · `/proyectos` (zona inversionista; accesible para visitante, M1) lista los proyectos **publicables** leídos del container (repositorios mock, semillas M2-001…006). M2-007 (due diligence) **no** aparece (N7).
- [ ] CA2 · Cada tarjeta muestra: sello `M2-00X` (`ProjectSeal`), nombre, zona (y ciudad, "Caracas · El Hatillo"), etapa pública (`StatusBadge`), participaciones disponibles "N de 100" (derivadas de la clase y colocadas, fórmula de `docs/06`), precio por participación "Desde USD 100", plazo objetivo como **proyección no garantizada** (`ProjectionLabel`) y el aviso de riesgo cercano ("Toda inversión puede sufrir pérdidas.").
- [ ] CA3 · **Ninguna rueda ni "estancado"** en la UI: la etapa pública sale de un mapeo estado → etapa visible (L5: `stalled` → "en venta") definido en `modules/projects/index.ts` con test; M2-002 (250 días en venta) no muestra "días sin vender" ni colores de alerta.
- [ ] CA4 · Proyectos liquidados se muestran como "Finalizado" con rótulo claro de histórico; no hay cifras de ganancia en la tarjeta (eso es P4/P6) y nunca una proyección mayor que el capital.
- [ ] CA5 · Filtros por etapa (todas · abiertos a participar · en obra · en venta · finalizados) y por zona/ciudad; estado vacío de marca cuando el filtro no devuelve nada; estados de carga (skeleton) y error con `ErrorState`.
- [ ] CA6 · Cada tarjeta enlaza a `/proyectos/<slug>` (P4, aún placeholder); el slug sale de los datos (`m2-001-…`), y el `siguiente-paso` del shell sigue funcionando.
- [ ] CA7 · Ninguna pantalla calcula dinero: cualquier cifra sale de los módulos o es formateo (`formatMoney`). Dirección exacta nunca (D6).
- [ ] CA8 · Lenguaje visual ADR-010 (`PageHeader` + `Section`s con tonos, piezas de `@/shared/ui/layout`), responsive 390/1440, sin colores de marca a mano; copy en `modules/<m>/ui/copy.ts` y `node scripts/check-copy.mjs` en verde; sin cintillo de datos simulados (ADR-011).
- [ ] CA9 · `data-testid` estables; E2E en 390 y 1440 (lista, filtros, tarjeta → ficha, M2-007 ausente, sin "rueda", reiniciar datos mantiene la lista); `pnpm verify` y `pnpm build` verdes; `src/architecture-rules.test.ts` sigue verde.

## Fuera de alcance
- Ficha de proyecto y simulador (P4), reservar (P5), portafolio (P6). Fotografía real (F4-2): usar `BrandSymbol`/sello como imagen de la tarjeta.
- Búsqueda de texto libre, orden configurable, paginación (7 proyectos).
- Backoffice (B-x) y cualquier uso de `backoffice.ts`.

## Decisiones y supuestos aplicados
- D2/N7: 7 semillas; M2-007 solo en backoffice. D6: sin dirección exacta. D4: 1–20 por persona (no se usa aquí).
- M1: el visitante ve marketplace y fichas sin registrarse.
- L5: `stalled` nunca visible; el inversionista ve "en venta".
- [SUPUESTO P3-1] "Abiertos a participar" = estado `funding` con `placed < total`.
- [SUPUESTO P3-2] El orden por defecto es: abiertos a participar, en obra, en venta, finalizados; dentro de cada grupo por fecha de compra descendente.
- Capas (`docs/01 §4`, orden `projects → participations → finance → … → club`): la tarjeta necesita datos de `projects` y de `participations`; un módulo no puede importar de otro a su derecha. El arquitecto decide dónde vive la composición de vista (p. ej. en `participations/ui` que sí puede importar `projects`, o un módulo/lector de vista) y lo justifica; no se rompe ninguna regla de capas ni se toca `eslint.config.mjs`.

## Lectura mínima
- `docs/00 §3` (P3), `docs/01 §4/§8`, `docs/02 §2`, `docs/06` (avisos, vocabulario), ADR-004, ADR-010, ADR-011
- `src/shared/ui/README.md`, `src/modules/*/CLAUDE.md`, `src/composition/container.ts` y `demo-snapshot.ts`, `src/modules/*/application/ports.ts`
- `src/shared/ui/app-shell/route-map.ts` (ruta p3) y `src/app/(inversionista)/proyectos/page.tsx`
