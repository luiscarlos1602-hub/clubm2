# Prompt · F1 · Fundación visual (pegar en Claude Code, en la raíz del proyecto)

> **Histórico (F1 cerrada).** Las menciones a Vercel de este prompt quedaron reemplazadas: el despliegue es en **Netlify** (ADR-017) y se hace en F5-1.

Eres el agente principal (orquestador) de **Club M²**. Vamos a ejecutar la fase **F1 · Fundación visual**. Trabajo solo: yo apruebo decisiones de producto y merges; tú orquestas a los subagentes de `.claude/agents/`.

## 0 · Antes de tocar nada
1. Lee `CLAUDE.md`, `docs/estado.md`, `docs/planes/000-hoja-de-ruta.md` y los ADR 001–007 (solo su sección "Decisión").
2. Respóndeme en ≤ 5 líneas qué vas a hacer y en qué orden. No me pidas aprobación para empezar: empieza.

## 1 · Git (primer paso)
- Ya existe `.git` sin commits y un `.gitignore`. Si `git config user.name` está vacío, pregúntame nombre y correo antes del commit.
- Commit inicial en `main`: `docs: F0 fundamentos, arquitectura agéntica y decisiones`.
- Cada fila de F1 va en su rama `feat/<modulo>-<desc>` y se integra a `main` cuando pase `verificar` y revisión (pídeme el ok del merge).

## 2 · Ejecuta F1 con la skill `ciclo-funcionalidad`, fila por fila
Orden: **F1-1 → (F1-2 ∥ F1-3) → F1-4 → F1-5**, y **F1-6** en cuanto F1-1 esté en `main`.

### F1-1 · Andamiaje (lo haces tú, sin subagentes)
- `create-next-app` no acepta una carpeta con archivos: genera en `./_scaffold` y mueve el contenido a la raíz **sin pisar** `CLAUDE.md`, `README.md`, `docs/`, `.claude/`, `scripts/`, `marketing/`; fusiona `.gitignore`. Luego elimina `_scaffold`.
- Usa la **última versión estable** de Next.js (App Router, `src/`, TypeScript `strict`, Tailwind v4, ESLint, alias `@/*`). Si es distinta de "Next.js 15" de `docs/01 §1`, crea un ADR nuevo (skill `registrar-decision`) que lo actualice; no edites ADR-001.
- Instala y configura: shadcn/ui, Zod, TanStack Query, Zustand, React Hook Form, Recharts, Lucide, Vitest, Playwright (proyectos 390 px y 1440 px), fast-check, eslint-plugin-boundaries, Prettier, lefthook.
- `architecture.modules.mjs` con el orden de módulos de `docs/01 §4 regla 3`; `eslint.config.mjs` genera las reglas de capas desde ese archivo + las reglas de `docs/01 §8.1` (domain puro, dinero solo en motor, API por audiencia de §8.3), con mensajes que citan la sección del doc.
- Scripts: `dev`, `build`, `lint`, `typecheck`, `test`, `e2e`, `verify:fast` (tsc + lint + `node scripts/check-copy.mjs`), `verify` (+ vitest + playwright). Pre-commit con lefthook → `verify:fast`.
- Crea la estructura vacía de `src/` de `docs/01 §3` solo con lo que F1 usa (no adelantes módulos de F3).

### F1-2 · Design system Club M² (`constructor-ui`) — en paralelo con F1-3
- Fuente: `marketing/02-branding.md` + ADR-003 + ADR-005. Tokens en `src/app/globals.css` (`@theme`): Cal `#F4EFE6`, Grafito noche `#16181A`, Verde Ávila `#1F3A33`, Arcilla `#9A4529` (CTA), Arcilla clara `#B5573A`, Latón `#B8935A`, Piedra `#6B655C`. Sin rojo/verde de bolsa.
- Tipografía con `next/font/google`: Fraunces (títulos), Inter (texto, cifras tabulares), IBM Plex Mono (códigos `M2-001`, fechas).
- `src/shared/config/brand.ts`: `name: "Club M²"`, `shortName: "M2"`, `tagline: "Juntos sumamos metros."`. Es el único lugar del código con el nombre.
- Tematiza las primitivas de shadcn y crea en `src/shared/ui/brand/`: `MoneyDisplay`, `ProjectionLabel`, `StatusBadge`, `DemoBanner`, `ProjectSeal` (sello de latón con `M2-001` y fecha), `SectionHeading`, `EmptyState`, skeletons; `legal-copy.ts` con los avisos fijos de `docs/06`. Catálogo en `src/shared/ui/README.md`.
- Página interna **`/sistema`** que muestra paleta, tipografía, botones, tarjeta de proyecto, cifras (capital · realizado · proyección), avisos legales y estados vacío/carga/error.
- Dirección visual: premium cálido y documental, mucho aire, una idea por bloque; evita el look de plantilla genérica.
- **PUNTO DE CONTROL:** al terminar F1-2, envíame capturas de `/sistema` en 390 px y 1440 px (Playwright, guardadas en `docs/qa/F1/`) y **espera mi aprobación** antes de empezar F1-5. F1-3 y F1-4 pueden seguir mientras tanto.

### F1-3 · Motor (`dominio-financiero`) — en paralelo con F1-2
- Skill `motor-reparto`. `shared/domain`: Money (centavos), Percentage (puntos básicos), Result, Id, Clock.
- `modules/finance`: reparto 25/75 con los casos canónicos **C1–C6** como tests con ese nombre, invariantes y tests de propiedades con fast-check; redondeo K1.
- `modules/projects`: estados del proyecto con transiciones válidas; ruedas con bordes K2–K4 expuestas **solo** por `modules/projects/backoffice.ts` (ADR-004).

### F1-4 · Datos simulados (`datos-demo`)
- Skill `datos-semilla`. 7 proyectos `M2-001…M2-007` con los escenarios de `docs/01 §6` (zonas: Chacao, Los Palos Grandes, El Hatillo, El Paraíso en Caracas; uno en Valencia), un inversionista demo con historial (1 liquidado, 2 en curso), montos derivados calculados con el motor, fechas relativas al `Clock`.
- Composition root (`composition/container.ts` + `composition/modules/<m>.ts`), demo-store en `localStorage` (`club-demo:v1`) y "Reiniciar datos simulados". `seed-consistency.test.ts` en verde.

### F1-5 · App navegable (`constructor-ui`) — tras mi aprobación de `/sistema`
- Layouts de las 3 zonas: `(publico)`, `(inversionista)`, `admin/`. Navegación responsive (móvil primero), selector de rol (Visitante · Inversionista · Admin), banner "Datos simulados · no es una oferta de inversión".
- Crea **las 14 rutas** (P1–P8, B1–B6 de `docs/00 §3`), cada una con encabezado, una frase de qué hará, estado vacío de marca y el enlace al siguiente paso del flujo de negocio (`docs/planes/000 §El flujo`). Sin funcionalidad todavía: es el mapa navegable del producto.
- `data-testid` en la navegación y un E2E que recorre las 14 rutas en 390 y 1440.

### F1-6 · GitHub y Vercel (tú)
- Si `gh auth status` funciona: crea el repo **privado** `clubm2` y haz push de `main`. Si no, dame el comando exacto para hacerlo yo.
- Si `vercel whoami` funciona: `vercel link` al proyecto `clubm2`, previews por rama y producción desde `main`. Si no, dime los pasos para importar el repo en vercel.com (ya tengo cuenta o la creo con GitHub).

## 3 · Reglas durante toda la fase
- Lo no negociable está en `CLAUDE.md` (sin promesas, capital/realizado/proyección separados, motor único, ruedas internas, todo simulado).
- Revisores en paralelo (`revisor-codigo` ∥ `revisor-cumplimiento`) en F1-2, F1-3 y F1-5. Máximo 2 rondas; a la tercera, te detienes y me lo planteas.
- Preguntas de producto que no estén resueltas en `docs/08`: **no inventes**, toma la propuesta por defecto, márcala [SUPUESTO] y la listas al final.
- Actualiza `docs/estado.md` al cerrar cada fila. Hallazgos menores → `docs/mejoras.md`.
- No instales dependencias fuera de `docs/01 §1` y de esta lista sin preguntarme.

## 4 · Cierre
Corre la skill `cerrar-fase` para F1 y envíame: qué quedó, URL de Vercel, capturas clave, supuestos tomados y las decisiones que necesitas para empezar **F2 · Flujo del inversionista**.
