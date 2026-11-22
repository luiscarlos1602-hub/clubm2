import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { brand } from "./brand";

const css = readFileSync("src/app/globals.css", "utf8");

describe("tokens de marca en globals.css", () => {
  it.each(brand.palette)("declara --color-$token con su HEX", ({ token, hex }) => {
    const re = new RegExp(`--color-${token}:\\s*(#[0-9a-fA-F]{6})\\s*;`);
    const match = css.match(re);
    expect(match, `falta --color-${token}`).not.toBeNull();
    expect(match![1].toLowerCase()).toBe(hex.toLowerCase());
  });

  it("--destructive apunta a Arcilla (sin rojo)", () => {
    expect(css).toMatch(/--destructive:\s*var\(--color-arcilla\)\s*;/);
  });
});
