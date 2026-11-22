# ADR-012 · Maqueta visual completa antes de interconectar
Estado: **aceptado** (decisión del usuario, 22-nov-2026: "necesito que a nivel visual esté el sistema completo para poder avanzar… después nos encargamos de irlo interconectando")
Fecha: 2026-11-22
Relacionado: ADR-007 (orden de fases), ADR-010 (lenguaje visual), ADR-011

## Contexto
Tras P1 (landing) y P3 (marketplace con datos semilla), el usuario pide ver todo el sistema visualmente —inicio de sesión, panel, propiedades y fichas de ejemplo, backoffice— antes de construir la lógica fila por fila.

## Decisión
- Se construye una **maqueta navegable** de todas las pantallas: `/ingresar` (acceso de demostración, sin validar credenciales), `/panel` (inicio del inversionista), fichas de los proyectos semilla, participar, portafolio, cuenta, registro y las 6 pantallas del backoffice.
- Los datos que aún no existen en el dominio se muestran con **ejemplos literales** en `ui/components/*/examples.ts` (centavos, con origen citado: semilla M2-00X o caso C#). Ninguna pantalla calcula dinero; lo que ya existe (marketplace, motor de reparto) se usa directamente.
- Cada módulo expone sus pantallas por `ui.ts` (además de `index.ts` para lógica). `ui.ts` es API pública (lint `module-api`); `composition` no lo importa.
- Las reglas no negociables siguen: sin promesas, capital/realizado/proyección separados, ruedas solo en backoffice, copy con `check-copy`.
- El ciclo completo (arquitecto → paquetes → revisores) se aplica al interconectar cada pantalla; la maqueta pasa por `revisor-cumplimiento` y E2E de rutas.

## Consecuencias
- Sin selector "Simular rol" (pedido del usuario): el rol lo fija `/ingresar` ("Entrar" → inversionista y `/panel`; "Acceso del equipo" → admin y `/admin`) y "Salir" vuelve a visitante. "Reiniciar datos simulados" pasa al pie.
- `route-map.ts` gana `login` y `panel`; la navegación pública muestra "Ingresar"; el rol inversionista aterriza en `/panel`.
- El plan 006 (P4 completo) queda como borrador para la fase de interconexión.
- `docs/estado.md` registra la maqueta como fila V-1 de F2.
