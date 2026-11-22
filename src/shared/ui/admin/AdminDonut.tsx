"use client";

import type { ReactNode } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { cn } from "@/shared/lib/utils";
import type { TestIdProp } from "@/shared/ui/brand/types";
import { chartColor, type ChartColor } from "./chart-tokens";

export type DonutSlice = { readonly label: string; readonly value: number; readonly color: ChartColor };

export type AdminDonutProps = TestIdProp & {
  ariaLabel: string;
  slices: readonly DonutSlice[];
  /** Contenido del centro (p. ej. "63 de 100"); lo entrega quien lo usa, ya formateado. */
  center?: ReactNode;
  /** Formato del valor en la leyenda (por defecto el número tal cual). */
  format?: (value: number) => string;
  size?: number;
};

/** Anillo con leyenda en HTML (la leyenda hace de tabla de apoyo accesible). */
export function AdminDonut({
  ariaLabel,
  slices,
  center,
  format = (v) => String(v),
  size = 180,
  className,
  "data-testid": testId = "admin-grafica-anillo",
}: AdminDonutProps) {
  return (
    <figure data-testid={testId} className={cn("flex min-w-0 flex-col items-center gap-4 sm:flex-row", className)}>
      <div role="img" aria-label={ariaLabel} style={{ width: size, height: size }} className="relative shrink-0">
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <PieChart>
            <Pie
              data={slices as DonutSlice[]}
              dataKey="value"
              nameKey="label"
              innerRadius="64%"
              outerRadius="100%"
              startAngle={90}
              endAngle={-270}
              stroke="var(--card)"
              strokeWidth={2}
              isAnimationActive={false}
            >
              {slices.map((s) => <Cell key={s.label} fill={chartColor(s.color)} />)}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        {center ? <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">{center}</div> : null}
      </div>
      <figcaption className="min-w-0 flex-1">
        <ul className="flex flex-col gap-2 text-sm">
          {slices.map((s) => (
            <li key={s.label} className="flex items-center gap-2">
              <span aria-hidden className="size-3 shrink-0 rounded-full" style={{ background: chartColor(s.color) }} />
              <span className="flex-1">{s.label}</span>
              <span className="tabular-nums font-medium">{format(s.value)}</span>
            </li>
          ))}
        </ul>
      </figcaption>
    </figure>
  );
}
