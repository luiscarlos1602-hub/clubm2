"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { cn } from "@/shared/lib/utils";
import type { TestIdProp } from "@/shared/ui/brand/types";
import { chartColor, type ChartColor } from "./chart-tokens";

export type BarSeries = { readonly key: string; readonly label: string; readonly color: ChartColor };
export type BarDatum = { readonly label: string } & Readonly<Record<string, string | number>>;

export type AdminBarChartProps = TestIdProp & {
  /** Descripción corta de la gráfica para lectores de pantalla. */
  ariaLabel: string;
  data: readonly BarDatum[];
  series: readonly BarSeries[];
  /** `categories-y`: barras horizontales con las categorías a la izquierda (mejor en móvil). */
  layout?: "categories-x" | "categories-y";
  stacked?: boolean;
  /** Formato del valor en el tooltip y en la tabla de apoyo (p. ej. `formatMoney`). */
  format?: (value: number) => string;
  height?: number;
  /** Etiqueta de la categoría en el eje (ancho en px, solo `categories-y`). */
  categoryWidth?: number;
};

/** Gráfica de barras con tokens de marca y tabla de apoyo accesible. No calcula: pinta lo que recibe. */
export function AdminBarChart({
  ariaLabel,
  data,
  series,
  layout = "categories-x",
  stacked = false,
  format = (v) => String(v),
  height = 260,
  categoryWidth = 96,
  className,
  "data-testid": testId = "admin-grafica-barras",
}: AdminBarChartProps) {
  const horizontal = layout === "categories-y";
  return (
    <figure data-testid={testId} className={cn("flex min-w-0 flex-col gap-3", className)}>
      <div role="img" aria-label={ariaLabel} style={{ height }} className="w-full min-w-0 text-xs">
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <BarChart data={data as BarDatum[]} layout={horizontal ? "vertical" : "horizontal"} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
            <CartesianGrid stroke="var(--line)" strokeDasharray="3 3" vertical={horizontal} horizontal={!horizontal} />
            {horizontal ? (
              <>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="label" width={categoryWidth} tickLine={false} axisLine={false} tick={{ fill: "var(--foreground)" }} />
              </>
            ) : (
              <>
                <XAxis dataKey="label" tickLine={false} axisLine={{ stroke: "var(--line)" }} tick={{ fill: "var(--foreground)" }} interval={0} />
                <YAxis hide />
              </>
            )}
            <Tooltip
              cursor={{ fill: "var(--muted)", opacity: 0.5 }}
              formatter={(value) => format(Number(value))}
              contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, color: "var(--foreground)" }}
            />
            {series.length > 1 ? <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} /> : null}
            {series.map((s) => (
              <Bar
                key={s.key}
                dataKey={s.key}
                name={s.label}
                fill={chartColor(s.color)}
                stackId={stacked ? "total" : undefined}
                radius={stacked ? 0 : 4}
                maxBarSize={36}
                isAnimationActive={false}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="sr-only">
      <table data-testid={`${testId}-tabla`}>
        <caption>{ariaLabel}</caption>
        <thead>
          <tr>
            <th scope="col" />
            {series.map((s) => <th key={s.key} scope="col">{s.label}</th>)}
          </tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.label}>
              <th scope="row">{d.label}</th>
              {series.map((s) => <td key={s.key}>{format(Number(d[s.key]))}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </figure>
  );
}
