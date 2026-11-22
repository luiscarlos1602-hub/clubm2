# 07 · Herramientas de terceros: demo vs producción

> Estado: **propuesta v0.1**. Criterio para la demo: **costo cero, sin claves de API, sin datos reales**. Para producción: lo que pide el documento maestro (§11, §12, §15) en el orden de su roadmap.
> Leyenda: 🟢 se usa en la demo · 🔵 solo producción · ❓ depende de una respuesta tuya (ver `08-preguntas-por-funcionalidad.md`).

## 1. Base técnica

| Necesidad | v1 (Etapa 1, datos simulados) | Producción (Etapa 2–3 del maestro) | Notas |
|---|---|---|---|
| Código y versiones | 🟢 Git local → **GitHub** | GitHub | Necesito que crees el repo cuando quieras subirlo |
| Hosting | 🟢 **Vercel** (plan Hobby; cuenta creada el 22-nov) | Vercel Pro | URL pública; despliegue automático desde `main` |
| Base de datos | 🟢 Ninguna: semillas + `localStorage` | 🔵 **Supabase** (Postgres) | Alternativa: Neon. La arquitectura ya deja el puerto listo |
| Autenticación | 🟢 Selector de rol simulado | 🔵 **Supabase Auth** (email + Google, magic link) | Alternativa: Clerk |
| Archivos (fotos, documentos) | 🟢 Imágenes en `public/` | 🔵 Supabase Storage o **Cloudinary** | Documentos legales en bucket privado con URLs firmadas |
| Errores y monitoreo | — | 🔵 **Sentry** | |

## 2. Inversionistas y dinero

| Necesidad | Demo | Producción | Notas |
|---|---|---|---|
| Verificación de identidad (KYC) | 🟢 Simulada (estados: pendiente → verificado) | 🔵❓ **Didit**, **MetaMap** o **Sumsub** | Validar cuál acepta cédula venezolana y su costo por verificación |
| Firma de contratos | 🟢 Checkbox de aceptación + PDF ilustrativo | 🔵 **Dropbox Sign** o **DocuSign** | Solo cuando exista instrumento jurídico habilitado (maestro §15) |
| Recepción de aportes | 🟢 Simulada | 🔵❓ Zelle / transferencia USD / USDT (Binance Pay) / Pago Móvil con **conciliación manual** y comprobante | Stripe no opera para comercios en Venezuela. Es una decisión legal y operativa, no técnica |
| Contabilidad | — | 🔵❓ Software contable local + exportación desde el backoffice | |

## 3. Comunicación, comunidad y growth

| Necesidad | Demo | Producción | Notas |
|---|---|---|---|
| Email transaccional | 🟢 Vista previa en pantalla ("este correo se enviaría") | 🔵 **Resend** + React Email | Bienvenida, verificación, actualizaciones de proyecto |
| Email marketing / newsletter | — | 🔵 **Brevo** o Mailchimp | |
| WhatsApp | 🟢 Botón "Escríbenos" (enlace wa.me) | 🔵 **WhatsApp Business Cloud API** (Meta) | Canal principal en Venezuela ❓ |
| CRM | 🟢 Módulo propio con datos simulados | 🔵❓ Propio (ya modelado) o **HubSpot** gratis | Recomiendo propio + exportación |
| Analítica de producto | 🟢 Opcional: **Vercel Analytics** | 🔵 **PostHog** (embudos registro → inversión) + **Meta Pixel** / Google Tag para campañas | |
| Eventos y charlas | 🟢 Calendario propio simulado | 🔵 **Luma** o Cal.com + Zoom / Google Meet / YouTube Live | |
| Comunidad | 🟢 Vitrina en "El club" | 🔵❓ Propia, **Circle**, Discord o comunidad de WhatsApp | |
| Academia / video | 🟢 Fichas de cursos con video de YouTube | 🔵 YouTube no listado o **Mux** | |

## 4. Contenido y visual

| Necesidad | Demo | Producción |
|---|---|---|
| Fotos de inmuebles (antes/después) | 🟢 **Unsplash** (licencia libre) o fotos tuyas ❓ | Fotos reales del proyecto |
| Mapa con ubicación aproximada | 🟢 **Leaflet + OpenStreetMap** (gratis, sin clave) | Mapbox o Google Maps |
| Íconos y tipografía | 🟢 **Lucide** + Google Fonts | Igual |
| Logo e identidad | 🟢 Placeholder tipográfico ❓ | Identidad definitiva |

## 5. Inteligencia artificial (maestro §11, hipótesis)

| Caso | Demo | Producción |
|---|---|---|
| Borrador de actualización semanal a inversionistas | 🟢❓ Opcional: botón en backoffice que genera el borrador con **Claude API** (requiere una API key tuya) o texto pre-generado | Claude API con revisión humana |
| Resumen de documentos / detección de desvíos | — | Claude API |

## 6. Resumen: qué necesito de ti para la demo

1. Nada de pago es obligatorio.
2. Una cuenta de **GitHub** (repo) y **Vercel** (despliegue) cuando lleguemos a F5.
3. Opcional: una **API key de Claude** si quieres la función de IA en vivo; si no, la simulo.
4. Opcional: fotos reales o logo si los tienes.
