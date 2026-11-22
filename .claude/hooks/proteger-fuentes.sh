#!/usr/bin/env bash
# PreToolUse (Edit|Write|MultiEdit). Bloquea escrituras en fuentes de verdad.
# Exit 2 = bloquea la herramienta y el mensaje de stderr le llega al agente.
input="$(cat)"
file="$(printf '%s' "$input" | sed -n 's/.*"file_path"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' | head -1)"
[ -z "$file" ] && exit 0
rel="${file#"$CLAUDE_PROJECT_DIR"/}"

case "$rel" in
  docs/referencia/*)
    echo "BLOQUEADO: $rel es el documento maestro del negocio (solo lectura). Si algo cambia, regístralo con la skill registrar-decision y pregúntale al usuario." >&2
    exit 2 ;;
  .env|.env.*)
    echo "BLOQUEADO: no se editan archivos de secretos." >&2
    exit 2 ;;
  docs/decisiones/ADR-*.md)
    if [ -f "$file" ] && grep -qiE '^Estado:[[:space:]]*\**aceptado' "$file"; then
      echo "BLOQUEADO: $rel está ACEPTADO. No se edita un ADR aceptado: crea uno nuevo que lo reemplace (skill registrar-decision) y solo cambia aquí la línea de estado a 'reemplazado por ADR-XXX' pidiéndoselo al usuario." >&2
      exit 2
    fi ;;
esac

# Ningún subagente revisor escribe: lo controlan sus tools; aquí solo fuentes de verdad.
exit 0
