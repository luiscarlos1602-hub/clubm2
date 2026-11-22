# ADR-010 · El lenguaje visual de la portada es la base de toda la app

Estado: **aceptado** (decisión del usuario, 22-nov-2026: "el tipo de diseño de la landing déjalo como base para todo el diseño del programa")
Fecha: 2026-11-22
Relacionado: ADR-009 (identidad visual), ADR-006 (producto serio)

## Contexto
La portada P1 fijó un estilo: bandas a todo el ancho que alternan Crema y Verde Profundo, rótulos en versalitas espaciadas, filetes Arena, tarjetas de radio amplio y mucho aire. Hasta ahora ese estilo vivía en clases sueltas dentro de `modules/club`; cada pantalla nueva lo habría copiado a mano o se habría desviado.

## Opciones consideradas
1. Documentar el estilo y que cada pantalla lo copie → deriva visual y clases duplicadas.
2. Variantes "inversas" en cada componente (botón claro, texto claro…) → explosión de props.
3. **Tonos de superficie por variables CSS + piezas de layout compartidas.** Elegida.

## Decisión
- **Tonos** (`globals.css`, `[data-tone]`): `light` (Crema), `paper` (Crema aclarado), `sand` (Crema + Arena), `dark` (Verde Profundo). Cada tono redefine las variables semánticas (`--foreground`, `--primary`, `--muted-foreground`, `--border`, `--line`, `--ring`, `--destructive`…), así que botones, textos, filetes y foco se adaptan sin clases especiales. Fondos con HEX fijo y contraste AA comprobado (sand oscurece el texto secundario a 5,55:1; dark usa Arena 9,2:1 y Óxido aclarado 6,5:1).
- **Token `line`** (`border-line`, `bg-line`, `text-line/20`): el filete de marca. Sustituye a `border-arena` en los componentes.
- **Token `highlight` / `highlight-foreground`**: realce de datos (barra del reparto, filete de cifra), Salvia con texto Verde Profundo en todos los tonos. Atención y error usan `destructive` (Óxido, aclarado en oscuro), nunca `primary`.
- **Tono `light`** redefine el juego semántico completo (`:root`); `paper` y `sand` lo heredan y solo cambian fondo/tarjeta. En `dark` el anillo de foco es Crema (≥ 3:1).
- **Piezas** en `src/shared/ui/layout/`: `Section` (banda + contenedor), `PageHeader` (cabecera oscura con un único h1), `Surface` (tarjeta; `variant="dark"` para un bloque oscuro dentro de una banda clara), `Eyebrow`, `IconTile`, `IndexLabel`, `BulletList`, `FaqList`, `PAGE_CONTAINER`.
- **Composición de pantalla:** `ZoneShell` compone siempre a todo el ancho (sin prop `content`): toda pantalla empieza con `PageHeader` y sigue con `Section`s. `RoutePlaceholder` ya lo hace, así que las 14 rutas comparten el lenguaje.
- **Reglas:** una banda = una idea; alternar tonos; lo que pide atención (riesgos, reparto, cierre) va en oscuro; un botón principal por banda; Arena y Salvia solo como filete/fondo o como texto sobre oscuro; versalitas espaciadas para rótulos, Plex Mono solo para códigos, numeración y fechas.

## Consecuencias
- `modules/club/ui/components/landing/` es la implementación de referencia.
- `/sistema` muestra los cuatro tonos (bloque "00 · Lenguaje visual").
- La skill `nueva-pantalla` y `src/shared/ui/README.md` exigen usar estas piezas; una clase de color de marca a mano (`bg-verde-profundo`, `text-crema`) en un módulo es señal de que falta una pieza o un tono.
- Las capturas de F1 (`docs/qa/F1/`) quedan desactualizadas: se regeneran con `pnpm capturas`.
