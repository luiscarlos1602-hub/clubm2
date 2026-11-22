# Plan 001 · F1-2 · Design system Club M² + `brand.ts` + `shared/ui/brand` + `legal-copy.ts` + `/sistema`

Estado: borrador · Fecha: 2026-11-22 · Autor: arquitecto
Fuentes: `docs/prompts/F1-fundacion-visual.md` §F1-2 · `marketing/02-branding.md` · ADR-003/004/005/008 · `docs/01-arquitectura.md` §3, §4, §5, §8 · `docs/06-guia-de-contenido.md`
Rama: `feat/shared-design-system` (sale de `feat/app-andamiaje` o de `main` si F1-1 ya está integrada). Corre en paralelo con F1-3 (`dominio-financiero`), que solo toca `src/shared/domain/**` y `src/modules/{finance,projects}/**`: no hay archivos compartidos.

## 1. Historia y criterios

**Historia.** Como equipo de Club M², quiero un design system de marca (tokens, tipografía, primitivas tematizadas y componentes de marca que hacen cumplir las reglas de cifras y avisos), y una página interna `/sistema` que lo muestre, para que todas las pantallas de F1-5 en adelante se construyan con una sola fuente visual y legal, y el usuario apruebe la dirección visual antes de seguir.

**Criterios de aceptación** (los del prompt F1-2 más los marcados [PROPUESTO], que los hacen verificables):

- **CA1 · Tokens.** `src/app/globals.css` declara en `@theme` los 7 colores con su HEX exacto (Cal `#F4EFE6`, Grafito noche `#16181A`, Verde Ávila `#1F3A33`, Arcilla `#9A4529`, Arcilla clara `#B5573A`, Latón `#B8935A`, Piedra `#6B655C`), y las variables semánticas de shadcn (`--background`, `--primary`…) apuntan a ellos. No hay rojo ni verde de bolsa: `--destructive` = Arcilla. [PROPUESTO] Lo verifica `brand-tokens.test.ts`, que compara `globals.css` con `brand.palette`.
- **CA2 · Tipografía.** Fraunces (títulos), Inter (texto y cifras tabulares) e IBM Plex Mono (códigos y fechas) se cargan con `next/font/google` en `src/app/layout.tsx`. Se exponen como `font-heading`, `font-sans` y `font-mono`. `<html lang="es">`.
- **CA3 · Marca.** `src/shared/config/brand.ts` exporta `name: "Club M²"`, `shortName: "M2"`, `tagline: "Juntos sumamos metros."`. [PROPUESTO] `brand-single-source.test.ts` falla si "Club M²" o "Club M2" aparece en otro archivo de `src/` (sin contar tests).
- **CA4 · Primitivas.** Las primitivas de shadcn de §4·P1 existen en `src/shared/ui/primitives/` y usan solo tokens de marca. Botón principal (CTA) en Arcilla, secundario en Verde Ávila. Altura mínima de 40 px en `default` y 48 px en `lg` (objetivo táctil en móvil).
- **CA5 · Componentes de marca.** `MoneyDisplay`, `ProjectionLabel`, `StatusBadge`, `DemoBanner`, `ProjectSeal`, `SectionHeading`, `EmptyState`, `ErrorState` [PROPUESTO], skeletons, `Wordmark` [PROPUESTO] y `LegalNotice` [PROPUESTO] cumplen exactamente los contratos de §3. `MoneyDisplay` con `kind="projection"` siempre incluye `ProjectionLabel` (no hay prop para quitarlo). Lo verifica un test.
- **CA6 · Formato de dinero.** `formatMoney` produce `USD 10.000` / `USD 10.000,50` (punto de miles, coma decimal, `docs/06` regla 1) sin aritmética sobre `.cents` y sin depender de ICU (así el servidor y el cliente dan el mismo resultado, sin errores de hidratación). Lo verifican los tests de §5.
- **CA7 · Avisos legales.** `src/shared/ui/brand/legal-copy.ts` contiene, literalmente, los avisos de `docs/06` (banner, etiqueta de proyección, aviso del simulador, aviso de riesgo). `legal-copy.test.ts` fija los textos exactos.
- **CA8 · Catálogo.** `src/shared/ui/README.md` lista cada componente con archivo, cuándo usarlo, props clave y "no usar para".
- **CA9 · `/sistema`.** `src/app/sistema/page.tsx` (< 60 líneas, solo compone) muestra paleta, tipografía, botones, badges, tarjeta de proyecto, cifras (capital · realizado · proyección), avisos legales y estados vacío/carga/error, con los `data-testid` de §5. Lleva `robots: { index: false, follow: false }` y no se enlaza desde ninguna navegación.
- **CA10 · Capturas.** `docs/qa/F1/sistema-movil-390.png` y `docs/qa/F1/sistema-desktop-1440.png` (página completa, fuentes ya cargadas y animaciones desactivadas). **Checkpoint:** el usuario las aprueba antes de F1-5.
- **CA11 · Cumplimiento.** `node scripts/check-copy.mjs src` da 0 errores. La palabra "rueda" no aparece en `/sistema` (lo comprueba el E2E). El Latón nunca va como texto pequeño sobre fondo claro (solo líneas, bordes, sellos y el "²" del wordmark).
- **CA12 · Verde.** `pnpm verify` pasa completo (tsc, lint de capas, check-copy, vitest, playwright 390 y 1440).

## 2. Módulos afectados

| Módulo | Por qué | Nuevo |
|---|---|---|
| `src/app` (`globals.css`, `layout.tsx`, `sistema/`) | Tokens, fuentes, metadata raíz y página interna | `sistema/` nuevo |
| `src/shared/config` | `brand.ts`, única fuente del nombre | sí |
| `src/shared/lib` | Formateadores es-VE (`format-money.ts`, `format-date.ts`) | archivos nuevos |
| `src/shared/ui/primitives` | Tematizar `button` y añadir primitivas | se amplía |
| `src/shared/ui/brand` | Componentes de marca + `legal-copy.ts` + `brand-copy.ts` | sí |
| `src/shared/ui/showcase` | Secciones de `/sistema` y su copy (no son componentes reutilizables) | sí, ver §6 R1 |
| `tests/e2e` | `sistema.spec.ts` + capturas | archivos nuevos |

No se toca ningún módulo de negocio (`src/modules/**`) ni `src/shared/domain/**` (lo crea F1-3). Las dependencias cumplen §4: `app → shared-ui, shared-lib` y `shared-ui → shared-ui, shared-lib`; `shared/config` cuenta como `shared-lib` en `eslint.config.mjs`.

## 3. Contratos (TypeScript)

Es el acuerdo entre los paquetes P1, P2 y P3 y con F1-5. Si cambia, se avisa al agente principal.

### 3.1 `src/shared/config/brand.ts` (P1)
```ts
export const brand = {
  name: "Club M²",
  shortName: "M2",
  tagline: "Juntos sumamos metros.",
  /** Para el wordmark: el "²" va en Latón. Nadie vuelve a escribir el nombre a mano. */
  wordmark: { base: "Club M", mark: "²" },
  /** Fuente para mostrar la paleta en /sistema; brand-tokens.test.ts la compara con globals.css. */
  palette: [
    { token: "cal",          name: "Cal",           hex: "#F4EFE6" },
    { token: "grafito",      name: "Grafito noche", hex: "#16181A" },
    { token: "verde-avila",  name: "Verde Ávila",   hex: "#1F3A33" },
    { token: "arcilla",      name: "Arcilla",       hex: "#9A4529" },
    { token: "arcilla-clara",name: "Arcilla clara", hex: "#B5573A" },
    { token: "laton",        name: "Latón",         hex: "#B8935A" },
    { token: "piedra",       name: "Piedra",        hex: "#6B655C" },
  ],
} as const;

export type Brand = typeof brand;
export type BrandColorToken = (typeof brand.palette)[number]["token"];
```

### 3.2 Tokens en `src/app/globals.css` (P1): nombres fijos de las clases
- `@theme` (no `inline`): `--color-cal`, `--color-grafito`, `--color-verde-avila`, `--color-arcilla`, `--color-arcilla-clara`, `--color-laton`, `--color-piedra`, con su HEX. Clases resultantes: `bg-cal`, `text-grafito`, `border-laton`, etc.
- Fuentes: `--font-sans: var(--font-inter)`, `--font-heading: var(--font-fraunces)`, `--font-mono: var(--font-plex-mono)`. Las variables de `next/font` se llaman `--font-inter`, `--font-fraunces` y `--font-plex-mono`, nunca igual que el token: el andamiaje actual tiene `--font-sans: var(--font-sans)`, que se referencia a sí mismo, y hay que corregirlo.
- Variables semánticas en `:root`: `--background` = cal · `--foreground` = grafito · `--primary` = arcilla / `--primary-foreground` = cal (5,6:1) · `--secondary` = verde-avila / `--secondary-foreground` = cal (10,7:1) · `--muted` = `color-mix(in oklch, var(--color-cal), var(--color-grafito) 5%)` · `--muted-foreground` = piedra (5,0:1) · `--accent` = mezcla de cal con arcilla-clara al 10% · `--accent-foreground` = grafito · `--destructive` = arcilla · `--border` / `--input` = mezcla de cal con piedra al 22% · `--ring` = verde-avila (Latón sobre Cal no llega a 3:1) · `--card` / `--popover` = mezcla de cal con blanco al 45% · `--chart-1..5` = verde-avila, arcilla, laton, piedra, arcilla-clara · `--radius: 0.375rem` [SUPUESTO: radio pequeño, look documental].
- Solo modo claro en F1: se elimina el bloque `.dark` del andamiaje y se conserva `@custom-variant dark` (ver §6 S3).
- Utilidad de cifras: las cifras usan `tabular-nums` de Tailwind; no se crea una clase propia.

### 3.3 `src/shared/lib/format-money.ts` (P1)
```ts
/** Forma mínima estructural. El `Money` de shared/domain (F1-3) es asignable a este tipo. */
export type MoneyLike = { readonly cents: number; readonly currency: "USD" };

export type MoneyDecimals = "auto" | "always";

/**
 * "USD 10.000" · "USD 10.000,50" · "-USD 2.500". Usa NBSP (U+00A0) entre "USD" y la cifra.
 * Trabaja con el string de los centavos (sin / ni % sobre .cents, sin Intl/ICU).
 * "auto": omite ",00"; "always": siempre 2 decimales.
 * Lanza RangeError si cents no es un entero seguro (error de programación, no de negocio).
 */
export function formatMoney(value: MoneyLike, options?: { decimals?: MoneyDecimals }): string;
```

### 3.4 `src/shared/lib/format-date.ts` (P1)
```ts
export type DateStyle = "numeric" | "short";
/**
 * Acepta "YYYY-MM-DD" o un ISO completo (usa los 10 primeros caracteres, sin cambiar de zona horaria).
 * "numeric" → "03.11.2026" (sello, Plex Mono) · "short" → "3 nov 2026" (tabla de meses fija en español).
 * No usa Intl, para que servidor y cliente coincidan. Lanza RangeError si el formato es inválido.
 */
export function formatIsoDate(iso: string, style?: DateStyle): string;
```

### 3.5 `src/shared/ui/brand/legal-copy.ts` (P2): textos literales de `docs/06`
```ts
export const LEGAL_COPY = {
  demoBanner: "Datos simulados · no es una oferta de inversión",               // 06 regla 5
  projectionTag: "Proyección · no garantizada",                                  // 06 regla 2
  simulatorDisclaimer:
    "Simulación ilustrativa. Los resultados dependen de la venta real, los costos y los contratos aplicables. Puedes perder parte o la totalidad de tu aporte.", // 06 regla 4
  riskNotice: "Toda inversión puede sufrir pérdidas.",                           // 06 vocabulario
  targetTermSuffix: "proyección, no garantizada",                                // "Plazo objetivo: 3 meses · proyección, no garantizada"
  legalPlaceholder: "Texto legal de ejemplo, sujeto a revisión. No es un contrato.", // [PROPUESTO] 06 §Textos legales
} as const;
export type LegalNoticeKey = keyof typeof LEGAL_COPY;
```

### 3.6 `src/shared/ui/brand/brand-copy.ts` (P2): etiquetas fijas de los componentes de marca
```ts
export const BRAND_COPY = {
  figureLabels: { capital: "Capital aportado", realized: "Ganancia realizada", projection: "Proyección" }, // 06 regla 3
  loading: "Cargando…",
  errorDefaultTitle: "No pudimos cargar esta información",
  sealDateLabel: "Compra",
} as const;
```

### 3.7 Props de los componentes (`src/shared/ui/brand/*.tsx`, P2)
Todos son Server Components (sin `"use client"`), exportan con nombre, aceptan `className?: string` y un `data-testid` que se puede sobrescribir (el valor por defecto se indica en cada uno). Ninguno calcula dinero.

```ts
import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import type { MoneyLike, MoneyDecimals } from "@/shared/lib/format-money";
import type { LegalNoticeKey } from "./legal-copy";

type TestIdProp = { "data-testid"?: string; className?: string };

// MoneyDisplay.tsx · testid por defecto "money-display" · atributo data-kind={kind}
export type MoneyKind = "capital" | "realized" | "projection" | "amount";
export type MoneyDisplayProps = TestIdProp & {
  value: MoneyLike;
  /** Separa capital · realizado · proyección (regla 2). "amount" = monto neutro (precio, presupuesto) sin rótulo propio. */
  kind: MoneyKind;
  /** Rótulo visible. Si falta y kind≠"amount", usa BRAND_COPY.figureLabels[kind]. */
  label?: string;
  size?: "sm" | "md" | "lg" | "xl";          // por defecto "md"; xl = cifra protagonista en Fraunces
  decimals?: MoneyDecimals;                  // por defecto "auto"
};
// Regla: kind="projection" ⇒ renderiza <ProjectionLabel/> SIEMPRE. No existe prop para ocultarlo.
// Las cifras negativas se muestran con "-" y el mismo color (sin rojo).

// ProjectionLabel.tsx · testid "projection-label"
export type ProjectionLabelProps = TestIdProp & {
  /** Cifra o texto futuro al que acompaña; sin children, solo pinta la etiqueta. */
  children?: ReactNode;
  placement?: "inline" | "below";            // por defecto "below"
};
// El texto es siempre LEGAL_COPY.projectionTag (no se puede sobrescribir).

// StatusBadge.tsx · testid "status-badge" · atributo data-tone={tone}
export type StatusTone = "positive" | "in-progress" | "attention" | "neutral";
export type StatusBadgeProps = TestIdProp & {
  tone: StatusTone;   // positive=Verde Ávila (fondo) + Cal · in-progress=borde y punto Latón + texto Grafito · attention=borde y texto Arcilla · neutral=Piedra
  label: string;      // lo da el copy.ts del módulo que lo usa (p. ej. "En obra")
};

// DemoBanner.tsx · testid "demo-banner" · role="note"
export type DemoBannerProps = TestIdProp & {
  variant?: "bar" | "inline";   // bar = franja Verde Ávila a todo el ancho (F1-5 la fija en los layouts); inline = recuadro
};
// El texto es siempre LEGAL_COPY.demoBanner.

// ProjectSeal.tsx · testid "project-seal"
export type ProjectCode = `M2-${string}`;
export type ProjectSealProps = TestIdProp & {
  code: ProjectCode;                // "M2-001"
  date: string;                     // ISO "YYYY-MM-DD"; se formatea con formatIsoDate(date, "numeric")
  dateLabel?: string;               // por defecto BRAND_COPY.sealDateLabel
  size?: "sm" | "md";
};
// Cuadrado 1:1 con borde doble de Latón y texto Grafito en Plex Mono (no hay texto en Latón sobre Cal).

// SectionHeading.tsx · testid "section-heading"
export type SectionHeadingProps = TestIdProp & {
  eyebrow?: string;                 // Plex Mono, mayúsculas, Piedra
  title: string;                    // Fraunces
  description?: string;
  level?: 1 | 2 | 3;                // h1/h2/h3; por defecto 2
  align?: "start" | "center";
  id?: string;                      // ancla para aria-labelledby de la sección
};

// EmptyState.tsx · testid "empty-state"
export type EmptyStateProps = TestIdProp & {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: ReactNode;               // normalmente un <Button asChild><Link/></Button>
};

// ErrorState.tsx [PROPUESTO] · testid "error-state" · role="alert"
export type ErrorStateProps = TestIdProp & {
  title?: string;                   // por defecto BRAND_COPY.errorDefaultTitle
  description?: string;
  action?: ReactNode;               // reintentar (lo conecta el hook del módulo)
};
// Tono Arcilla, nunca rojo.

// Skeletons.tsx · se basan en primitives/skeleton · role="status" + texto sr-only BRAND_COPY.loading
export type TextSkeletonProps  = TestIdProp & { lines?: 1 | 2 | 3 | 4 | 5 | 6 };    // testid "skeleton-text"
export type MoneySkeletonProps = TestIdProp & { size?: MoneyDisplayProps["size"] }; // testid "skeleton-money"
export type CardSkeletonProps  = TestIdProp;                                        // testid "skeleton-card"

// Wordmark.tsx [PROPUESTO] · testid "wordmark" · aria-label={brand.name}
export type WordmarkProps = TestIdProp & {
  size?: "sm" | "md" | "lg";
  withTagline?: boolean;            // eslogan en Inter debajo (móvil) o a la derecha (≥ md)
};
// "Club M" en Fraunces + "²" en Latón con aria-hidden. Es un logotipo, así que la regla de contraste del texto pequeño no aplica.

// LegalNotice.tsx [PROPUESTO] · testid `aviso-${kebab(notice)}`
export type LegalNoticeProps = TestIdProp & {
  notice: Exclude<LegalNoticeKey, "projectionTag" | "targetTermSuffix">;
  variant?: "inline" | "block";
};
```

`src/shared/ui/brand/index.ts`: barrel con exportaciones nombradas de todo lo anterior (componentes, tipos, `LEGAL_COPY`, `BRAND_COPY`). Los consumidores importan desde `@/shared/ui/brand`.

### 3.8 Nota para F1-3 (`dominio-financiero`)
`Money` en `src/shared/domain/money.ts` debe dejar `cents: number` y `currency: "USD"` como propiedades públicas legibles: así es asignable a `MoneyLike` sin cambiar nada. Cuando F1-3 esté en `main`, `MoneyLike` pasa a ser `export type MoneyLike = Money` (`shared-lib → shared-domain` ya lo permite el lint). Va a `docs/mejoras.md`.

## 4. Paquetes

| # | Agente | Archivos (exclusivos) | Depende de | Paralelo con | Criterios |
|---|---|---|---|---|---|
| P1 | constructor-ui | `src/app/globals.css` · `src/app/layout.tsx` · `src/shared/config/brand.ts` · `src/shared/config/brand-tokens.test.ts` · `src/shared/config/brand-single-source.test.ts` · `src/shared/lib/format-money.ts` (+ `.test.ts`) · `src/shared/lib/format-date.ts` (+ `.test.ts`) · `src/shared/ui/primitives/**` · `components.json` (solo si el CLI lo toca) | contratos §3.1–3.4 | P2, P4 (redacción), F1-3 | CA1–CA4, CA6 |
| P2 | constructor-ui | `src/shared/ui/brand/**` (`legal-copy.ts`, `legal-copy.test.ts`, `brand-copy.ts`, `MoneyDisplay.tsx`, `MoneyDisplay.test.tsx`, `ProjectionLabel.tsx`, `StatusBadge.tsx`, `DemoBanner.tsx`, `ProjectSeal.tsx`, `SectionHeading.tsx`, `EmptyState.tsx`, `ErrorState.tsx`, `Skeletons.tsx`, `Wordmark.tsx`, `LegalNotice.tsx`, `index.ts`) · `src/shared/ui/README.md` | contratos §3 (importa `format-money`, `format-date`, `brand` y `primitives/{badge,skeleton}` por su firma; si P1 no ha terminado, P2 escribe contra la firma y verifica al final) | P1, P4, F1-3 | CA5, CA7, CA8 |
| P3 | constructor-ui | `src/app/sistema/page.tsx` · `src/shared/ui/showcase/**` (`showcase-copy.ts`, `showcase-samples.ts`, `SystemPalette.tsx`, `SystemTypography.tsx`, `SystemButtons.tsx`, `SystemBadges.tsx`, `SystemProjectCard.tsx`, `SystemFigures.tsx`, `SystemLegal.tsx`, `SystemStates.tsx`) | P1, P2 | P4 (redacción) | CA9, CA11 |
| P4 | qa-e2e | `tests/e2e/sistema.spec.ts` · `tests/e2e/capturas-sistema.spec.ts` · `package.json` (solo agregar el script `capturas`) · `docs/qa/F1/sistema-movil-390.png` · `docs/qa/F1/sistema-desktop-1440.png` | redacta en paralelo usando los testid de §5; ejecuta tras P3 | P1, P2, P3 | CA10, CA11, CA12 |

Detalle por paquete:

**P1 · Fundación.**
1. Primitivas (con `pnpm shadcn add …`, alias ya configurados): `card`, `badge`, `skeleton`, `separator`, `alert`, `input`, `label`, `sheet`, `select`, `tooltip`. Se añaden aquí para que P1 sea el único dueño de `primitives/` y F1-5 (navegación móvil con `sheet`, selector de rol con `select`) no las toque. **Si el CLI intenta instalar una dependencia npm que no sea `radix-ui` (ya está instalada), detenerse y reportar `BLOQUEADO`** (regla del prompt §3).
2. Tematizar `button`: `default` = Arcilla CTA, `secondary` = Verde Ávila, `outline` = borde `border` con texto Grafito, `ghost`, `link` = Arcilla subrayada. `destructive` sin rojo: borde y texto Arcilla. Tamaños: `default` h-10, `lg` h-12, `sm` h-9; texto 15 px. Las demás primitivas solo usan variables semánticas, sin colores literales.
3. `layout.tsx`: Fraunces (variable, `axes: ["opsz"]`), Inter (variable), IBM_Plex_Mono (`weight: ["400","500"]`), todas con `display: "swap"` y `subsets: ["latin"]`. Además `lang="es"`, `metadata = { title: { default: brand.name, template: \`%s · ${brand.name}\` }, description: brand.tagline }` y `body` con `bg-background text-foreground font-sans antialiased`. Antes, leer `node_modules/next/dist/docs/01-app/03-api-reference/02-components/font.md` (AGENTS.md). No se coloca `DemoBanner` aquí: lo pone F1-5 en los layouts de zona.
4. `brand-tokens.test.ts` lee `src/app/globals.css` con `node:fs` y comprueba que cada `brand.palette[i]` tiene `--color-<token>: <hex>` (sin distinguir mayúsculas) y que `--destructive` apunta a `--color-arcilla`.
5. `brand-single-source.test.ts` recorre `src/**/*.{ts,tsx,css,md}` (sin `*.test.*` ni `brand.ts`) y falla si encuentra `Club M²` o `Club M2`.

**P2 · Componentes de marca.** Implementa §3.5–3.7 al pie de la letra. Todo texto visible sale de `legal-copy.ts`, `brand-copy.ts` o de las props. Ningún componente usa `.cents` en una expresión binaria (lo prohíbe el lint de §8.1): el formateo vive en `formatMoney`. README: una tabla por componente, una sección de "reglas de uso" (capital · realizado · proyección; Latón; sin ruedas en componentes compartidos) y otra sobre cómo pedir un componente nuevo.

**P3 · `/sistema`.**
- `page.tsx` exporta `metadata = { title: "Sistema", robots: { index: false, follow: false } }` y compone las 8 secciones dentro de `<main data-testid="sistema-page">`. Va en `src/app/sistema/`, fuera de las zonas `(publico)` y `(inversionista)`, y ningún enlace apunta a ella.
- Los textos de las secciones van en `showcase-copy.ts` (lo recoge check-copy). Los valores de ejemplo van en `showcase-samples.ts` como literales `{ cents: …, currency: "USD" }`, marcados como "Ejemplo ilustrativo". Nada se deriva ni se calcula: si una cifra de ejemplo "debería" salir de otra, se escribe el literal y en el código se cita su origen (C1 de `docs/02`, si aplica).
- Tarjeta de proyecto de ejemplo: `ProjectSeal` (`M2-001`, fecha), título en Fraunces, zona (p. ej. "El Paraíso, Caracas"), `StatusBadge` ("En obra", `in-progress`), "Participaciones disponibles: 37 de 100", `MoneyDisplay kind="amount"` ("Desde USD 100 por participación") y plazo objetivo + `LEGAL_COPY.targetTermSuffix`. No es el componente de P3 del marketplace (F2): es una muestra de composición.
- Dirección visual: mucho aire (`py-16 md:py-24` entre secciones), una idea por bloque, máximo ~72ch de ancho para texto, rejilla de 1 columna en 390 px y de 12 columnas en 1440 px; líneas finas de Latón como separadores.

**P4 · E2E y capturas.** `sistema.spec.ts` corre siempre dentro de `pnpm verify`. `capturas-sistema.spec.ts` hace `test.skip(!process.env.CAPTURAS)`, espera `document.fonts.ready` y llama a `page.screenshot({ path: \`docs/qa/F1/sistema-${testInfo.project.name}.png\`, fullPage: true, animations: "disabled" })`. Script nuevo: `"capturas": "CAPTURAS=1 playwright test capturas --trace off"`. Así `verify` no ensucia el árbol de git con PNG nuevos en cada ejecución.

Orden: P1 ∥ P2 ∥ (redacción de P4) → P3 → ejecución de P4 → `verificar` (orquestador) → `revisor-codigo` ∥ `revisor-cumplimiento` → capturas al usuario (**checkpoint**).

## 5. Pruebas

**Unitarias (Vitest, entorno `node`):**
- `format-money.test.ts`: `0 → "USD 0"` · `5 → "USD 0,05"` · `100 → "USD 1"` · `1_000_000 → "USD 10.000"` · `1_000_050 → "USD 10.000,50"` · `12_345_678_900 → "USD 123.456.789"` · `-250_000 → "-USD 2.500"` · `{decimals:"always"} 100 → "USD 1,00"` · el separador después de "USD" es U+00A0 · `1.5` y `Number.MAX_SAFE_INTEGER + 2` → `RangeError`. Propiedad (fast-check, enteros seguros): con `decimals:"always"`, quitar todo lo que no sea dígito da `String(Math.abs(cents)).padStart(3,"0")`.
- `format-date.test.ts`: `"2026-11-03"` → `"03.11.2026"` y `"3 nov 2026"` · el ISO completo `"2026-11-03T23:30:00-04:00"` conserva el día 03 · `"03/11/2026"` y `""` → `RangeError`.
- `brand-tokens.test.ts` y `brand-single-source.test.ts` (P1, §4).
- `legal-copy.test.ts`: igualdad exacta de cada texto con §3.5 (cambiarlo exige tocar el test a propósito).
- `MoneyDisplay.test.tsx` (con `renderToStaticMarkup` de `react-dom/server`, sin jsdom): con `kind="projection"` el HTML contiene `data-testid="projection-label"` y `LEGAL_COPY.projectionTag` · con `capital` y `realized` no lo contiene · el rótulo por defecto es el de `BRAND_COPY.figureLabels` · `data-kind` se refleja.

**E2E (`tests/e2e/sistema.spec.ts`, proyectos `movil-390` y `desktop-1440`):**
1. `goto("/sistema")`; son visibles `sistema-page` y las secciones `sistema-paleta`, `sistema-tipografia`, `sistema-botones`, `sistema-badges`, `sistema-tarjeta-proyecto`, `sistema-cifras`, `sistema-avisos` y `sistema-estados`.
2. Paleta: existen `swatch-cal`, `swatch-grafito`, `swatch-verde-avila`, `swatch-arcilla`, `swatch-arcilla-clara`, `swatch-laton` y `swatch-piedra`, cada uno con su HEX visible.
3. Cifras: `cifra-capital`, `cifra-realizado` y `cifra-proyeccion` son visibles. Solo `cifra-proyeccion` contiene `projection-label` con el texto "Proyección · no garantizada". `cifra-capital` contiene `USD` y un formato con punto de miles.
4. Tarjeta: `sistema-tarjeta-proyecto` contiene `project-seal`, con texto `M2-001`, y `status-badge`.
5. Avisos: `aviso-demo-banner`, `aviso-simulator-disclaimer` y `aviso-risk-notice` muestran exactamente los textos de `LEGAL_COPY`, importado por ruta relativa `../../src/shared/ui/brand/legal-copy`. Además se ve `demo-banner`.
6. Estados: son visibles `estado-vacio` (contiene `empty-state`), `estado-carga` (contiene `skeleton-card`) y `estado-error` (contiene `error-state` con `role="alert"`).
7. Marca: `wordmark` es visible y su `aria-label` es igual a `brand.name`.
8. Cumplimiento: `<html lang="es">`, `meta[name="robots"]` contiene `noindex`, y el texto de la página no coincide con `/rueda/i`.
9. Móvil: en 390 px, `document.documentElement.scrollWidth <= 390` (sin desplazamiento horizontal).

**Capturas:** `pnpm capturas` → `docs/qa/F1/sistema-movil-390.png`, `docs/qa/F1/sistema-desktop-1440.png`.

## 6. Riesgos, supuestos y preguntas

- **R1 · Carpeta `shared/ui/showcase/` no figura en `01 §3`.** No rompe ninguna regla (es `shared-ui`, con las mismas dependencias), pero el árbol de §3 es ley de carpetas. Propuesta: el orquestador añade una línea al árbol de `01 §3` en el mismo commit (`showcase/  # secciones de /sistema, solo uso interno`). Si lo considera un cambio de decisión, abre un ADR menor; no hace falta ADR de arquitectura. La alternativa (meter el JSX en `src/app/sistema/`) va contra `01 §4 regla 4` (`page.tsx` < 60 líneas y sin lógica) y contra la regla de copy fuera del JSX.
- **R2 · Lint "dinero solo en el motor".** `formatMoney` no puede usar `cents / 100` (lo bloquea `no-restricted-syntax`). La solución es formatear sobre el string de los centavos, que además es exacto. Desestructurar `const { cents } = value; cents / 100` para esquivar la regla está **prohibido** y el revisor lo trata como 🔴. Mejora sugerida para `docs/mejoras.md`: ampliar el selector del lint a identificadores llamados `cents`.
- **R3 · Hidratación.** `Intl` con `es-VE` puede variar entre el ICU de Node y el del navegador. Por eso los formateadores son deterministas, sin `Intl`.
- **R4 · CLI de shadcn (style `radix-nova`).** Puede reescribir `globals.css` o `components.json` al añadir primitivas. Por eso las primitivas se añaden **antes** de tematizar `globals.css` dentro de P1, y se revisa el diff. Si pide dependencias nuevas: `BLOQUEADO`.
- **R5 · Conflicto con F1-4/F1-5 en `layout.tsx`.** P1 es dueño de `layout.tsx` en esta fila. F1-4 (providers) y F1-5 (banner, layouts de zona) lo tocan después del merge de F1-2. El orquestador debe integrar F1-2 antes de lanzar esos paquetes.
- **S1 [SUPUESTO] · `/sistema` sigue accesible en producción** (Vercel), con `noindex` y sin enlaces. Si el usuario prefiere ocultarla, se resuelve en F1-6 o F4-2 con un flag en `shared/config/demo.ts`.
- **S2 [SUPUESTO] · Tintes derivados** (`--card`, `--muted`, `--border`, `--accent`) con `color-mix` sobre la paleta: no se introducen colores nuevos. El radio de 0,375 rem es una elección estética que el usuario valida en el checkpoint visual.
- **S3 [SUPUESTO] · Sin modo oscuro en F1.** Grafito noche se usa en bloques premium puntuales, no como tema. Se anota en `docs/mejoras.md` como P3.
- **S4 [SUPUESTO] · Rótulo de la columna realizada:** "Ganancia realizada" (`06` regla 3), aunque el valor pueda ser negativo. Si el usuario prefiere "Resultado realizado" para cubrir pérdidas, solo cambia `BRAND_COPY.figureLabels.realized`. Va como pregunta 🟠 para P6 en `docs/08` (no es una regla de negocio nueva, es vocabulario).
- **S5 · `legalPlaceholder`** es una redacción mía a partir de `06 §Textos legales` y está marcada [PROPUESTO]. La valida `revisor-cumplimiento`.
- **Reglas de negocio nuevas:** ninguna. Ningún componente decide cifras; `StatusBadge` recibe el tono y el texto del módulo que lo usa y no conoce las etapas del proyecto.
- **Preguntas al usuario (en el checkpoint de capturas):** (1) ¿aprueba la dirección visual de `/sistema`? (2) ¿`/sistema` visible en producción o solo en preview? (3) ¿"Ganancia realizada" o "Resultado realizado"?

## 7. ADR requerido
No. Solo se actualiza una línea del árbol de `docs/01 §3` (R1) en el mismo commit; queda a criterio del orquestador si lo formaliza.
