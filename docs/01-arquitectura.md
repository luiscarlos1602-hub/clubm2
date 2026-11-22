# 01 · Arquitectura y estructura del código

> Estado: **propuesta v0.1 — pendiente de validar**. Este documento es ley para todo el código. Si algo no encaja, se cambia aquí primero (con un ADR en `docs/decisiones/`) y después en el código.

## 1. Stack [SUPUESTO S1, S2]

| Pieza | Elección | Por qué |
|---|---|---|
| Framework | **Next.js 16 (App Router)** (ADR-008) | Rutas por carpeta, layouts por zona (público / inversionista / admin), despliegue trivial en Vercel |
| Lenguaje | **TypeScript `strict`** | El motor financiero no admite `any` |
| Estilos | **Tailwind CSS v4** + **shadcn/ui** (Radix) | Componentes accesibles y editables, look premium rápido |
| Validación | **Zod** | Esquemas para formularios y semillas |
| Estado de datos | **TanStack Query** sobre repositorios | Cache, estados de carga/error, invalidación tras "comprar" |
| Estado de UI | **Zustand** (solo rol activo y preferencias de demo) | Mínimo y explícito |
| Gráficas | **Recharts** | Suficiente para KPIs y escenarios |
| Formularios | **React Hook Form** + Zod | |
| Tests unitarios | **Vitest** | Motor de reparto con cobertura 100% |
| Tests E2E | **Playwright** | Recorrido dorado en móvil y desktop |
| Calidad | ESLint + **eslint-plugin-boundaries** + Prettier + `tsc --noEmit` | Las reglas de capas se **verifican**, no se confían |
| Paquetes | **pnpm** | |
| Datos | Semillas TypeScript + adaptador `localStorage` | Demo sin servidor; cambiar a Supabase = escribir otro adaptador |

## 2. Estilo arquitectónico

**Monolito modular por dominios + capas limpias (hexagonal ligera).**

- El código se divide primero por **módulo de negocio** (proyectos, participaciones, finanzas…), no por tipo técnico.
- Dentro de cada módulo hay **4 capas** con dependencias en una sola dirección.
- Un **composition root** único decide qué implementación (mock hoy, real mañana) usa cada puerto.

```
            ┌──────────────────────────────────────────┐
            │  app/  (rutas Next: solo composición)    │
            └───────────────┬──────────────────────────┘
                            │ usa
            ┌───────────────▼──────────────────────────┐
            │  modules/<m>/ui   (componentes + hooks)  │
            └───────────────┬──────────────────────────┘
                            │ llama casos de uso
            ┌───────────────▼──────────────────────────┐
            │  modules/<m>/application                 │
            │  casos de uso + PUERTOS (interfaces)     │
            └───────────────┬──────────────────────────┘
                            │ usa
            ┌───────────────▼──────────────────────────┐
            │  modules/<m>/domain                      │
            │  entidades, reglas, cálculos PUROS       │
            └──────────────────────────────────────────┘
                            ▲ implementa puertos
            ┌───────────────┴──────────────────────────┐
            │  modules/<m>/infrastructure              │
            │  adaptadores mock (semillas+localStorage)│
            └──────────────────────────────────────────┘
       composition/ conecta infrastructure → application
```

## 3. Estructura de carpetas

```
Proyecto Inmobiliario/
├── CLAUDE.md                      # Reglas para cualquier agente (lee esto primero)
├── README.md                      # Cómo correr la demo
├── docs/
│   ├── 00-vision-y-alcance.md
│   ├── 01-arquitectura.md         # (este archivo)
│   ├── 02-modelo-de-dominio.md    # Entidades, fórmulas, casos de prueba canónicos
│   ├── 03-agentes-y-skills.md
│   ├── 04-workflow.md
│   ├── 05-revision-y-mejora.md
│   ├── 06-guia-de-contenido.md    # Vocabulario permitido/prohibido, tono premium
│   ├── 07-herramientas-de-terceros.md  # Demo vs producción
│   ├── 08-preguntas-por-funcionalidad.md
│   ├── 09-guion-demo.md           # (F5)
│   ├── estado.md                  # Tablero único de avance (lo lee toda sesión nueva)
│   ├── plantillas/                # brief, plan, entrega, informe de revisión (handoffs)
│   ├── planes/                    # NNN-<feature>.md, generados por el arquitecto
│   ├── qa/                        # Capturas por fase
│   ├── decisiones/                # ADR-NNN-titulo.md (una decisión por archivo)
│   ├── mejoras.md                 # Backlog vivo de mejoras y deuda
│   └── referencia/
│       └── modelo-negocio-club-inmobiliario.md
├── .claude/
│   ├── settings.json              # Permisos y hooks del proyecto
│   ├── hooks/                     # proteger-fuentes.sh, post-edicion.sh
│   ├── agents/                    # Subagentes (ver 03)
│   └── skills/                    # Skills del proyecto (ver 03)
├── scripts/
│   └── check-copy.mjs             # Guardarraíl de copy sin promesas (ver 06)
├── architecture.modules.mjs       # Lista ordenada de módulos → reglas de capas de ESLint
├── src/
│   ├── app/                       # ── CAPA DE RUTAS ──
│   │   ├── layout.tsx             # Providers globales, fuentes, banner demo
│   │   ├── globals.css            # Tokens de diseño (Tailwind v4 @theme)
│   │   ├── (publico)/             # Sin sesión
│   │   │   ├── page.tsx           # P1 Landing
│   │   │   ├── registro/          # P2
│   │   │   └── como-funciona/
│   │   ├── (inversionista)/       # Layout con navegación del miembro
│   │   │   ├── proyectos/                 # P3 Marketplace
│   │   │   ├── proyectos/[slug]/          # P4 Ficha + simulador
│   │   │   ├── proyectos/[slug]/participar/  # P5
│   │   │   ├── portafolio/                # P6
│   │   │   ├── club/                      # P7
│   │   │   └── cuenta/                    # P8
│   │   └── admin/                 # Layout backoffice (sidebar)
│   │       ├── page.tsx                   # B1 Dashboard
│   │       ├── adquisiciones/             # B2
│   │       ├── proyectos/[id]/            # B3 (obra, presupuesto, hitos)
│   │       ├── comercializacion/          # B4
│   │       ├── finanzas/                  # B5 (incluye liquidación)
│   │       └── crm/                       # B6
│   │
│   ├── modules/                   # ── MÓDULOS DE NEGOCIO ──
│   │   ├── projects/              # Inmueble, proyecto, etapas, hitos, actualizaciones, ruedas (internas, ver §8.3)
│   │   ├── participations/        # Clases de participación, colocación, retenidas
│   │   ├── finance/               # Motor de reparto, presupuesto, caja, liquidaciones
│   │   ├── acquisitions/          # Pipeline de oportunidades, due diligence
│   │   ├── renovations/           # Órdenes de obra, contratistas, gastos reales
│   │   ├── sales/                 # Publicación, visitas, ofertas, cierre
│   │   ├── investors/             # Usuarios, perfiles, verificación, portafolio
│   │   ├── club/                  # Eventos, academia, membresías (vitrina)
│   │   └── crm/                   # Leads, embudo, origen, métricas
│   │
│   │   # Cada módulo tiene EXACTAMENTE esta forma:
│   │   # modules/<modulo>/
│   │   # ├── CLAUDE.md                 # contexto local para agentes (≤ 30 líneas)
│   │   # ├── domain/
│   │   # │   ├── <entidad>.ts          # tipos + funciones puras
│   │   # │   ├── <regla>.ts            # p. ej. classify-wheel.ts
│   │   # │   └── <regla>.test.ts       # tests junto al código
│   │   # ├── application/
│   │   # │   ├── ports.ts              # interfaces: XRepository, Clock…
│   │   # │   └── <caso-de-uso>.ts      # p. ej. reserve-participations.ts
│   │   # ├── infrastructure/
│   │   # │   ├── <x>.mock-repository.ts
│   │   # │   └── seed.ts               # datos semilla del módulo
│   │   # ├── ui/
│   │   # │   ├── components/           # componentes del módulo
│   │   # │   ├── hooks/                # useProjects(), useSimulation()…
│   │   # │   └── copy.ts               # textos visibles del módulo (revisión de cumplimiento)
│   │   # └── index.ts                  # ÚNICA API pública del módulo
│   │
│   ├── shared/                    # ── TRANSVERSAL (sin lógica de negocio específica) ──
│   │   ├── domain/                # Money, Percentage, Id, Result, DateRange
│   │   ├── ui/                    # Design system: primitivas shadcn + componentes de marca
│   │   │   ├── primitives/        # button, card, dialog… (generadas por shadcn)
│   │   │   ├── README.md          # catálogo de componentes (lo leen los agentes antes de crear uno)
│   │   │   ├── brand/             # MoneyDisplay, StatusBadge, ProjectionLabel, DemoBanner, legal-copy.ts
│   │   │   └── showcase/          # Secciones de la página interna /sistema
│   │   ├── infrastructure/        # demo-store (localStorage), clock, reset
│   │   ├── lib/                   # formateadores es-VE, cn(), utilidades
│   │   └── config/
│   │       ├── brand.ts           # Nombre comercial, claims, colores — UN solo lugar
│   │       └── demo.ts            # Flags de demo
│   │
│   └── composition/               # ── COMPOSITION ROOT ──
│       ├── container.ts           # Instancia repositorios y casos de uso (1 línea por módulo)
│       ├── modules/<modulo>.ts    # register<Modulo>(): evita conflictos de merge en paralelo
│       └── providers.tsx          # QueryClient + contexto del container
│
├── tests/
│   └── e2e/                       # Playwright: recorrido-inversionista.spec.ts, recorrido-admin.spec.ts
├── public/images/                 # Fotos de inmuebles (antes/después) libres de derechos
└── package.json, tsconfig.json, eslint.config.mjs, playwright.config.ts, vitest.config.ts
```

## 4. Reglas de dependencia (verificadas por ESLint)

| Desde ↓ puede importar → | domain propio | application propio | infra propio | ui propio | `index.ts` de otro módulo | shared/domain | shared/ui·lib | composition |
|---|---|---|---|---|---|---|---|---|
| **domain** | ✅ | ❌ | ❌ | ❌ | ✅ solo tipos/funciones de domain | ✅ | ❌ | ❌ |
| **application** | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ | ✅ lib | ❌ |
| **infrastructure** | ✅ | ✅ (puertos) | ✅ | ❌ | ❌ | ✅ | ✅ lib/infra | ❌ |
| **ui** | ✅ tipos | ✅ vía hooks | ❌ | ✅ | ✅ ui pública | ✅ | ✅ | ✅ solo `useContainer()` |
| **app/** | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ | ✅ | ✅ providers |
| **composition** | — | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ |

Reglas adicionales:

1. **`domain/` es puro**: sin React, sin Next, sin `fetch`, sin `localStorage`, sin `Date.now()` ni `Math.random()` (el reloj y los ids se inyectan).
2. **Prohibido importar rutas internas de otro módulo** (`modules/finance/domain/x`): solo `modules/finance`.
3. **Sin ciclos entre módulos.** Orden permitido (de base a cima):
   `shared → projects → participations → finance → acquisitions · renovations · sales → investors → club · crm`
   Un módulo solo importa de los que están a su izquierda. Si se necesita lo contrario, es señal de que la regla pertenece a otro módulo: se discute en un ADR.
4. **`app/` no contiene lógica**: un `page.tsx` compone componentes de `modules/*/ui` y nada más (objetivo: < 60 líneas).
5. **Ninguna pantalla calcula dinero.** Todo número financiero sale de `modules/finance` (motor de reparto, presupuesto) o de `modules/projects` (ruedas).

## 5. Convenciones

| Tema | Regla |
|---|---|
| Idioma del código | **Inglés** (identificadores, archivos, tipos). Idioma de UI, docs y commits: **español** |
| Rutas URL | Español (`/proyectos`, `/portafolio`) — es lo que ve el usuario |
| Archivos | `kebab-case.ts`; componentes `PascalCase.tsx`; tests `*.test.ts` junto al archivo |
| Dinero | **Enteros en centavos** (`Money = { cents: number; currency: 'USD' }`). Prohibido `number` suelto para montos. Redondeo solo en `shared/domain/money.ts` |
| Porcentajes | `Percentage` en puntos básicos (2500 = 25%) |
| Fechas | ISO string en datos; `Clock` inyectado para "hoy" (permite "viajar en el tiempo" en la demo) |
| Errores de negocio | `Result<T, DomainError>`; no se lanzan excepciones en domain |
| Exportaciones | Solo nombradas (`export function`), nada de `export default` salvo `page.tsx`/`layout.tsx` |
| Componentes | Server Components por defecto; `"use client"` solo donde haya interacción o datos del demo-store |
| Textos de UI | Sin promesas de rendimiento; verbos y etiquetas de `docs/06-guia-de-contenido.md` |

## 6. Datos simulados

- Cada módulo define su `seed.ts` tipado. `shared/infrastructure/demo-store.ts` combina semillas + cambios del usuario guardados en `localStorage` con clave versionada (`club-demo:v1`).
- "Reiniciar demo" borra esa clave.
- Las semillas deben **cuadrar**: los montos de una liquidación sembrada se recalculan con el motor y un test lo verifica (`seed-consistency.test.ts`).
- Escenarios mínimos: 1 oportunidad en due diligence, 1 proyecto en colocación (63/100), 1 en obra, 1 en venta, 1 liquidado rueda buena, 1 liquidado rueda media, 1 rueda mala (en cartera > 6 meses).

## 7. Cómo crecerá (para el jurado)

Cambiar a datos reales = implementar los mismos puertos con Supabase/Postgres en `infrastructure/` y cambiar una línea en `composition/container.ts`. Ni el dominio ni la UI se tocan. Esta es la razón de toda la estructura.

## 8. Código optimizado para agentes (ADR-002)

El código lo escriben y revisan agentes que empiezan cada tarea sin memoria. Estas reglas reducen el contexto que necesitan y convierten errores probables en errores imposibles o inmediatos.

### 8.1 Reglas verificadas por herramientas (F1-3)
| Regla | Mecanismo | Mensaje de error (cita el doc) |
|---|---|---|
| Capas y API pública (§4) | `eslint-plugin-boundaries` generado desde `architecture.modules.mjs` | "Import prohibido entre capas — ver docs/01 §4" |
| `domain/` puro | `no-restricted-globals` (`Date`, `Math.random`, `localStorage`, `fetch`) y `no-restricted-imports` (`react`, `next/*`) en `src/modules/*/domain/**` | "domain es puro: inyecta Clock/IdGenerator — docs/01 §4 regla 1" |
| Dinero solo en el motor | `no-restricted-syntax` sobre aritmética con `.cents` fuera de `shared/domain`, `modules/finance`, `modules/projects` | "Ninguna pantalla calcula dinero — docs/01 §4 regla 5" |
| Sin `any`, sin `export default` (salvo page/layout), sin `console.log` | reglas de `typescript-eslint` / `import` | — |
| Copy sin promesas | `scripts/check-copy.mjs` en `verify:fast` y en el hook de edición | Sugiere el texto permitido |
| Ruedas solo internas (ADR-004) | `no-restricted-imports`: `app/(publico)`, `app/(inversionista)` y `ui/components/investor/` no importan `modules/*/backoffice`; `check-copy` regla R9 sobre la palabra "rueda" | "Las ruedas son internas — docs/01 §8.3" |
| Fuentes de verdad intocables | hook `proteger-fuentes.sh` + `deny` en `.claude/settings.json` | Explica cómo proceder (ADR) |

Los mensajes de error citan la sección del doc: un agente que choca con la regla sabe dónde leer cómo corregirla.

### 8.2 Forma del código
1. **Un archivo = un concepto**, < 200 líneas; nombres que dicen lo que hacen (`calculate-distribution.ts`, nunca `utils.ts` ni `helpers.ts`).
2. **Tipos explícitos en fronteras** (`index.ts`, puertos, props): son el contrato que el siguiente agente lee en vez de leer la implementación.
3. **Tests junto al código** y con nombres de negocio (`C4 · venta con costos de 1.000`); un fallo dice qué regla se rompió.
4. **Sin magia**: nada de metaprogramación, reflexión ni configuración implícita que obligue a leer medio repo para entender un archivo.
5. **`CLAUDE.md` por módulo** (≤ 30 líneas) con propósito, invariantes, dependencias permitidas y trampas conocidas.
6. **Copy en `ui/copy.ts`**, avisos legales en `shared/ui/brand/legal-copy.ts`.
7. **`data-testid`** estables en kebab-case en todo lo que el E2E toca.
8. **Ids de semilla legibles** (`prj_chacao_01`) para que logs y tests sean comprensibles sin buscar.
9. **Puntos de registro por módulo** (`composition/modules/<m>.ts`, `architecture.modules.mjs`): agregar un módulo no edita archivos compartidos más que en una línea.
10. **Comandos acotados**: `pnpm vitest run src/modules/<m>` en segundos; el feedback rápido es lo que permite a un agente iterar.

### 8.3 API pública por audiencia (ADR-004)
Un módulo puede tener **dos** entradas públicas:
- `index.ts`: lo que cualquier capa `ui` o `app/` puede usar.
- `backoffice.ts`: lo exclusivo del backoffice (ruedas, KPIs internos, márgenes). Solo lo importan `app/admin/**` y `ui/components/admin/**`.

Los componentes de `ui/components/` se separan en `investor/`, `admin/` y `shared/`. Así una regla de negocio de visibilidad ("el inversionista no ve ruedas") es una regla de imports que el lint comprueba, no una instrucción que un agente puede olvidar.
