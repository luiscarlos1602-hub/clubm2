# Plan 008 · Ajustes de producto sobre la maqueta (ADR-013)

Rama: `feat/maqueta-ajustes` · Fecha: 2026-11-22 · Reglas comunes: las de `docs/planes/007-maqueta-visual.md` (ADR-010, `examples.ts` con literales citados, ninguna pantalla calcula dinero, check-copy, sin ruedas fuera de admin) + ADR-013 + `docs/06` actualizado.

## Contratos compartidos (los construye el paquete I; los demás los usan)
```ts
// src/shared/ui/brand/ProjectImage.tsx (Server Component, next/image)
export type ProjectImageVariant = "antes" | "despues" | "proyeccion";
export function projectImageSrc(code: string, variant: ProjectImageVariant): `/images/proyectos/${string}/${ProjectImageVariant}.svg`;
export function ProjectImage(props: { code: string; variant: ProjectImageVariant; alt: string; className?: string; priority?: boolean; sizes?: string; "data-testid"?: string }): JSX.Element; // muestra el rótulo "Imagen de referencia"
// src/shared/ui/brand/ProjectGallery.tsx (cliente): pestañas Antes · Después · Proyección (render), con rótulo de referencia y "Proyección" marcada como tal
export function ProjectGallery(props: { code: string; name: string; defaultVariant?: ProjectImageVariant; "data-testid"?: string }): JSX.Element;

// src/shared/ui/brand/ProcessBoard.tsx (presentacional)
export const PROCESS_STAGES = ["inicio-obra", "obra-50", "obra-80", "inicio-venta", "en-venta", "vendida"] as const;
export type ProcessStageId = (typeof PROCESS_STAGES)[number];
export const PROCESS_STAGE_LABEL: Record<ProcessStageId, string>; // Inicio de obra · Obra al 50 % · Obra al 80 % · Inicio de venta · En venta · Vendida
export type ProcessStageView = { id: ProcessStageId; status: "done" | "current" | "upcoming"; date: string /* ISO */; estimated: boolean /* true = proyección */; note?: string };
export function ProcessBoard(props: { stages: readonly ProcessStageView[]; orientation?: "horizontal" | "vertical"; "data-testid"?: string }): JSX.Element; // fechas estimadas con ProjectionLabel compacto; responsive (vertical en móvil)
```
Imágenes: `public/images/proyectos/<código en minúsculas>/{antes,despues,proyeccion}.svg` para `m2-001` … `m2-007` (21 archivos), ilustraciones de referencia en la paleta de marca (ADR-009), distintas por tipo de inmueble (apartamento/casa/dúplex) y sin texto que prometa nada.
% de ganancia: `calculateProfitRate(gain, capital)` de `@/modules/finance` (ya existe) + `formatPercentage` de `@/shared/lib/format-percentage`. Nunca calcular el % en un componente.
Términos: ruta pública `/terminos` (la crea el paquete III); el enlace del pie lo pone el paquete IV.

## Paquetes (en paralelo, archivos exclusivos)
| Paquete | Qué | Archivos |
|---|---|---|
| I · Imágenes y tarjetas | 21 SVG de referencia; `ProjectImage`, `ProjectGallery`, `ProcessBoard` (+ tests, README); tarjeta del marketplace con imagen (después/proyección según fase) y **sin** aviso de riesgo por tarjeta (uno solo en la página) | `public/images/proyectos/**`, `src/shared/ui/brand/{ProjectImage,ProjectGallery,ProcessBoard}*.tsx` + `index.ts` (solo añadir exports), `src/shared/ui/README.md`, `src/modules/participations/ui/**` |
| II · Ficha y reservar | Galería antes/después/proyección en la ficha; % junto a toda ganancia (escenarios, simulador, realizado); **simulador solo si fase `open`**; tablero de proceso con tiempos estimados; avisos de riesgo solo en puntos clave; **reservar** abierto a todos con estimación (motor) para la cantidad, aceptación de términos con enlace a `/terminos` y confirmación "Un asesor te contactará para confirmar tu participación" | `src/modules/finance/ui/**` (no `components/admin/**`), `src/app/(inversionista)/proyectos/[slug]/**` |
| III · Panel, términos y visitas | % junto a toda ganancia en panel y portafolio; en "mis proyectos" (participaciones del portafolio/panel) botón **Agendar visita a obra** (diálogo: fecha y franja preferidas → "El equipo te contactará para confirmar la visita"); tablero de proceso resumido por participación; página **`/terminos`** (riesgos y condiciones, placeholder legal revisable) y el paso de riesgos del registro la enlaza/acepta; menos repetición del aviso | `src/modules/investors/ui/components/{panel,auth}/**`, `src/modules/investors/ui/components/terms/**` (nuevo, exportar por `investors/ui.ts`), `src/app/(publico)/terminos/page.tsx`, `src/app/(inversionista)/{panel,portafolio}/**` |
| IV · Backoffice y shell | Menú lateral del admin con **iconos** y **desplegable** (colapsable; grupos si aporta), enlace "Términos y condiciones" en el pie del shell; vistas **detalladas**: `/admin/adquisiciones/[id]` (oportunidad: inmueble, imágenes, due diligence, cifras, decisión), detalle de proyecto (participaciones disponibles/colocadas, estado, presupuesto vs gasto, tablero de proceso, inversionistas, imágenes); panel y finanzas **más visuales** con gráficas Recharts | `src/shared/ui/app-shell/**`, `src/modules/{projects,finance,investors}/ui/components/admin/**`, `src/shared/ui/admin/**`, `src/app/admin/**` |

Mientras I no termine, II–IV escriben contra el contrato (los imports pueden fallar unos minutos). Nadie toca `eslint.config.mjs`, `architecture.modules.mjs`, `package.json`, `composition/` ni los barrels salvo para añadir exports propios.

## Cierre (orquestador)
`revisor-cumplimiento` ∥ `revisor-codigo`; E2E actualizado (rutas nuevas, simulador solo en abiertos, reserva → asesor, agendar visita, menú admin); `pnpm verify` + `pnpm build`; capturas en `docs/qa/ajustes/`.
