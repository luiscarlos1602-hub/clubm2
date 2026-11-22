# 02 · Dirección de branding

> Nombre y eslogan **[DEFINIDO por el usuario, 22-nov-2026 · ADR-003]**: **Club M² · Juntos sumamos metros.** Paleta, tipografía y tono **aceptados** el 22-nov-2026 (`docs/decisiones/ADR-005-identidad-visual-club-m2.md`).

## Posicionamiento
**Para** venezolanos (en el país y en la diáspora) que quieren poner a trabajar ahorros pequeños o medianos en inmuebles reales, **Club M² es** el club de inversión inmobiliaria **que te deja ver cada operación por dentro**: la compra, la obra, los números y la venta. **A diferencia de** promesas de rentabilidad o grupos de WhatsApp sin respaldo, cada proyecto se documenta con evidencia, fechas y responsables, y se explica en comunidad.

- **Categoría:** club de inversión inmobiliaria (no "plataforma de inversión", no "fondo").
- **Beneficio central:** acceso y comprensión. Participar desde USD 100 en proyectos que puedes seguir paso a paso.
- **Razón para creer:** la empresa compra con capital propio antes de ofrecer nada; todo se publica (presupuesto, avances, desvíos, resultado).
- **Diferencial emocional:** pertenencia a una comunidad que aprende junta, no la fantasía del dinero fácil.

## Personalidad
| Es | No es |
|---|---|
| Anfitriona: te recibe y te explica | Vendedora agresiva |
| Transparente, incluso con lo que sale mal | Opaca o triunfalista |
| Premium por el cuidado y el criterio | Premium por lujo ostentoso o exclusividad falsa |
| Experta que traduce | Técnica que intimida |
| Venezolana, contemporánea | Folclórica o nostálgica |

**Arquetipo:** *El Anfitrión Sabio* (mezcla de Cuidador + Sabio).

## Tono de voz
- **Tuteo** [DECIDIR], frases cortas, verbos concretos ("compramos", "medimos", "publicamos").
- Se celebra la **evidencia**, no el rendimiento: "Así va la obra", "Esto costó", "Esto cambió y por qué".
- Cifras siempre con contexto: plazo **objetivo**, escenario **base**, resultado **realizado**.
- Humor leve y local permitido en contenido social; nunca en fichas de proyecto ni reportes.
- Se alinea con `docs/06-guia-de-contenido.md` (vocabulario prohibido y reglas de cifras).

Ejemplos:
- ✅ "Compramos esta casa en El Paraíso el 3 de noviembre. Mira cómo está por dentro, metro a metro."
- ✅ "La obra va 12 días atrasada por la impermeabilización. Te contamos qué pasó."
- ❌ "Gana 50% en 3 meses con Club M²."

## Paleta "cal y arcilla" [DECIDIR]
Inspirada en las casas venezolanas: paredes de cal, tejas de arcilla, herrajes de latón, el verde del Ávila al anochecer. Cálida y premium sin caer en el negro + dorado de las promesas de riqueza.

| Rol | Nombre | HEX | Uso |
|---|---|---|---|
| Fondo claro | Cal | `#F4EFE6` | Fondo principal de web y documentos |
| Texto / fondo oscuro | Grafito noche | `#16181A` | Texto, modo oscuro, piezas premium |
| Primario | Verde Ávila | `#1F3A33` | Bloques de marca, headers, botón secundario |
| Acento | Arcilla | `#9A4529` | Botón principal (CTA), enlaces |
| Acento suave | Arcilla clara | `#B5573A` | Ilustraciones, iconos grandes, fondos de destacado |
| Detalle | Latón | `#B8935A` | Líneas finas, sellos, numeración de proyecto. Nunca como texto pequeño sobre claro |
| Neutro | Piedra | `#6B655C` | Texto secundario sobre Cal |

Contraste (WCAG) verificado: Grafito sobre Cal 15,5:1 · Cal sobre Verde Ávila 10,7:1 · Arcilla `#9A4529` sobre Cal 5,6:1 · Latón sobre Grafito 6,2:1 · Piedra `#6B655C` sobre Cal 5,0:1. Latón sobre Verde Ávila (4,3:1) solo para textos grandes.

**Colores de estado** (reutilizan la paleta): positivo = Verde Ávila, en curso = Latón, atención = Arcilla. Nunca rojo/verde de bolsa. Las ruedas son internas (ADR-004) y no aparecen en piezas de marketing. <!-- copy-ok: nota interna de planificación, no es pieza pública -->

## Tipografía [SUPUESTO]
Todas gratuitas (Google Fonts), listas para la web de la demo.
- **Títulos:** *Fraunces* (serif con carácter, cálida, con un toque artesanal). Pesos 500–600, tamaños grandes.
- **Texto e interfaz:** *Inter* (muy legible en móvil, tiene cifras tabulares para tablas de presupuesto).
- **Datos y códigos de proyecto:** *IBM Plex Mono* (p. ej. `M2-001`, fechas de actualización).
- Alternativa si se quiere más sobria: *Cormorant Garamond* + *Manrope*.

## Logo (dirección, no diseño final)
- **Wordmark** "Club M²" con Fraunces ajustada; el **"²" en latón** es el elemento gráfico de la marca.
- **Símbolo:** el "²" solo (o una "M" con el "²"), dentro de un cuadrado de proporción 1:1, que evoca un metro cuadrado / un lote visto desde arriba. Funciona como favicon y como sello de "proyecto verificado".
- **Sello de proyecto:** cuadrado de latón con el código `M2-001` y la fecha de compra, usado en fichas y contenido.
- **Eslogan:** *"Juntos sumamos metros."* debajo del wordmark o a su derecha, en Inter.
- **Escritura digital:** donde no se pueda usar "²" (dominios, usuarios, hashtags) se escribe **M2** (`clubm2.com`, `@clubm2`). En voz alta: "Club **eme dos**".

## Moodboard descriptivo
1. **Fotografía documental**, luz natural de mañana, sin filtros saturados: manos midiendo una pared, planos sobre una mesa, una llave en una cerradura antigua.
2. **Antes y después** en el mismo encuadre, con fecha y código del proyecto superpuestos en Plex Mono.
3. **Texturas:** cal rugosa, baldosa hidráulica, madera de puerta vieja, latón gastado.
4. **Arquitectura venezolana:** quintas de los 50, zaguanes coloniales, rejas de hierro, celosías, patios con matas. Moderno-tropical, no colonial de postal.
5. **Personas reales** del equipo y la comunidad, en obra y en charlas. Nada de stock de ejecutivos sonriendo ni fajos de billetes.
6. **Gráficos limpios:** barras de presupuesto vs. gasto real, línea de tiempo de la obra. Mucho aire, una sola idea por pieza.

**Evitar:** dorado brillante, autos de lujo, gráficos de velas, flechas hacia arriba, "lifestyle de millonario", relojes de cuenta regresiva.
