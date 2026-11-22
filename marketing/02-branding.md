# 02 · Dirección de branding

> Nombre y eslogan **[DEFINIDO por el usuario, 22-nov-2026 · ADR-003]**: **Club M² · Juntos sumamos metros.** Tono aceptado el 22-nov-2026 (ADR-005). Paleta, tipografía y logo según la imagen de marca (ADR-009).

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

## Paleta [DEFINIDO por la imagen de marca · ADR-009]
Cuatro colores de la lámina de marca: sobria, natural, premium por el cuidado y no por el lujo.

| Rol | Nombre | HEX | Uso |
|---|---|---|---|
| Primario | Verde Profundo | `#0D1A16` | Texto, bloques de marca, botón principal, modo oscuro |
| Fondo claro | Crema | `#F2EDE6` | Fondo principal de web y documentos; texto sobre Verde Profundo |
| Detalle | Arena | `#C7B8A6` | Líneas finas, sellos, botón secundario. Como texto, solo sobre Verde Profundo |
| Apoyo | Salvia | `#9AA38F` | Fondos de destacado, gráficos. Como texto, solo sobre Verde Profundo |

Funcionales del producto (no van en piezas de marketing): Musgo `#55615A` (texto secundario) y Óxido `#8A4A2C` (atención).

Contraste (WCAG): Verde Profundo / Crema 15,3:1 · Arena sobre Verde Profundo 9,2:1 · Salvia sobre Verde Profundo 6,8:1 · Musgo sobre Crema 5,6:1 · Óxido sobre Crema 5,8:1. Arena y Salvia sobre Crema no llegan a 4,5:1: nunca como texto ahí.

**Colores de estado:** positivo = Verde Profundo, en curso = Arena, atención = Óxido. Nunca rojo/verde de bolsa. Las ruedas son internas (ADR-004) y no aparecen en piezas de marketing. <!-- copy-ok: nota interna de planificación, no es pieza pública -->

## Tipografía [DEFINIDO · ADR-009]
- **Principal:** *Parkinsans* (Google Fonts): títulos (300–600, el titular combina ligera y seminegrita), texto e interfaz.
- **Datos y códigos de proyecto:** *IBM Plex Mono* (p. ej. `M2-001`, fechas de actualización).
- **Rótulos:** versalitas con espaciado amplio ("CLUB DE INVERSIÓN INMOBILIARIA").

## Logo [DEFINIDO · ADR-009]
- **Símbolo:** una casa con su cara lateral y dos vanos que suben (metros que se suman). Funciona solo como ícono de app, favicon y sello.
- **Wordmark:** símbolo + filete vertical + "Club M²" en Parkinsans; el "²" como superíndice del mismo color.
- **Descriptor:** "Club de inversión inmobiliaria", en versalitas espaciadas, a la derecha o debajo.
- **Versiones:** Verde Profundo sobre Crema y Crema sobre Verde Profundo.
- **Eslogan:** *"Juntos sumamos metros."*
- **Escritura digital:** donde no se pueda usar "²" (dominios, usuarios, hashtags) se escribe **M2** (`clubm2.com`, `@clubm2`). En voz alta: "Club **eme dos**".

## Moodboard descriptivo
1. **Fotografía documental**, luz natural de mañana, sin filtros saturados: manos midiendo una pared, planos sobre una mesa, una llave en una cerradura antigua.
2. **Antes y después** en el mismo encuadre, con fecha y código del proyecto superpuestos en Plex Mono.
3. **Texturas:** concreto y piedra clara, madera, vegetación; luz cálida de tarde sobre fachadas.
4. **Arquitectura venezolana:** quintas de los 50, zaguanes coloniales, rejas de hierro, celosías, patios con matas. Moderno-tropical, no colonial de postal.
5. **Personas reales** del equipo y la comunidad, en obra y en charlas. Nada de stock de ejecutivos sonriendo ni fajos de billetes.
6. **Gráficos limpios:** barras de presupuesto vs. gasto real, línea de tiempo de la obra. Mucho aire, una sola idea por pieza.

**Evitar:** dorado brillante, autos de lujo, gráficos de velas, flechas hacia arriba, "lifestyle de millonario", relojes de cuenta regresiva.
