# 00 · Visión y alcance de la v1

> Estado: **v0.2 — validado por el usuario** (22-nov-2026). Cambios: ADR-003 (nombre Club M²), ADR-004 (ruedas internas), ADR-005 (identidad visual), ADR-006 (producto serio, no demo de hackathon).
> Fuente de verdad del negocio: `docs/referencia/modelo-negocio-club-inmobiliario.md`.
> Marcas: **[DEFINIDO]** viene del documento maestro · **[SUPUESTO]** lo propongo yo y hay que validarlo.

## 1. Qué estamos construyendo

Una **plataforma web responsive, completa y navegable** del club de inversión inmobiliaria **Club M²**, construida con calidad de producto (es la base de la Etapa 1 del maestro y crecerá hacia las Etapas 2–3): la cara pública (club, registro, proyectos, simulador, portafolio) y la cara interna (backoffice de adquisiciones, obras, comercialización, finanzas y CRM), conectadas por los mismos datos simulados.

El objetivo de la v1 es que un visitante (futuro miembro, aliado o inversionista de la empresa) entienda en 5 minutos:

1. Cómo la empresa compra rápido con capital propio. **[DEFINIDO]**
2. Cómo el inversionista financia la recuperación con participaciones de USD 100 y cómo se reparte el excedente (25% fondo / 75% empresa). **[DEFINIDO]**
3. Que todo es trazable: presupuesto, obra, venta, liquidación.
4. Que el club es premium, gratuito para entrar y honesto sobre riesgos.

## 2. Principios no negociables

1. **Nunca prometer rentabilidad fija ni fecha cierta.** Toda cifra futura es "proyección" o "escenario". **[DEFINIDO]**
2. **Separar siempre** capital aportado · ganancia realizada · proyección no realizada. **[DEFINIDO]**
3. **Todo es simulado** y la UI lo dice (banner "Demo · datos simulados"). **[SUPUESTO]**
4. **Un solo motor de cálculo** para reparto, ruedas (internas) y presupuesto. Ninguna pantalla calcula por su cuenta.
5. **Sin blockchain ni tokenización.** **[DEFINIDO]**
6. **Nombre comercial: Club M²** · eslogan *"Juntos sumamos metros."* (ADR-003). Vive en un solo archivo de configuración (`src/shared/config/brand.ts`); en código y URLs se escribe `M2`. **[DEFINIDO por el usuario]**
7. **Ruedas solo internas** (ADR-004): la clasificación buena/media/mala es una métrica operativa del backoffice; al inversionista se le muestran estado, cronograma, actualizaciones con fecha y plazo objetivo como proyección.

## 3. Alcance (in scope)

### 3.1 Cara pública e inversionista

| # | Pantalla | Contenido mínimo |
|---|---|---|
| P1 | Landing del club | Propuesta de valor, cómo funciona (compra → reforma → venta → reparto), riesgos, CTA registro gratis |
| P2 | Registro y onboarding | Registro gratis (sin auth real), perfil de experiencia, ticket de interés, aceptación de riesgos educativa |
| P3 | Marketplace | Lista de proyectos con etapa, participaciones disponibles, plazo objetivo (proyección), filtros |
| P4 | Ficha de proyecto | Inmueble, evidencia, presupuesto desglosado, escenarios conservador/base/optimista, **simulador de reparto 25/75**, cronograma de obra, actualizaciones, riesgos |
| P5 | Flujo de participación | Elegir N participaciones → resumen → aceptación de riesgos → "registro de interés / participación simulada" |
| P6 | Mi portafolio | Capital aportado, participaciones, estado por proyecto, realizado vs proyectado, liquidaciones |
| P7 | El club | Eventos/charlas, academia, comunidad, niveles de membresía futuros (solo vitrina) |
| P8 | Cuenta | Perfil, verificación (simulada), notificaciones |

### 3.2 Backoffice

| # | Módulo | Contenido mínimo |
|---|---|---|
| B1 | Dashboard | KPIs: capital inmovilizado, proyectos por etapa, % ruedas buenas/medias/malas (**solo aquí**), colocación |
| B2 | Adquisiciones | Pipeline (kanban) de oportunidades, checklist de due diligence, compra |
| B3 | Proyectos y obras | Presupuesto vs real, hitos, órdenes de trabajo, fotos, desvíos |
| B4 | Comercialización | Publicación, visitas, ofertas, cierre de venta |
| B5 | Finanzas | Caja por proyecto, capital propio vs externo, liquidación con el motor de reparto, conciliación |
| B6 | Inversionistas y CRM | Leads, embudo registro → habilitación → inversión, ticket, origen |

### 3.3 Herramientas de simulación

- **Selector de rol** (Visitante · Inversionista · Admin) en lugar de login real.
- **Reiniciar datos simulados** (vuelve a los datos semilla).
- **Escenarios precargados**: un proyecto en cada etapa y al menos una rueda buena, una media y una mala.

## 4. Fuera de alcance

- Autenticación real, KYC real, pagos reales, contratos legales reales.
- Backend o base de datos en producción (todo vive en el navegador; ver arquitectura).
- App nativa, multi-idioma, multi-moneda (solo USD, español).
- Cálculos fiscales y política de pérdidas definitiva (en el documento maestro está "pendiente"; la demo lo muestra como "por definir").

## 5. Criterio de éxito de la v1

- Recorrido completo sin errores en móvil (390 px) y desktop (1440 px).
- El simulador reproduce exactamente las tablas del documento maestro (100, 50 y 0 participaciones colocadas).
- Ninguna frase de la UI promete rendimiento (revisión de cumplimiento aprobada) y ninguna pantalla de inversionista muestra ruedas.
- Recorrido de presentación de 5 minutos escrito y ensayado (`docs/09-guion-demo.md`, F5) y URL pública en Vercel.

## 6. Supuestos a validar contigo

| ID | Supuesto | Alternativa | Estado (22-nov) |
|---|---|---|---|
| S1 | Stack Next.js + TypeScript + Tailwind + shadcn/ui (ver `01-arquitectura.md`) | Vite + React si no se quiere Next | ✅ aceptado |
| S2 | Sin backend: datos semilla + persistencia en `localStorage` detrás de repositorios intercambiables | Supabase si quieren datos compartidos entre dispositivos | ✅ aceptado (Supabase = siguiente adaptador) |
| S3 | Nombre **Club M²** (ADR-003) e identidad | Negro + dorado del placeholder | ✅ identidad completa de `marketing/02-branding.md`: paleta cal y arcilla, Fraunces + Inter + IBM Plex Mono, tuteo (ADR-005) |
| S4 | Selector de rol en vez de login | Login simulado con usuarios demo | ✅ aceptado |
| S5 | Excedente del simulador = venta − compra − presupuesto integral − costos de venta (hipótesis contractual del ejemplo del documento §6) | Otra fórmula si ya la definieron | ✅ aceptado |
| S6 | Despliegue en Vercel | Otro hosting | ✅ aceptado (cuenta creada el 22-nov) |
| S7 | Repositorio git local en esta carpeta; GitHub cuando lo crees | — | ✅ aceptado |
