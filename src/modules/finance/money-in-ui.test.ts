import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * CA8 · Guardia de dinero en la UI de la ficha (plan 006, R4): el lint de dinero ignora modules/finance/**.
 * Ningún archivo de finance/ui/{hooks,components/investor} hace aritmética con `.cents`
 * ni importa VALORES de "@/shared/domain/money" (solo `import type`).
 *
 * Sobre el árbol previo a P4 falla. El paquete UI la activa como último paso: GUARD_ACTIVE = true.
 */
const GUARD_ACTIVE = true;

const ROOT = join(process.cwd(), "src/modules/finance/ui");
const SCANNED = ["hooks", "components/investor"].map((d) => join(ROOT, d));

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return /\.(ts|tsx)$/.test(name) && !/\.test\./.test(name) ? [path] : [];
  });
}

const CENTS = /\.cents\b/;
const VALUE_IMPORT_FROM_MONEY = /import\s+\{[^}]*\}\s+from\s+["']@\/shared\/domain\/money["']/;

function violations(): string[] {
  return SCANNED.flatMap(sourceFiles).flatMap((file) => {
    const text = readFileSync(file, "utf8");
    const found: string[] = [];
    if (CENTS.test(text)) found.push(`${relative(ROOT, file)}: usa .cents`);
    if (VALUE_IMPORT_FROM_MONEY.test(text))
      found.push(`${relative(ROOT, file)}: importa valores de money`);
    return found;
  });
}

describe("finance/ui no calcula dinero (CA8)", () => {
  it("los patrones detectan lo que deben y dejan pasar import type", () => {
    expect(VALUE_IMPORT_FROM_MONEY.test('import { sumMoney } from "@/shared/domain/money";')).toBe(
      true,
    );
    expect(
      VALUE_IMPORT_FROM_MONEY.test('import { type Money, usd } from "@/shared/domain/money";'),
    ).toBe(true);
    expect(
      VALUE_IMPORT_FROM_MONEY.test('import type { Money } from "@/shared/domain/money";'),
    ).toBe(false);
    expect(CENTS.test("a.cents + b.cents")).toBe(true);
    expect(CENTS.test("centsLabel")).toBe(false);
  });

  it.skipIf(!GUARD_ACTIVE)("hooks y componentes de investor sin .cents ni valores de money", () => {
    expect(violations()).toEqual([]);
  });
});
