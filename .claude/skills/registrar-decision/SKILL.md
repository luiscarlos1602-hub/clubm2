---
name: registrar-decision
description: Registra una decisión de arquitectura o de producto como ADR en docs/decisiones. Úsala cuando cambie un supuesto, una regla de capas, el stack o una fórmula.
---

# Registrar decisión (ADR)

1. Siguiente número libre en `docs/decisiones/` → `ADR-NNN-<titulo-kebab>.md`.
2. Plantilla:
   ```
   # ADR-NNN · <Título>
   Estado: propuesto | aceptado | reemplazado por ADR-XXX
   Fecha: AAAA-MM-DD
   ## Contexto
   ## Opciones consideradas
   ## Decisión
   ## Consecuencias
   ```
3. Nunca edites un ADR aceptado: crea uno nuevo que lo reemplace y actualiza el estado del anterior.
4. Si la decisión cambia un documento de `docs/`, actualízalo en el mismo cambio.
5. Las decisiones de producto (fórmulas, textos de riesgo, alcance) quedan "propuesto" hasta que el usuario las acepte.
