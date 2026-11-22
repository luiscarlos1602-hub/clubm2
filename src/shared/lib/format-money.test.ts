import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { formatMoney, type MoneyLike } from "./format-money";

const usd = (cents: number): MoneyLike => ({ cents, currency: "USD" });
const nb = (s: string) => s.replace(" ", " ");

describe("formatMoney", () => {
  it.each([
    [0, "USD 0"],
    [5, "USD 0,05"],
    [100, "USD 1"],
    [1_000_000, "USD 10.000"],
    [1_000_050, "USD 10.000,50"],
    [12_345_678_900, "USD 123.456.789"],
    [-250_000, "-USD 2.500"],
  ])("%i centavos → %s", (cents, expected) => {
    expect(formatMoney(usd(cents))).toBe(nb(expected));
  });

  it('decimals:"always" muestra siempre 2 decimales', () => {
    expect(formatMoney(usd(100), { decimals: "always" })).toBe(nb("USD 1,00"));
  });

  it("separa USD y la cifra con U+00A0", () => {
    expect(formatMoney(usd(100)).charCodeAt(3)).toBe(0x00a0);
  });

  it("lanza RangeError si cents no es entero seguro", () => {
    expect(() => formatMoney(usd(1.5))).toThrow(RangeError);
    expect(() => formatMoney(usd(Number.MAX_SAFE_INTEGER + 2))).toThrow(RangeError);
  });

  it("propiedad: los dígitos son los centavos con relleno a 3", () => {
    fc.assert(
      fc.property(fc.integer({ min: Number.MIN_SAFE_INTEGER, max: Number.MAX_SAFE_INTEGER }), (cents) => {
        const out = formatMoney(usd(cents), { decimals: "always" });
        expect(out.replace(/\D/g, "")).toBe(String(Math.abs(cents)).padStart(3, "0"));
      }),
    );
  });
});
