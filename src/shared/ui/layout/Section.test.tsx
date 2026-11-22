import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PageHeader } from "./PageHeader";
import { Section } from "./Section";
import { Surface } from "./Surface";
import type { SurfaceTone } from "./layout-tokens";

const css = readFileSync("src/app/globals.css", "utf8");
const TONES: SurfaceTone[] = ["light", "paper", "sand", "dark"];

describe("tonos de superficie (ADR-010)", () => {
  it.each(TONES)('globals.css declara [data-tone="%s"]', (tone) => {
    expect(css).toContain(`[data-tone="${tone}"]`);
  });

  it("dark redefine texto, acción, foco, filete y atención", () => {
    const dark = css.slice(css.indexOf('[data-tone="dark"] {'));
    for (const v of ["--foreground", "--primary", "--primary-foreground", "--muted-foreground", "--ring", "--line", "--destructive"]) {
      expect(dark).toMatch(new RegExp(`${v}:`));
    }
  });

  it("light redefine el juego semántico completo y paper/sand lo heredan", () => {
    const base = css.slice(0, css.indexOf("--sidebar-ring: var(--ring);"));
    const group = base.slice(base.lastIndexOf(":root,"));
    for (const t of ["light", "paper", "sand"]) expect(group).toContain(`[data-tone="${t}"]`);
    for (const v of ["--foreground", "--primary", "--muted-foreground", "--border", "--ring", "--line", "--destructive", "--highlight", "--highlight-foreground"]) {
      expect(group).toMatch(new RegExp(`${v}:`));
    }
  });

  it("dark: el anillo de foco es Crema (contraste >= 3:1)", () => {
    const dark = css.slice(css.indexOf('[data-tone="dark"] {'));
    expect(dark).toMatch(/--ring:\s*var\(--color-crema\)/);
  });

  it("Section marca el tono y se etiqueta por su título", () => {
    const html = renderToStaticMarkup(
      <Section tone="dark" labelledBy="t">
        <h2 id="t">Título</h2>
      </Section>,
    );
    expect(html).toContain('data-tone="dark"');
    expect(html).toContain('aria-labelledby="t"');
  });

  it("Surface dark anida un bloque oscuro; card no fija tono", () => {
    expect(renderToStaticMarkup(<Surface variant="dark">x</Surface>)).toContain('data-tone="dark"');
    expect(renderToStaticMarkup(<Surface>x</Surface>)).not.toContain("data-tone");
  });

  it("PageHeader pone un único h1 con su id", () => {
    const html = renderToStaticMarkup(<PageHeader id="titulo-x" title="Hola" description="d" />);
    expect(html.match(/<h1/g)).toHaveLength(1);
    expect(html).toContain('id="titulo-x"');
    expect(html).toContain('data-tone="dark"');
  });
});
