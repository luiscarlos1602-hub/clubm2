# 08 · Preguntas por funcionalidad

> Estado: **bloques 🔴 respondidos el 22-nov-2026** (ver §Decisiones); 🟠 y 🟢 siguen abiertos y se preguntan al empezar la fase que los usa. Cada pregunta trae mi **propuesta por defecto**: si estás de acuerdo basta con responder "ok bloque X". Las respuestas se pasan a los docs correspondientes y a un ADR cuando cambian una decisión.
> Prioridad: 🔴 la necesito antes de F1 · 🟠 antes de la fase que la usa · 🟢 puede esperar.

## Decisiones del 22-nov-2026 (respuestas del usuario)

| Pregunta | Respuesta | Registro |
|---|---|---|
| A1 Hackathon | Se deja de lado: se trabaja como **proyecto serio** | ADR-006 |
| A2 / A3 / K5 Nombre e identidad | **Club M² · "Juntos sumamos metros."** con toda la referencia de `marketing/` (paleta cal y arcilla, Fraunces + Inter + IBM Plex Mono, tono) | ADR-003 · ADR-005 |
| A4 Tratamiento | Tuteo (propuesta por defecto) | `06` |
| A5 / A6 | Propuesta por defecto (presentación en vivo + URL; Caracas + Valencia) | — |
| B1–B3 Stack | Aceptado: Next + TS + Tailwind + shadcn, sin backend, selector de rol | ADR-001 |
| B4 Equipo | **Trabaja solo** | `04 §2.2` |
| B5 Cuentas | GitHub: sí · Vercel: se crea el 22-nov | `07` |
| D1–D7 Simulador | Propuestas por defecto aceptadas | `02 §4` |
| H1–H4 Liquidación | Propuestas por defecto aceptadas | `02` |
| K1–K4 Motor | Propuestas por defecto; **las ruedas son internas y no se muestran a inversionistas** | ADR-004 |

## Bloque A · Marca, alcance y hackathon 🔴 (respondido)

| # | Pregunta | Propuesta por defecto |
|---|---|---|
| A1 | ¿Fecha y duración de la presentación? ¿Hay criterios de evaluación del jurado? | — (necesito el dato para priorizar fases) |
| A2 | ¿Nombre comercial o placeholder? | "Club Inmobiliario" en `brand.ts`, cambiable en 1 minuto |
| A3 | ¿Paleta e identidad? ¿Tienes logo o referencias visuales (akka.app u otras)? | Premium oscuro: negro/grafito + dorado suave + blanco roto; tipografía serif para títulos |
| A4 | ¿Tuteo o usted? | Tuteo |
| A5 | ¿La demo la presenta una persona en vivo, o el jurado también la navega solo? | Ambas: guion en vivo + URL pública |
| A6 | ¿Ciudad(es) de los proyectos simulados? | Caracas (Chacao, Los Palos Grandes, El Hatillo) + 1 en Valencia |

## Bloque B · Stack y datos 🔴 (respondido)

| # | Pregunta | Propuesta por defecto |
|---|---|---|
| B1 | ¿Aceptas Next.js + TypeScript + Tailwind + shadcn/ui? | Sí |
| B2 | ¿Demo sin backend (datos en el navegador) o quieres base de datos real (Supabase)? | Sin backend; puerto listo para Supabase |
| B3 | ¿Login simulado con selector de rol, o login con usuarios demo? | Selector de rol |
| B4 | ¿Trabajas solo o con un equipo que también va a programar? (afecta ramas y revisiones) | — |
| B5 | ¿Tienes ya cuentas de GitHub y Vercel para el proyecto? | — |

## Bloque C · Landing y registro (P1, P2) 🟠

| # | Pregunta | Propuesta por defecto |
|---|---|---|
| C1 | ¿Qué datos pide el registro? | Nombre, email, teléfono (WhatsApp), ciudad, experiencia (ninguna/algo/experto), ticket de interés (100 / 250 / 500 / 1.000+), cómo nos conociste |
| C2 | ¿El onboarding incluye un mini-curso o quiz de riesgos antes de poder "participar"? | Sí: 3 tarjetas educativas + aceptación de riesgos |
| C3 | ¿Mostramos métricas del club en la landing (miembros, proyectos)? | Sí, rotuladas como simuladas |
| C4 | ¿Testimonios? | No (serían inventados); en su lugar "cómo funciona" con un caso ilustrativo |

## Bloque D · Marketplace, ficha y simulador (P3, P4, P5) 🔴 (respondido)

| # | Pregunta | Propuesta por defecto |
|---|---|---|
| D1 | ¿Excedente = venta − compra − presupuesto integral − costos de venta? (`02-modelo-de-dominio.md §4`) | Sí |
| D2 | ¿Cuántos proyectos simulados? | 7 (uno por etapa + ruedas buena/media/mala, visibles solo en backoffice) |
| D3 | ¿El simulador deja mover: precio de venta, participaciones a comprar, colocación total, sobrecosto de obra y retraso? | Sí, con presets de estrés |
| D4 | ¿Mínimo y máximo de participaciones por persona? | Mín. 1, máx. 20 por proyecto |
| D5 | ¿Qué pasa al "participar" en la demo? | Reserva simulada → aparece en portafolio como "pendiente de confirmación" |
| D6 | ¿Se muestra la dirección exacta? | No: zona y mapa aproximado |
| D7 | ¿Los honorarios de la empresa se muestran desglosados en la ficha? | Sí (transparencia, maestro §10) |

## Bloque E · Portafolio y cuenta (P6, P8) 🟠

| # | Pregunta | Propuesta por defecto |
|---|---|---|
| E1 | ¿El usuario demo ya trae historial (proyectos liquidados) o empieza vacío? | Trae historial: 1 liquidado, 2 en curso, para que el portafolio luzca |
| E2 | ¿Botón "reinvertir" al liquidar? | Sí, lleva al marketplace con el monto prellenado |
| E3 | ¿Notificaciones dentro de la app? | Sí, campana con actualizaciones de proyectos |
| E4 | ¿Descarga de estados de cuenta (PDF)? | No en la demo |

## Bloque F · El club (P7) 🟢

| # | Pregunta | Propuesta por defecto |
|---|---|---|
| F1 | ¿Mostramos niveles de membresía (Member, Explorer, Investor Pro, Private Circle)? | Sí como "próximamente", sin precios |
| F2 | ¿Los niveles dan límites de inversión distintos o solo beneficios? (decisión abierta del maestro §13) | Solo beneficios educativos y de comunidad |
| F3 | ¿Inscripción a eventos simulada? | Sí |
| F4 | ¿Muro de comunidad / comentarios? | No en la demo; solo eventos y academia |

## Bloque G · Backoffice operativo (B2, B3, B4) 🟠

| # | Pregunta | Propuesta por defecto |
|---|---|---|
| G1 | Due diligence: ¿qué ítems del checklist? | Título, gravámenes, ocupación, permisos, inspección física, costos de cierre, comparables (maestro §8) |
| G2 | ¿Criterio mínimo para comprar (margen mínimo, precio máximo)? | Margen mínimo en escenario conservador ≥ 30% — **dato tuyo** |
| G3 | ¿Roles internos distintos (adquisiciones, obra, finanzas) o un solo admin? | Un solo admin en la demo; permisos modelados |
| G4 | ¿Las órdenes de obra tienen aprobación? | Sí: creada → aprobada → en ejecución → cerrada |
| G5 | ¿Las acciones del admin se reflejan en vivo en la cara del inversionista? (p. ej. publicar avance de obra) | Sí: es el "momento wow" de la demo |

## Bloque H · Finanzas y liquidación (B5) 🔴 (respondido)

| # | Pregunta | Propuesta por defecto |
|---|---|---|
| H1 | Al liquidar, ¿orden de cobro? | 1) costos de venta 2) capital de compra empresa 3) capital de participaciones 4) excedente 25/75 |
| H2 | Si hay pérdida, ¿cómo se muestra? | "Política de pérdidas por definir" + escenario con capital devuelto parcial, sin repartir |
| H3 | Honorarios/contingencia no consumidos: ¿vuelven al excedente o a la empresa? | Vuelven a caja del proyecto y se muestran como "remanente" (sin decidir destino) |
| H4 | ¿Mostramos impuestos? | Solo como línea "otros costos" editable |

## Bloque I · CRM y growth (B6) 🟢

| # | Pregunta | Propuesta por defecto |
|---|---|---|
| I1 | Etapas del embudo | Lead → registrado → onboarding completo → verificado → primera participación → reinversor |
| I2 | Orígenes de leads | Instagram, TikTok, YouTube, LinkedIn, referido, evento, paid |
| I3 | ¿KPIs del dashboard? | Los de maestro §14: registros, conversión, ticket promedio, días para colocar, % ruedas, capital inmovilizado |

## Bloque J · IA y extras 🟢

| # | Pregunta | Propuesta por defecto |
|---|---|---|
| J1 | ¿Función de IA en vivo (borrador de actualización a inversionistas)? | Sí si tienes API key de Claude; si no, texto pre-generado |
| J2 | ¿Fotos reales disponibles? | Unsplash |

## Bloque K · Reglas del motor y coherencia (detectadas en la revisión agéntica, 22-nov) 🔴 (respondido)

| # | Pregunta | Propuesta por defecto |
|---|---|---|
| K1 | Redondeo del reparto cuando no divide exacto (p. ej. fondo de 2.250,01 entre 100) | Por participación hacia abajo al centavo; residuo a la empresa, registrado |
| K2 | ¿"Mes" de las ruedas es mes calendario o 90/180 días? | Mes calendario desde la fecha de compra |
| K3 | Inmueble vendido después de 6 meses: ¿qué rueda es? (el maestro solo define "mala" en cartera) | "Mala (vendida)" |
| K4 | La rueda se mide desde la compra: ¿hasta la firma de venta o hasta el cobro? | Hasta la firma de venta; el cobro se muestra aparte |
| K5 | Identidad: la demo usa placeholder "Club Inmobiliario" negro + dorado; `marketing/` propone paleta "cal y arcilla". ¿Cuál entra en la demo? | ✅ Nombre resuelto: **Club M² · "Juntos sumamos metros."** (ADR-003) → `brand.ts` en F1. Paleta: "cal y arcilla" en tokens — **aceptada** el 22-nov (ADR-005) |

## Bloque L · Motor y estados (F1-3, 22-nov) 🟠

| # | Pregunta | Propuesta por defecto |
|---|---|---|
| L1 | Si el 25 % del excedente no da centavos exactos (p. ej. excedente de 0,01), ¿cómo se redondea el fondo? | Hacia abajo al centavo; el sobrante va al 75 % de la empresa (igual que K1) |
| L2 | Rueda (K2) con compra a fin de mes (31-ago + 6 meses), ¿qué fecha es el límite? | El último día del mes destino (28 o 29-feb) |
| L3 | Un proyecto "estancado" (`stalled`), ¿a qué estados puede pasar? | Volver a "en venta" o pasar a "vendido" |
| L4 | ¿Se puede descartar una oportunidad sin pasar por due diligence? | No; se mantiene el diagrama de `02 §2` |
| L5 | El estado "estancado" deriva de la rueda mala (ADR-004). ¿Qué ve el inversionista cuando su proyecto está estancado? | Etapa "en venta" con las actualizaciones fechadas y el plazo objetivo como proyección; la palabra "estancado" solo en el backoffice |
| L7 | ¿Instalamos `@vitest/coverage-v8` para exigir cobertura 100 % del motor (`01 §1`)? | Sí, solo como dependencia de desarrollo |
| L9 | ¿El "hoy" de la demo es la fecha de Caracas? | Sí, America/Caracas |
```


## Bloque M · App navegable (F1-5, 22-nov) 🟠

| # | Pregunta | Propuesta por defecto |
|---|---|---|
| M1 | ¿El visitante puede ver el marketplace y las fichas sin registrarse? | Sí |
| M2 | ¿El rol activo se recuerda al recargar y sobrevive a "Reiniciar datos simulados"? | Sí y sí |
| M3 | ¿`/como-funciona` es una ruta propia o una sección de P1? | Sección de P1 |

## Bloque N · Datos simulados (F1-4, 22-nov) 🟠

| # | Pregunta | Propuesta por defecto |
|---|---|---|
| N1 | El proyecto con más de 6 meses sin venta, ¿se siembra como "en venta" o como "estancado"? | "En venta"; "estancado" lo marca el admin en B4 y solo se ve en el backoffice |
| N2 | ¿Todos los proyectos simulados usan 100 participaciones de USD 100 (USD 10.000)? | Sí, la referencia del maestro, hasta que definas otra |
| N3 | Precios de compra/venta simulados entre USD 34.000 y 88.000 según zona y m², ¿te sirven o tienes datos de mercado? | Usar los del plan 003, rotulados como simulados |
| N4 | Si alguien vuelve a la demo semanas después, ¿las fechas se congelan o se recalculan? | Se congelan hasta "Reiniciar datos simulados", que vuelve a sembrar con fechas relativas a hoy |
| N5 | ¿Nombre y perfil del inversionista demo? | Se definen en F2 (P8) con el módulo investors; F1-4 solo fija el id |
| N6 | ¿"Reiniciar datos simulados" también reinicia el rol elegido? | No, solo los datos |
| N7 | La oportunidad en due diligence (M2-007), ¿aparece en el marketplace? | No; solo en el backoffice (B2). Se confirma en P3 |
```

## Bloque O · Landing y capital sin excedente (22-nov) 🔴

| # | Pregunta | Propuesta por defecto |
|---|---|---|
| O1 | Si el proyecto se liquida sin excedente (o con pérdida), ¿qué parte del capital aportado se devuelve y cómo se informa? (H2 del maestro: pendiente) | Mostrar "por definir" en toda pantalla hasta decidirlo; nunca sugerir devolución del capital |
