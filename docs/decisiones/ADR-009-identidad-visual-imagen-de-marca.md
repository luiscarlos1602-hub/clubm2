# ADR-009 · Identidad visual desde la imagen de marca (reemplaza la parte visual de ADR-005)

Estado: **aceptado** (el usuario entregó la imagen de branding el 22-nov-2026 y pidió construir la landing "siguiendo la imagen de branding")
Fecha: 2026-11-22
Relacionado: ADR-005 (tono y estados siguen vigentes), ADR-003 (nombre y eslogan)

## Contexto
ADR-005 adoptó la paleta "cal y arcilla", Fraunces + Inter y un wordmark con el "²" en latón. El usuario entregó después una lámina de marca cerrada: símbolo de casa, wordmark "Club M²" con filete separador y descriptor "Club de inversión inmobiliaria", cuatro colores y tipografía Parkinsans. Es la identidad que verá el público; el producto debe seguirla.

## Opciones consideradas
1. Mantener "cal y arcilla" y usar la imagen solo en marketing → dos marcas distintas entre redes y producto.
2. Adoptar la imagen en todo el sistema de diseño, con dos colores funcionales para lo que la lámina no cubre (texto secundario y atención). **Elegida.**

## Decisión
- **Paleta de marca:** Verde Profundo `#0D1A16` (texto, bloques de marca, acción principal) · Crema `#F2EDE6` (fondo) · Arena `#C7B8A6` (líneas, sellos, botón secundario) · Salvia `#9AA38F` (apoyo y fondos de destacado).
- **Funcionales (no son de marca, no van en piezas de marketing):** Musgo `#55615A` (texto secundario, 5,6:1 sobre Crema) · Óxido `#8A4A2C` (atención y `destructive`, 5,8:1 sobre Crema). Sigue sin haber rojo ni verde de bolsa.
- **Contraste:** Verde Profundo / Crema 15,3:1 · Arena sobre Verde Profundo 9,2:1 · Salvia sobre Verde Profundo 6,8:1. Arena (1,7:1) y Salvia (2,3:1) **nunca** como texto sobre Crema.
- **Tipografía:** Parkinsans (títulos, texto, interfaz y cifras) e IBM Plex Mono (códigos `M2-001` y fechas). Se retiran Fraunces e Inter.
- **Logo:** símbolo de casa + filete + "Club M²" (el "²" como superíndice del mismo color). `BrandSymbol` usa un trazado provisional dibujado desde la imagen; se reemplaza por el SVG oficial sin cambiar la API. Descriptor en `brand.descriptor`.
- **Radio** base 10 px (`--radius: 0.625rem`), coherente con el ícono de app de la lámina.

## Consecuencias
- Cambian `brand.ts`, `globals.css` (`@theme` y variables semánticas), `layout.tsx` (fuentes), `Wordmark`, `/sistema` y las clases de color de `shared/ui` (`laton→arena`, `verde-avila/grafito→verde-profundo`, `arcilla→oxido`, `arcilla-clara→salvia`, `piedra→musgo`, `cal→crema`).
- `marketing/02-branding.md` se actualiza en el mismo cambio (paleta, tipografía, logo).
- Las capturas de F1-2 y F1-5 (`docs/qa/F1/`) quedan desactualizadas: se regeneran con `pnpm capturas`.
- Pendiente (docs/mejoras.md): SVG oficial del símbolo, favicon e ícono; comprobar que Parkinsans tiene cifras tabulares (`tnum`) para tablas de presupuesto o usar Plex Mono en esas columnas.
