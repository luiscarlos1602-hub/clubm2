/** Colores de gráficas: solo tokens de marca (`--chart-1…5` de globals.css). */
export type ChartColor = 1 | 2 | 3 | 4 | 5;

export function chartColor(n: ChartColor): string {
  return `var(--chart-${n})`;
}
