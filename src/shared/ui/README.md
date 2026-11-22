# Catálogo de `shared/ui`

Importa los componentes de marca desde `@/shared/ui/brand`. Las primitivas de shadcn viven en `@/shared/ui/primitives/*` y solo usan variables semánticas (`bg-primary`, `text-muted-foreground`…) o tokens de marca (`bg-crema`, `border-arena`…). Todos los componentes de marca son Server Components, aceptan `className` y `data-testid`, y ninguno calcula dinero.

## Lenguaje visual (ADR-010) · `src/shared/ui/layout/`

La portada (`modules/club/ui/components/landing/`) es la referencia. Toda pantalla se compone igual: `PageHeader` oscuro y luego `Section`s que alternan tono. **No pongas colores de marca a mano** (`bg-verde-profundo`, `text-crema`, `bg-salvia`, `text-arena/20`): elige un tono y usa los tokens semánticos (`bg-line`, `text-line/20`, `bg-highlight text-highlight-foreground`, `text-destructive`).

| Tono (`data-tone`) | Fondo | Para |
|---|---|---|
| `light` | Crema | Contenido general (por defecto) |
| `paper` | Crema aclarado | Preguntas, formularios largos |
| `sand` | Crema + Arena | Datos, reparto, comparativas |
| `dark` | Verde Profundo | Cabeceras, riesgos, cierres, lo que pide atención |

Dentro de un tono, `bg-primary` / `text-foreground` / `text-muted-foreground` / `border-border` / `border-line` / `ring` ya tienen el valor correcto. El botón `default` es Verde Profundo sobre claro y Crema sobre oscuro; `outline` es la alternativa.

### Section
- Banda a todo el ancho con `PAGE_CONTAINER` dentro. Props: `tone?`, `spacing?` (`sm` · `md` · `lg`), `labelledBy?` o `label?`, `id?`, `ruled?` (filete arriba), `innerClassName?` (grid/gap del contenido).
- Regla: una banda = una idea. Dos bandas seguidas del mismo tono llevan `ruled`.

### PageHeader
- Cabecera de pantalla (la portada en pequeño): `id`, `title`, `eyebrow?`, `description?`, `actions?`, `aside?`, `tone?` (`dark` por defecto), `size?`. Pone el único `h1`.

### Surface
- Tarjeta de radio 2xl: `variant` (`card` · `dark`), `padding` (`sm` · `md` · `lg`), `as`, `labelledBy?`. `dark` anida un bloque oscuro dentro de una banda clara (riesgos, reparto).

### Eyebrow · IconTile · IndexLabel · BulletList · FaqList
- `Eyebrow`: rótulo en versalitas espaciadas (Musgo sobre claro, Arena sobre oscuro).
- `IconTile`: ícono en cuadro de marca, se invierte solo según el tono.
- `IndexLabel n={1}` → `01` en Plex Mono (pasos, pilares).
- `BulletList items marker` (`check` lo que tienes · `dash` riesgos y matices · `dot` notas).
- `FaqList items`: acordeón nativo `<details>`, accesible con teclado.

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
- Props clave: `code` (string ya validado por `projects`), `date` (ISO `YYYY-MM-DD`), `dateLabel?`, `size?`.
- No usar para: texto corrido; el Arena solo va en el borde.

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
- Cuándo usarlo: falló la carga de una vista. `role="alert"`, tono Óxido (nunca rojo).
- Props clave: `title?`, `description?`, `action?` (reintentar).
- No usar para: validación de formularios.

### Skeletons
- Archivo: `Skeletons.tsx`
- Cuándo usarlo: estado de carga. `TextSkeleton` (`lines`), `MoneySkeleton` (`size`), `CardSkeleton`.
- No usar para: acciones en curso de un botón.

### Wordmark
- Archivo: `Wordmark.tsx`
- Cuándo usarlo: logotipo en cabeceras y portada. Toma el nombre de `brand.ts`.
- Props clave: `size?`, `withTagline?`, `withSymbol?` (por defecto `true`). Hereda el color del contenedor.
- No usar para: escribir el nombre comercial en texto; usa `brand.name`.

### BrandSymbol
- Archivo: `BrandSymbol.tsx`
- Cuándo usarlo: el símbolo de la casa solo (favicon, ícono de app, sellos grandes, fondos de sección).
- Props clave: `title?` (sin él es decorativo), `className` para tamaño y color (`currentColor`).
- No usar para: reemplazar el wordmark en la cabecera.

### ProjectImage · projectImageSrc
- Archivo: `ProjectImage.tsx`
- Cuándo usarlo: toda imagen de un proyecto. Pinta la ilustración `public/images/proyectos/<código en minúsculas>/<variante>.svg` (16:10) con el rótulo fijo "Imagen de referencia".
- Props clave: `code`, `variant` (`antes` · `despues` · `proyeccion`), `alt`, `src?` (URL explícita de la imagen elegida; por defecto `projectImageSrc(code, variant)`), `priority?`, `sizes?`, `className?`.
- Reglas: después = obra terminada; mientras no, usa `proyeccion`. No usar para fotos reales sin rótulo. Los textos están en `project-media-copy.ts`.

### ProjectGallery
- Archivo: `ProjectGallery.tsx` (cliente)
- Cuándo usarlo: ficha del proyecto. Pestañas Antes · Después · Proyección (render) con teclado (flechas, Inicio, Fin); la pestaña Proyección lleva `ProjectionLabel`.
- Props clave: `code`, `name`, `defaultVariant?` (por defecto `despues`), `images?` (`Partial<Record<ProjectImageVariant, string>>`: URL por variante; con ella solo se muestran las pestañas que tienen imagen y, si falta `defaultVariant`, abre en la primera disponible; sin ella, las tres SVG por código). Todas son ilustraciones de referencia y llevan el rótulo.

### ProcessBoard
- Archivo: `ProcessBoard.tsx` (presentacional)
- Cuándo usarlo: etapas de obra y venta. `PROCESS_STAGES`, `PROCESS_STAGE_LABEL`, `ProcessStageView` (`id`, `status`, `date` ISO, `estimated`, `note?`).
- Props clave: `stages`, `orientation?` (`horizontal` en `md`+ y vertical en móvil · `vertical` siempre). Las fechas con `estimated: true` llevan `ProjectionLabel`.
- No usar para: calcular fechas (las entrega el dominio).

### LegalNotice
- Archivo: `LegalNotice.tsx`
- Cuándo usarlo: avisos fijos (`demoBanner`, `simulatorDisclaimer`, `riskNotice`, `legalPlaceholder`).
- Props clave: `notice`, `variant?` (`block` · `inline`).
- No usar para: textos que no estén en `legal-copy.ts`.

## App shell (`src/shared/ui/app-shell/`)

Importa desde `@/shared/ui/app-shell`. La navegación sale de `route-map.ts`; no se escriben enlaces de menú a mano. El rol de la demo vive en `role-store.ts` (Zustand, clave `club-ui:v1`) y no es dato de negocio.

### ZoneShell
- Archivo: `ZoneShell.tsx` (Server Component)
- Cuándo usarlo: único contenido de cada layout de zona (`public` · `investor` · `admin`). Incluye enlace de salto, cabecera (con "Salir" en las zonas con sesión), navegación, `main#contenido` y pie (con las herramientas de la demo). Sin cintillo (ADR-011) ni selector de rol: el rol lo fija `/ingresar`.
- Props clave: `zone`, `children`, `demoTools?` (herramientas de la demo en el pie), (siempre a todo el ancho: cada pantalla se compone con `PageHeader` y `Section`).
- No usar para: páginas sueltas ni layouts anidados.

### LogoutLink
- Archivo: `LogoutLink.tsx` (cliente)
- Cuándo usarlo: ya va dentro de `ZoneShell` (zonas inversionista y admin). Vuelve el rol a visitante y lleva a la portada.
- No usar para: autenticación real (el acceso es de demostración; no hay protección de rutas).

### NavLinks · ActiveNavLinks · MobileNav
- Archivos: `NavLinks.tsx` (presentacional), `ActiveNavLinks.tsx` (cliente, `usePathname`), `MobileNav.tsx` (Sheet).
- Cuándo usarlos: solo desde `ZoneShell`. `ActiveNavLinks` siempre dentro de `Suspense` (cacheComponents).
- No usar para: menús de otra naturaleza.
- Props clave de `NavLinks`: `zone`, `orientation`, `activeId`, `onNavigate?`, `showIcons?` (muestra el icono de `route-icons.ts` junto a la etiqueta) y `collapsed?` (solo iconos; la etiqueta pasa a `aria-label`, e implica `showIcons`).

### AdminSidebar
- Archivo: `AdminSidebar.tsx` (cliente)
- Cuándo usarlo: solo desde `ZoneShell` en la zona `admin`, solo escritorio (`lg`); en móvil lo reemplaza `MobileNav`. Menú lateral con iconos y plegable a solo iconos (`NavLinks` con `showIcons`/`collapsed`).
- Props clave: ninguna; el estado plegado es local y no se guarda. Botón con `aria-expanded`/`aria-controls`.
- No usar para: navegación del inversionista ni del visitante.

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
3. **Arena** y **Salvia** solo en líneas, bordes, sellos y fondos de destacado; como texto, solo sobre Verde Profundo (sobre Crema no llegan a 4,5:1).
4. Sin rojo ni verde de bolsa: lo negativo o de atención usa Óxido.
5. Sin ruedas en componentes compartidos (ADR-004).
6. Los textos visibles de cada módulo van en su `copy.ts`; los avisos fijos se importan de `legal-copy.ts`.

## Cómo pedir un componente nuevo
Antes de crear uno, revisa este catálogo. Si falta, descríbelo en el plan de la funcionalidad (nombre, props, dónde se usa) para que el arquitecto lo añada aquí con su contrato y su test. No lo dupliques dentro de un módulo.

## Piezas genéricas del backoffice (`src/shared/ui/admin/`)

Importa desde `@/shared/ui/admin`. Las usan projects, finance e investors en sus pantallas de admin; no conocen dominio ni calculan dinero. Textos de estado en `admin-copy.ts`.

- `AdminKpi` — indicador: `label`, `children` (la cifra la entrega quien lo usa), `hint?`.
- `TableScroll` — contiene el desborde horizontal de una tabla (región enfocable con `label`); recibe el contenido de la `<table>` (`thead`/`tbody`) y estiliza `th`/`td`.
- `MockAction` — botón de maqueta: `label`, `doneMessage`, `variant?`; muestra la confirmación y no guarda nada.
- `AdminQueryState` — carga, error y vacío de una vista con datos: `isPending`, `isError`, `isEmpty`, `onRetry`, `testId`.
- `AdminBarChart` — barras con tokens de marca y tabla de apoyo accesible: `ariaLabel`, `data` (`{label, ...valores}`), `series` (`{key, label, color}`), `layout?` (`categories-x` · `categories-y`), `stacked?`, `format?`, `height?`, `categoryWidth?`. Pinta lo que recibe; no calcula.
- `AdminDonut` — anillo con leyenda HTML: `ariaLabel`, `slices` (`{label, value, color}`), `center?` (ya formateado), `format?`, `size?`. Si no hay nada que repartir, no lo pintes: muestra un texto "sin reparto".
- `ChartColor` — `1 | 2 | 3 | 4 | 5`: índice del token `--chart-N` de `globals.css`. Los colores de gráficas son solo estos tokens.
