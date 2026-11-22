/** Forma mínima estructural. El `Money` de shared/domain (F1-3) es asignable a este tipo. */
export type MoneyLike = { readonly cents: number; readonly currency: "USD" };

export type MoneyDecimals = "auto" | "always";

const NBSP = " ";

/**
 * "USD 10.000" · "USD 10.000,50" · "-USD 2.500". Usa NBSP (U+00A0) entre "USD" y la cifra.
 * Trabaja con el string de los centavos (sin aritmética sobre .cents, sin Intl/ICU).
 * "auto": omite ",00"; "always": siempre 2 decimales.
 * Lanza RangeError si cents no es un entero seguro (error de programación, no de negocio).
 */
export function formatMoney(value: MoneyLike, options?: { decimals?: MoneyDecimals }): string {
  const { cents } = value;
  if (!Number.isSafeInteger(cents)) {
    throw new RangeError(`formatMoney: cents debe ser un entero seguro, recibió ${String(cents)}`);
  }
  const decimals = options?.decimals ?? "auto";
  const digits = String(cents).replace("-", "").padStart(3, "0");
  const whole = digits.slice(0, -2).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const fraction = digits.slice(-2);
  const sign = cents < 0 ? "-" : "";
  const showFraction = decimals === "always" || fraction !== "00";
  return `${sign}USD${NBSP}${whole}${showFraction ? `,${fraction}` : ""}`;
}
