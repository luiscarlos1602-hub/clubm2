# 06 · Guía de contenido, tono y cumplimiento

> Estado: **propuesta v0.1**. La usa la skill `copy-sin-promesas` y el `revisor-cumplimiento`.

## Tono
Premium, cercano y honesto. Frases cortas. Tuteo (decidido; "usted" solo en contratos y asesoría de tickets altos, `marketing/02`). Se celebra la transparencia, no el rendimiento.

## Vocabulario

| ❌ Prohibido | ✅ Usar |
|---|---|
| acción, accionista, dueño del inmueble | participación económica, participante |
| ganancia garantizada, rentabilidad asegurada, retorno fijo | proyección, escenario, resultado realizado |
| "ganas 50%", "duplica tu dinero" | "en el escenario base, la proyección por participación es…" |
| inversión segura, sin riesgo | "toda inversión puede sufrir pérdidas" |
| ¡últimos cupos!, solo hoy, exclusivo por tiempo limitado | "participaciones disponibles: 37 de 100" |
| te pagamos en 3 meses | "plazo objetivo: 3 meses · proyección, no garantizada" |
| rueda buena / media / mala (de cara al inversionista) | etapa del proyecto, cronograma, "plazo objetivo" (las ruedas son internas, ADR-004) |
| club privado / acceso restringido (falso) | "registro gratuito y abierto" |

## Reglas de presentación de cifras
1. Montos con formato `USD 10.000` (punto de miles, coma decimal, locale es-VE).
2. Cifras futuras siempre con `<ProjectionLabel>` ("Proyección · no garantizada").
3. En portafolio, tres columnas siempre separadas: **Capital aportado · Ganancia realizada · Proyección**.
4. Debajo de todo simulador: "Simulación ilustrativa. Los resultados dependen de la venta real, los costos y los contratos aplicables. Puedes perder parte o la totalidad de tu aporte."
5. ~~Banner fijo "Datos simulados · no es una oferta de inversión"~~ — retirado por decisión del usuario (ADR-011). El componente `DemoBanner` sigue en el catálogo; el pie lleva el aviso de ejemplo y de riesgo.

## Textos legales de la demo
Placeholder genérico revisable; nunca se presentan como contrato real.


## Reglas añadidas por revisión (F1-5)
- Ningún botón o enlace nombra una acción que la demo todavía no ejecuta (p. ej. «Regístrate»): mientras sea vista previa, el rótulo dice «Vista previa de…» o «Ver cómo será…».
- No usar «Pronto» ni otros marcadores de tiempo en estados vacíos: «Esta sección mostrará…».
- Los selectores de rol o escenario de la demo se rotulan como simulación y aclaran que no son una sesión real.
- Una cifra de proyección nunca va en tamaño mayor que el capital en la misma vista; `destructive` solo para acciones irreversibles; toda tarjeta con cupos lleva el aviso de riesgo cercano.
- Prohibido «real/reales» para describir proyectos, inmuebles o casos de la demo (permitido en «gasto real» del backoffice y «venta real» del descargo). Mientras sea demo, titular y CTA no usan verbos de transacción («Invierte», «Compra»): «Participa», «Conoce», «Explora». Todo texto sobre qué recibe el participante al liquidar dice que no está garantizado. Lo que describe el funcionamiento del club va en condicional/futuro o con «Así funcionará».
