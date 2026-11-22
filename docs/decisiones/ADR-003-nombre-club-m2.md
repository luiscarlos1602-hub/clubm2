# ADR-003 · Nombre comercial y eslogan: Club M²
Estado: **aceptado** (decidido por el usuario)
Fecha: 2026-11-22

## Contexto
El documento maestro deja el nombre comercial "por definir" (§17). La demo usaba el placeholder "Club Inmobiliario". El nombre debía decir **inversión inmobiliaria**, sonar a club con criterio, no prometer rentabilidad y funcionar como sistema de submarcas. Detalle de las cuatro rondas en `marketing/01-naming.md`.

## Opciones consideradas
1. Zaguán (ronda 1): descartado, muy "casa".
2. Revalora (ronda 2): describe el modelo, pero el territorio "valor" está saturado y queda cerca de la promesa de ganancia.
3. Cuadra (ronda 3): descartado por el usuario, muy informal.
4. **Club M²** (ronda 4): unidad de medida de la inversión inmobiliaria, corto, gráfico y premium.

## Decisión
- **Nombre:** Club M². En código, dominios, usuarios y URLs se escribe **M2**. En voz alta: "Club eme dos".
- **Eslogan:** *"Juntos sumamos metros."*
- **Sistema:** Academia M², Visitas M², proyectos `M2-001`, `M2-002`…
- **Dominio objetivo:** `clubm2.com` (libre según RDAP al 22-nov-2026, sin reservar).

## Consecuencias
- `src/shared/config/brand.ts` (F1) toma `name: "Club M²"`, `shortName: "M2"`, `tagline: "Juntos sumamos metros."`.
- Códigos de proyecto en datos semilla: prefijo `M2-` (antes `Z-` en los borradores de marketing).
- No usar "Metro Cuadrado" como nombre hablado ni escrito: Metrocuadrado.com es un portal inmobiliario conocido en Colombia.
- Pendientes antes de invertir en identidad: comprar `clubm2.com` (y `metroametroclub.com` como defensivo), revisar `@clubm2` en Instagram/TikTok/LinkedIn y `.com.ve`, y registrar **marca mixta** (logo + "Club M²") en SAPI, clases 36 y 41: "M2" solo es descriptivo y puede ser rechazado como marca denominativa.
- Plan B si falla SAPI o redes: Revalora.
