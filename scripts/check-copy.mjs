#!/usr/bin/env node
// check-copy · Guardarraíl determinista de "copy sin promesas" (docs/06-guia-de-contenido.md).
// Uso: node scripts/check-copy.mjs [rutas...]   (sin rutas: src/ y marketing/)
// Sale con código 1 si hay ERRORES; los AVISOS no bloquean.
// Excepción puntual: añade en la línea `copy-ok: <motivo>` (comentario JS o <!-- copy-ok: ... --> en md).
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, extname } from 'node:path';

const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

// Cada regla: id, nivel, patrón (sobre texto sin tildes), sugerencia, y si se permite precedido de negación.
const RULES = [
  { id: 'R1-garantia', level: 'error', re: /\bgarantiz\w*/g, negatable: true, fix: 'Usa "proyección · no garantizada" o "escenario".' },
  { id: 'R1-asegurado', level: 'error', re: /\basegurad[oa]s?\b/g, negatable: true, fix: 'No se asegura ningún resultado: "proyección" / "resultado realizado".' },
  { id: 'R1-fijo', level: 'error', re: /\b(rentabilidad|retorno|ganancia|renta|pago)s?\s+fij[oa]s?\b/g, fix: 'No hay rendimiento fijo: "escenario base".' },
  { id: 'R1-sin-riesgo', level: 'error', re: /\bsin\s+riesgos?\b/g, fix: '"Toda inversión puede sufrir pérdidas."' },
  { id: 'R1-segura', level: 'error', re: /\b(inversion|apuesta|ganancia|retorno|negocio)\s+segur[oa]\b/g, negatable: true, fix: '"Toda inversión puede sufrir pérdidas."' },
  { id: 'R1-ganas-pct', level: 'error', re: /\bgan(as|a|aras|amos)\s+(un\s+)?\d+([.,]\d+)?\s*%/g, fix: '"En el escenario base, la proyección por participación es…"' },
  { id: 'R1-duplica', level: 'error', re: /\b(duplica|triplica|multiplica)\w*\s+tu\s+dinero\b/g, fix: 'Elimina la promesa.' },
  { id: 'R1-plazo-cierto', level: 'error', re: /\bte\s+pagamos\s+en\b/g, fix: '"Plazo objetivo: 3 meses (rueda buena)".' },
  { id: 'R3-accionista', level: 'error', re: /\baccionistas?\b/g, negatable: true, fix: '"participante" / "participación económica".' },
  { id: 'R3-dueno', level: 'error', re: /\bduen[oa]s?\b/g, negatable: true, fix: 'La empresa es la titular legal: "participación económica".' },
  { id: 'R3-acciones', level: 'aviso', re: /\bacci(on|ones)\s+(de|del|en)\s+(el\s+|la\s+)?(proyecto|inmueble|club|empresa)\b/g, fix: 'Si significa "títulos": "participaciones económicas".' },
  { id: 'R8-urgencia', level: 'error', re: /\b(ultimos?\s+cupos|solo\s+hoy|por\s+tiempo\s+limitado|quedan\s+pocos|no\s+te\s+lo\s+pierdas)\b/g, fix: 'Sin escasez falsa: "Participaciones disponibles: 37 de 100".' },
  { id: 'R9-rueda', level: 'error', re: /\bruedas?\b/g, audience: 'investor', fix: 'Las ruedas son internas (ADR-004): usa etapa, cronograma o "plazo objetivo · proyección".' },
  { id: 'R8-exclusivo', level: 'aviso', re: /\b(acceso\s+(exclusivo|restringido)|club\s+privado)\b/g, fix: 'El registro es gratuito y abierto.' },
];

// Audiencia "investor": todo lo que ve el inversionista o el público (no el backoffice).
const isInvestorFacing = (f) => {
  const p = f.replace(/\\/g, '/');
  if (/\/admin\/|\.admin\.|\/backoffice/.test(p)) return false;
  if (/(^|\/)marketing\//.test(p)) return true;
  if (/(^|\/)src\/app\//.test(p)) return true;
  return /\.tsx$/.test(p) || /copy\.ts$/.test(p) || /legal-copy\.ts$/.test(p);
};
const NEGATION = /\b(no|nunca|sin|ni)\s+(\w+\s+){0,2}$/;
const MD_SKIP = /❌|prohibid|evitar/i;
// Secciones de markdown que LISTAN lo prohibido (guías, guardarraíles): se saltan completas.
const MD_SKIP_SECTION = /prohibid|evitar|guardarra[ií]l|vocabulario|cumplimiento/i;

function walk(p, out = []) {
  if (!existsSync(p)) return out;
  const st = statSync(p);
  if (st.isDirectory()) {
    for (const f of readdirSync(p)) if (!['node_modules', '.next', '.git'].includes(f)) walk(join(p, f), out);
  } else if (['.ts', '.tsx', '.md', '.mdx'].includes(extname(p)) && !/\.test\.tsx?$/.test(p)) out.push(p);
  return out;
}

const targets = process.argv.slice(2).length ? process.argv.slice(2) : ['src', 'marketing'];
const files = targets.flatMap((t) => walk(t));
let errors = 0, warnings = 0;

for (const file of files) {
  const isMd = /\.mdx?$/.test(file);
  let inFence = false, skipSection = false;
  readFileSync(file, 'utf8').split('\n').forEach((line, i) => {
    if (isMd && /^\s*```/.test(line)) { inFence = !inFence; return; }
    if (isMd && /^#{1,6}\s/.test(line)) { skipSection = MD_SKIP_SECTION.test(line); return; }
    if (skipSection) return;
    if (inFence || /copy-ok/.test(line) || (isMd && MD_SKIP.test(line))) return;
    const text = norm(line);
    for (const r of RULES) {
      if (r.audience === 'investor' && !isInvestorFacing(file)) continue;
      for (const m of text.matchAll(r.re)) {
        if (r.negatable && NEGATION.test(text.slice(Math.max(0, m.index - 25), m.index))) continue;
        const tag = r.level === 'error' ? '🔴 ERROR' : '🟡 AVISO';
        r.level === 'error' ? errors++ : warnings++;
        console.log(`${tag} ${file}:${i + 1} [${r.id}] "${line.trim().slice(0, 110)}"\n   → ${r.fix}`);
      }
    }
  });
}

console.log(`\ncheck-copy: ${files.length} archivos · ${errors} errores · ${warnings} avisos (guía: docs/06-guia-de-contenido.md)`);
process.exit(errors ? 1 : 0);
