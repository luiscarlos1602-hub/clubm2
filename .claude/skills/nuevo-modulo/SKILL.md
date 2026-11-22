---
name: nuevo-modulo
description: Crea un módulo de negocio nuevo en src/modules con la estructura exacta de capas, su CLAUDE.md local, copy.ts y registro en composition y en las reglas de capas. Úsala la primera vez que un plan toque un módulo que no existe.
---

# Nuevo módulo

1. Confirma que el módulo está en `docs/01-arquitectura.md §3` y su posición en el orden de dependencias (§4 regla 3). Si no está, detente y usa `registrar-decision`.
2. Crea exactamente:
   ```
   src/modules/<modulo>/
   ├── CLAUDE.md          (≤ 30 líneas, plantilla abajo)
   ├── domain/            (tipos + funciones puras + *.test.ts)
   ├── application/ports.ts
   ├── infrastructure/<x>.mock-repository.ts
   ├── infrastructure/seed.ts
   ├── ui/components/
   ├── ui/hooks/
   ├── ui/copy.ts         (textos visibles del módulo)
   └── index.ts           (solo exportaciones nombradas: tipos de domain, casos de uso, hooks y componentes públicos)
   ```
3. Registro sin conflictos de merge:
   - `src/composition/modules/<modulo>.ts` exporta `register<Modulo>(container)`; `container.ts` solo añade una línea de import/llamada.
   - Añade el nombre en `architecture.modules.mjs` (lista ordenada de módulos que consume `eslint.config.mjs`). Nunca edites a mano las reglas de boundaries por módulo.
4. Corre `verificar` (modo rápido).

## Plantilla `CLAUDE.md` del módulo
```
# modules/<modulo>
Propósito: <1 línea>
Entidades: <lista> (ver docs/02 §3)
Reglas/invariantes: <bullets cortos; enlaza docs/02 §N>
Puede importar de: shared, <módulos a su izquierda>
API pública: index.ts → <exports principales>
Comandos: pnpm vitest run src/modules/<modulo>
Trampas conocidas: <se llena en retros>
```
Claude Code carga este archivo al trabajar dentro de la carpeta: es contexto local y barato. Mantenlo corto y actualízalo cuando una retro detecte un error repetido en el módulo.
