import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import boundaries from "eslint-plugin-boundaries";
import { moduleOrder } from "./architecture.modules.mjs";

// ── Capas (docs/01-arquitectura.md §4) ─────────────────────────────────────
const elements = [
  { type: "module-api", pattern: "src/modules/*/{index,backoffice,ui,backoffice-ui}.ts", mode: "file" },
  { type: "domain", pattern: "src/modules/*/domain/**" },
  { type: "application", pattern: "src/modules/*/application/**" },
  { type: "infrastructure", pattern: "src/modules/*/infrastructure/**" },
  { type: "ui", pattern: "src/modules/*/ui/**" },
  { type: "shared-domain", pattern: "src/shared/domain/**" },
  { type: "shared-ui", pattern: "src/shared/ui/**" },
  { type: "shared-lib", pattern: "src/shared/{lib,config}/**" },
  { type: "shared-infra", pattern: "src/shared/infrastructure/**" },
  { type: "composition", pattern: "src/composition/**" },
  { type: "app", pattern: "src/app/**" },
];

const MSG = "Import prohibido entre capas ({{ from.element.types.[0] }} → {{ to.element.types.[0] }}) — ver docs/01-arquitectura.md §4";
const allow = (from, ...to) => ({ from: { element: { type: from } }, allow: { to: { element: { types: to } } } });

const layerPolicies = [
  allow("module-api", "domain", "application", "ui", "shared-domain", "shared-lib", "module-api"),
  allow("domain", "domain", "shared-domain", "module-api"),
  allow("application", "domain", "application", "shared-domain", "shared-lib", "module-api"),
  allow("infrastructure", "domain", "application", "infrastructure", "shared-domain", "shared-infra", "shared-lib", "module-api"),
  allow("ui", "domain", "application", "ui", "shared-domain", "shared-ui", "shared-lib", "composition", "module-api"),
  allow("shared-domain", "shared-domain"),
  allow("shared-lib", "shared-lib", "shared-domain"),
  allow("shared-infra", "shared-infra", "shared-domain", "shared-lib"),
  allow("shared-ui", "shared-ui", "shared-domain", "shared-lib"),
  allow("composition", "domain", "application", "infrastructure", "composition", "shared-domain", "shared-ui", "shared-infra", "shared-lib", "module-api"),
  allow("app", "ui", "shared-ui", "shared-lib", "composition", "module-api"),
];

// ── Entre módulos solo por index.ts y sin ciclos (docs/01 §4 reglas 2 y 3) ──
const purityPattern = { group: ["react", "react-dom", "next", "next/*"], message: "domain es puro: sin React ni Next — docs/01-arquitectura.md §4 regla 1" };
const moduleRules = moduleOrder.flatMap((name, i) => {
  const patterns = [
        { group: ["@/modules/*/*", "!@/modules/*/backoffice", "!@/modules/*/backoffice-ui", "!@/modules/*/ui"], message: "Prohibido importar rutas internas de otro módulo: usa solo '@/modules/<m>' o '@/modules/<m>/ui' — ver docs/01-arquitectura.md §4 regla 2" },
        ...(moduleOrder.slice(i).length
          ? [{ group: moduleOrder.slice(i).map((m) => `@/modules/${m}`), message: `Sin ciclos entre módulos: '${name}' solo importa de ${moduleOrder.slice(0, i).join(" · ") || "shared"} — ver docs/01-arquitectura.md §4 regla 3` }]
          : []),
  ];
  const backofficePattern = { group: ["@/modules/*/backoffice", "@/modules/*/backoffice-ui"], message: "Las ruedas son internas — docs/01-arquitectura.md §8.3 (ADR-004)" };
  const cfg = (files, pats) => ({ files, rules: { "no-restricted-imports": ["error", { patterns: pats }] } });
  return [
    cfg([`src/modules/${name}/**/*.{ts,tsx}`], [...patterns, backofficePattern]),
    cfg([`src/modules/${name}/domain/**/*.ts`], [...patterns, backofficePattern, purityPattern]),
    // backoffice.ts solo para ui/components/admin (docs/01 §8.3)
    cfg([`src/modules/${name}/ui/components/admin/**/*.{ts,tsx}`], patterns),
  ];
});

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts", "scaffold-tmp/**", "scripts/**", "docs/**", "marketing/**"]),
  {
    plugins: { boundaries },
    settings: { "boundaries/elements": elements },
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "boundaries/dependencies": ["error", { default: "disallow", policies: [{ disallow: { to: { element: { types: elements.map((e) => e.type) } } }, message: MSG }, ...layerPolicies] }],
    },
  },
  ...moduleRules,
  // domain es puro (docs/01 §4 regla 1)
  {
    files: ["src/modules/*/domain/**/*.ts", "src/shared/domain/**/*.ts"],
    ignores: ["**/*.test.ts"],
    rules: {
      "no-restricted-globals": ["error",
        ...["Date", "fetch", "localStorage", "sessionStorage", "window", "document"].map((name) => ({ name, message: "domain es puro: inyecta Clock/IdGenerator — docs/01-arquitectura.md §4 regla 1" })),
      ],
      "no-restricted-properties": ["error",
        { object: "Math", property: "random", message: "domain es puro: inyecta IdGenerator — docs/01-arquitectura.md §4 regla 1" },
        { object: "Date", property: "now", message: "domain es puro: inyecta Clock — docs/01-arquitectura.md §4 regla 1" },
      ],
    },
  },
  // Dinero solo en el motor (docs/01 §4 regla 5)
  {
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["src/shared/domain/**", "src/modules/finance/**", "src/modules/projects/**", "**/*.test.ts"],
    rules: {
      "no-restricted-syntax": ["error",
        { selector: "BinaryExpression[operator=/^[-+*\\/%]$/] > MemberExpression[property.name='cents']", message: "Ninguna pantalla calcula dinero — usa modules/finance (docs/01-arquitectura.md §4 regla 5)" },
      ],
    },
  },
  // Ruedas internas (ADR-004, docs/01 §8.3): backoffice.ts solo para app/admin, ui/components/admin y composition
  {
    files: ["src/app/**/*.{ts,tsx}", "src/shared/**/*.{ts,tsx}"],
    ignores: ["src/app/admin/**", "**/*.test.ts"],
    rules: {
      "no-restricted-imports": ["error", { patterns: [{ group: ["@/modules/*/backoffice", "@/modules/*/backoffice-ui"], message: "Las ruedas son internas — docs/01-arquitectura.md §8.3 (ADR-004)" }] }],
    },
  },
  // composition no importa pantallas (ADR-012): evita el ciclo ui → useContainer → composition
  {
    files: ["src/composition/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": ["error", { patterns: [{ group: ["@/modules/*/ui", "@/modules/*/backoffice-ui", "@/modules/*/ui/**"], message: "composition no importa pantallas de los módulos — docs/01-arquitectura.md §8.3 (ADR-012)" }] }],
    },
  },
  // Higiene general (docs/01 §8.1)
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "no-console": ["error", { allow: ["warn", "error"] }],
    },
  },
  {
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["src/app/**/{page,layout,not-found,error,loading}.tsx", "src/app/**/{page,layout}.ts"],
    rules: { "import/no-default-export": "error" },
  },
]);
