# Catálogo de `shared/ui`

Importa los componentes de marca desde `@/shared/ui/brand`. Las primitivas de shadcn viven en `@/shared/ui/primitives/*` y solo usan variables semánticas (`bg-primary`, `text-muted-foreground`…) o tokens de marca (`bg-cal`, `border-laton`…). Todos los componentes de marca son Server Components, aceptan `className` y `data-testid`, y ninguno calcula dinero.

## Componentes de marca (`src/shared/ui/brand/`)

### MoneyDisplay
- Archivo: `MoneyDisplay.tsx`
- Cuándo usarlo: toda cifra de dinero visible.
- Props clave: `value` (`{cents, currency}`), `kind` (`capital` · `realized` · `projection` · `amount`), `label?`, `size?` (`sm`–`xl`), `decimals?`.
- No usar para: calcular o convertir montos (eso lo hace `modules/finance`). `kind="projection"` siempre trae `ProjectionLabel`; no hay forma de quitarlo.

### ProjectionLabel
- Archivo: `ProjectionLabel.tsx`
- Cuándo usarlo: junto a cualquier cifra o texto futuro que no sea un `MoneyDisplay` (plazos, escenarios).
- Props clave: `children?`, `placement?` (`below` · `inline`). El texto es fijo (`LEGAL_COPY.projectionTag`).
- No usar para: cifras ya realizadas.

### StatusBadge
- Archivo: `StatusBadge.tsx`
- Cuándo usarlo: estado o etapa de un proyecto, participación o liquidación.
- Props clave: `tone` (`positive` · `in-progress` · `attention` · `neutral`), `label` (lo da el `copy.ts` del módulo).
- No usar para: decidir el estado (no conoce las etapas del dominio) ni mostrar ruedas.

### DemoBanner
- Archivo: `DemoBanner.tsx`
- Cuándo usarlo: franja fija en los layouts de zona (`bar`) o recuadro dentro de una vista (`inline`).
- Props clave: `variant?`. Texto fijo (`LEGAL_COPY.demoBanner`).
- No usar para: avisos de riesgo (usa `LegalNotice`).

### ProjectSeal
- Archivo: `ProjectSeal.tsx`
- Cuándo usarlo: identificar un proyecto (`M2-001`) con su fecha de compra.
- Props clave: `code`, `date` (ISO `YYYY-MM-DD`), `dateLabel?`, `size?`.
- No usar para: texto corrido; el Latón solo va en el borde.

### SectionHeading
- Archivo: `SectionHeading.tsx`
- Cuándo usarlo: encabezado de página o sección.
- Props clave: `title`, `eyebrow?`, `description?`, `level?` (1–3), `align?`, `id?`.
- No usar para: títulos dentro de tarjetas (usa `CardTitle`).

### EmptyState
- Archivo: `EmptyState.tsx`
- Cuándo usarlo: una lista o vista sin datos.
- Props clave: `title`, `description?`, `icon?`, `action?`.
- No usar para: errores (usa `ErrorState`).

### ErrorState
- Archivo: `ErrorState.tsx`
- Cuándo usarlo: falló la carga de una vista. `role="alert"`, tono Arcilla (nunca rojo).
- Props clave: `title?`, `description?`, `action?` (reintentar).
- No usar para: validación de formularios.

### Skeletons
- Archivo: `Skeletons.tsx`
- Cuándo usarlo: estado de carga. `TextSkeleton` (`lines`), `MoneySkeleton` (`size`), `CardSkeleton`.
- No usar para: acciones en curso de un botón.

### Wordmark
- Archivo: `Wordmark.tsx`
- Cuándo usarlo: logotipo en cabeceras y portada. Toma el nombre de `brand.ts`.
- Props clave: `size?`, `withTagline?`.
- No usar para: escribir el nombre comercial en texto; usa `brand.name`.

### LegalNotice
- Archivo: `LegalNotice.tsx`
- Cuándo usarlo: avisos fijos (`demoBanner`, `simulatorDisclaimer`, `riskNotice`, `legalPlaceholder`).
- Props clave: `notice`, `variant?` (`block` · `inline`).
- No usar para: textos que no estén en `legal-copy.ts`.

## App shell (`src/shared/ui/app-shell/`)

Importa desde `@/shared/ui/app-shell`. La navegación sale de `route-map.ts`; no se escriben enlaces de menú a mano. El rol de la demo vive en `role-store.ts` (Zustand, clave `club-ui:v1`) y no es dato de negocio.

### ZoneShell
- Archivo: `ZoneShell.tsx` (Server Component)
- Cuándo usarlo: único contenido de cada layout de zona (`public` · `investor` · `admin`). Incluye enlace de salto, `DemoBanner`, barra de simulación con `RoleSwitcher`, cabecera, navegación, `main#contenido` y pie.
- Props clave: `zone`, `children`, `demoTools?` (hueco en la barra de simulación).
- No usar para: páginas sueltas ni layouts anidados.

### RoleSwitcher
- Archivo: `RoleSwitcher.tsx` (cliente)
- Cuándo usarlo: ya va dentro de `ZoneShell`. Guarda el rol y navega al inicio de ese rol.
- Props clave: `zone`.
- No usar para: autenticación ni permisos (no hay protección de rutas en F1).

### NavLinks · ActiveNavLinks · MobileNav
- Archivos: `NavLinks.tsx` (presentacional), `ActiveNavLinks.tsx` (cliente, `usePathname`), `MobileNav.tsx` (Sheet).
- Cuándo usarlos: solo desde `ZoneShell`. `ActiveNavLinks` siempre dentro de `Suspense` (cacheComponents).
- No usar para: menús de otra naturaleza.

### RoutePlaceholder
- Archivo: `RoutePlaceholder.tsx`
- Cuándo usarlo: pantalla provisional de las 14 rutas hasta que su módulo la reemplace.
- Props clave: `routeId`.
- No usar para: pantallas con datos.

## Textos fijos
- `legal-copy.ts` (`LEGAL_COPY`): avisos de `docs/06`. Un test fija el texto exacto.
- `brand-copy.ts` (`BRAND_COPY`): rótulos de cifras, carga y error.

## Formateadores (`@/shared/lib`)
- `formatMoney(value, {decimals?})` → `USD 10.000,50`. Determinista, sin Intl.
- `formatIsoDate(iso, "numeric" | "short")` → `03.11.2026` / `3 nov 2026`.

## Reglas de uso
1. **Capital · ganancia realizada · proyección** siempre separados y rotulados. Para el portafolio, tres `MoneyDisplay` con su `kind`.
2. Toda cifra futura lleva `ProjectionLabel`. Con `MoneyDisplay kind="projection"` ya va incluido.
3. **Latón** solo en líneas, bordes, sellos y el "²" del wordmark; nunca como texto pequeño sobre Cal.
4. Sin rojo ni verde de bolsa: lo negativo o de atención usa Arcilla.
5. Sin ruedas en componentes compartidos (ADR-004).
6. Los textos visibles de cada módulo van en su `copy.ts`; los avisos fijos se importan de `legal-copy.ts`.

## Cómo pedir un componente nuevo
Antes de crear uno, revisa este catálogo. Si falta, descríbelo en el plan de la funcionalidad (nombre, props, dónde se usa) para que el arquitecto lo añada aquí con su contrato y su test. No lo dupliques dentro de un módulo.
