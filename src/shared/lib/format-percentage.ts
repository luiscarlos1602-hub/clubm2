import type { Percentage } from "@/shared/domain/percentage";

/** Puntos básicos → "25 %" / "22,5 %" (es-VE, sin ceros sobrantes). Determinista, sin Intl. */
export function formatPercentage(p: Percentage): string {
  const sign = p.bps < 0 ? "-" : "";
  const abs = Math.abs(p.bps);
  const whole = Math.trunc(abs / 100);
  const rest = abs % 100;
  const decimals = rest === 0 ? "" : `,${String(rest).padStart(2, "0").replace(/0$/, "")}`;
  return `${sign}${whole}${decimals} %`;
}

/** Puntos básicos → ancho CSS ("25%", "22.5%"). Precondición: 0..10000 pb (una parte de un todo). */
export function percentageToCss(p: Percentage): string {
  if (p.bps < 0 || p.bps > 10_000) throw new RangeError(`percentageToCss: ${p.bps} pb fuera de 0..10000`);
  return `${p.bps / 100}%`;
}
