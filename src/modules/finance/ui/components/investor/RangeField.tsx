"use client";

import { useId } from "react";
import { Label } from "@/shared/ui/primitives/label";

export type RangeFieldProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  /** Texto legible del valor actual ("+10 % sobre el objetivo"). */
  valueText: string;
  onChange: (value: number) => void;
  testId: string;
};

/** Control deslizante nativo con etiqueta, valor visible y valor anunciado (aria-valuetext). */
export function RangeField({ label, value, min, max, step = 1, valueText, onChange, testId }: RangeFieldProps) {
  const id = useId();
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-3">
        <Label htmlFor={id}>{label}</Label>
        <output htmlFor={id} data-testid={`${testId}-valor`} className="text-sm font-medium tabular-nums">
          {valueText}
        </output>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={min === max}
        aria-valuetext={valueText}
        data-testid={testId}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-6 w-full cursor-pointer accent-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50"
      />
    </div>
  );
}
