#!/usr/bin/env bash
# PostToolUse (Edit|Write|MultiEdit). Feedback inmediato y determinista.
# Exit 2 = el agente ve stderr y debe corregir antes de seguir.
input="$(cat)"
file="$(printf '%s' "$input" | sed -n 's/.*"file_path"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' | head -1)"
[ -z "$file" ] && exit 0
cd "$CLAUDE_PROJECT_DIR" || exit 0
rel="${file#"$CLAUDE_PROJECT_DIR"/}"
status=0

# 1) Copy sin promesas: funciona desde F0 (solo necesita node).
case "$rel" in
  src/*.tsx|src/*.ts|marketing/*.md)
    if command -v node >/dev/null 2>&1 && [ -f scripts/check-copy.mjs ]; then
      if ! out="$(node scripts/check-copy.mjs "$rel" 2>&1)"; then
        echo "$out" >&2
        status=2
      fi
    fi ;;
esac

# 2) Desde F1 (cuando exista package.json y node_modules).
if [ -f package.json ] && [ -d node_modules ]; then
  case "$rel" in
    *.ts|*.tsx|*.mjs|*.css|*.json|*.md)
      pnpm exec prettier --write "$rel" >/dev/null 2>&1 ;;
  esac
  case "$rel" in
    src/*.ts|src/*.tsx)
      if ! out="$(pnpm exec eslint --fix "$rel" 2>&1)"; then
        { echo "ESLint en ROJO ($rel). Corrige antes de seguir:"; echo "$out" | tail -40; } >&2
        status=2
      fi ;;
  esac
  # Los tests (vitest) ya no corren aquí (ADR-016): se ejecutan al cerrar cada paquete
  # con `pnpm vitest run <módulo>` y `pnpm verify` una vez por funcionalidad.
fi
exit $status
