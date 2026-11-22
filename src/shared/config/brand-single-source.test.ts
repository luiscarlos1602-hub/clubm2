import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path, out);
    else if (/\.(ts|tsx|css|md)$/.test(name)) out.push(path);
  }
  return out;
}

describe("brand.ts es la única fuente del nombre comercial", () => {
  it('"Club M²" / "Club M2" no aparece fuera de brand.ts (ADR-003)', () => {
    const offenders = walk("src")
      .filter((f) => !/\.test\.tsx?$/.test(f) && !f.endsWith("shared/config/brand.ts"))
      .filter((f) => /Club M[²2]/.test(readFileSync(f, "utf8")));
    expect(offenders).toEqual([]);
  });
});
