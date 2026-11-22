# Marketing, naming y branding · v0.1

> Estado: **primera propuesta para decidir** (22-nov-2026). Marcas: **[DEFINIDO]** viene del documento maestro · **[SUPUESTO]** lo propongo yo y hay que validarlo · **[DECIDIR]** lo eliges tú.
> Carpeta independiente de `docs/`: no modifica los documentos de arquitectura, agentes ni workflow. Todo copy de esta carpeta pasa por `node scripts/check-copy.mjs marketing` y por `revisor-cumplimiento`.

| Archivo | Qué contiene |
|---|---|
| `01-naming.md` | 7 nombres con racional, verificación de dominios y recomendación |
| `02-branding.md` | Posicionamiento, personalidad, tono, paleta (con contrastes), tipografía, logo y moodboard |
| `03-mensajes-clave.md` | Promesa, pilares, mensajes por audiencia y etapa, objeciones y frases prohibidas |
| `04-plan-de-captacion.md` | Plan por etapa del embudo, canales, calendario de 90 días, KPI y presupuesto orientativo |

## Decisiones que necesito de ti (en orden)

1. ✅ **[DEFINIDO] Nombre: Club M² · eslogan "Juntos sumamos metros."** (22-nov-2026, ver `docs/decisiones/ADR-003-nombre-club-m2.md`). Pendiente: comprar `clubm2.com`, revisar `@clubm2` en redes, `.com.ve` y registro mixto en SAPI (clases 36 y 41).
2. ✅ **[DEFINIDO] Tuteo** (ADR-005). Tú (cercano, digital), con "usted" en contratos y asesoría de tickets altos.
3. ✅ **[DEFINIDO] Paleta Verde Profundo, Crema, Arena, Salvia, Musgo y Óxido** (ADR-009, que sustituye a la de ADR-005).
4. **[DECIDIR] Rostro de la marca.** ¿Habrá un fundador visible en contenido? El plan de captación depende mucho de esto.
5. **[DECIDIR] Ciudad del primer piloto** (afecta mensajes locales y eventos). Supuesto: Caracas.

Nombre, tono y paleta definidos: el hilo de producto los implementa en `brand.ts` y los tokens (F1-6). Las ruedas son internas (ADR-004): no se usan en piezas de marketing. <!-- copy-ok: nota interna de planificación, no es pieza pública -->
