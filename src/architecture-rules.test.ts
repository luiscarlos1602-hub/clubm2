// Prueba de regresión del lint de capas (docs/01 §4 y §8): cada caso debe fallar (o pasar) como indica la regla.
import { ESLint } from "eslint";
import { describe, expect, it } from "vitest";

const eslint = new ESLint({ cwd: process.cwd() });

async function errorsFor(filePath: string, code: string): Promise<string[]> {
  const [result] = await eslint.lintText(code, { filePath });
  return (result?.messages ?? []).filter((m) => m.severity === 2).map((m) => m.message);
}

const BACKOFFICE = "import { a } from '@/modules/projects/backoffice'; export { a };";

describe("reglas de arquitectura (lint)", () => {
  it("regla 2 · un módulo no importa rutas internas de otro", async () => {
    const msgs = await errorsFor("src/modules/club/ui/probe.ts", "import { a } from '@/modules/finance/domain/distribution'; export { a };");
    expect(msgs.join()).toContain("rutas internas de otro módulo");
  });
  it("regla 3 · sin ciclos entre módulos", async () => {
    const msgs = await errorsFor("src/modules/projects/domain/probe.ts", "import { a } from '@/modules/club'; export { a };");
    expect(msgs.join()).toContain("Sin ciclos entre módulos");
  });
  it("regla 1 · domain no importa React", async () => {
    const msgs = await errorsFor("src/modules/finance/domain/probe.ts", "import { useState } from 'react'; export { useState };");
    expect(msgs.join()).toContain("domain es puro");
  });
  it("ADR-004 · backoffice.ts prohibido en módulos (fuera de ui/components/admin), shared y app pública", async () => {
    for (const file of ["src/modules/club/ui/probe.ts", "src/shared/ui/probe.ts", "src/app/(publico)/probe.ts"]) {
      expect((await errorsFor(file, BACKOFFICE)).join(), file).toContain("Las ruedas son internas");
    }
  });
  it("ADR-004 · backoffice.ts permitido en app/admin y ui/components/admin", async () => {
    for (const file of ["src/app/admin/probe.ts", "src/modules/club/ui/components/admin/probe.ts"]) {
      expect((await errorsFor(file, BACKOFFICE)).join(), file).not.toContain("Las ruedas son internas");
    }
  });
  it("capas · shared/ui no importa módulos", async () => {
    const msgs = await errorsFor("src/shared/ui/probe.ts", "import { a } from '@/modules/finance'; export { a };");
    expect(msgs.join()).toContain("Import prohibido entre capas");
  });
}, 60_000);
