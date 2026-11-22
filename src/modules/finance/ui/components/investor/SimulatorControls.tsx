"use client";

import { formatMoney } from "@/shared/lib/format-money";
import { Button } from "@/shared/ui/primitives/button";
import { DELAY_RANGE, OVERRUN_RANGE, SALE_RANGE, STRESS_PRESETS, type SimulatorResult } from "../../hooks/simulate";
import type { UseSimulator } from "../../hooks/use-simulator";
import { PROJECT_DETAIL_COPY } from "./copy";
import { RangeField } from "./RangeField";

const C = PROJECT_DETAIL_COPY.simulator;

export type SimulatorControlsProps = {
  simulator: UseSimulator;
  salePrice: SimulatorResult["salePrice"];
  total: number;
  maxHeld: number;
};

/** Variables de D3: precio de venta, participaciones, colocación, sobrecosto y retraso, más presets de estrés. */
export function SimulatorControls({ simulator, salePrice, total, maxHeld }: SimulatorControlsProps) {
  const { controls, setControl, applyPreset, activePreset } = simulator;
  return (
    <div className="flex flex-col gap-6" data-testid="simulador-controles">
      <RangeField
        label={C.controls.sale}
        value={controls.salePct}
        min={SALE_RANGE.min}
        max={SALE_RANGE.max}
        step={SALE_RANGE.step}
        valueText={`${formatMoney(salePrice)} · ${C.controls.saleVariation(controls.salePct)}`}
        onChange={(v) => setControl("salePct", v)}
        testId="simulador-precio-venta"
      />
      <RangeField
        label={C.controls.held}
        value={controls.held}
        min={1}
        max={maxHeld}
        valueText={C.controls.heldValue(controls.held)}
        onChange={(v) => setControl("held", v)}
        testId="simulador-participaciones"
      />
      <RangeField
        label={C.controls.placed}
        value={controls.placed}
        min={0}
        max={total}
        valueText={C.controls.placedValue(controls.placed, total)}
        onChange={(v) => setControl("placed", v)}
        testId="simulador-colocacion"
      />
      <RangeField
        label={C.controls.overrun}
        value={controls.overrunPct}
        min={OVERRUN_RANGE.min}
        max={OVERRUN_RANGE.max}
        step={OVERRUN_RANGE.step}
        valueText={C.controls.overrunValue(controls.overrunPct)}
        onChange={(v) => setControl("overrunPct", v)}
        testId="simulador-sobrecosto"
      />
      <RangeField
        label={C.controls.delay}
        value={controls.delayMonths}
        min={DELAY_RANGE.min}
        max={DELAY_RANGE.max}
        step={DELAY_RANGE.step}
        valueText={C.controls.delayValue(controls.delayMonths)}
        onChange={(v) => setControl("delayMonths", v)}
        testId="simulador-retraso"
      />
      <div role="group" aria-labelledby="simulador-presets-titulo" className="flex flex-col gap-3">
        <p id="simulador-presets-titulo" className="text-sm font-medium">
          {C.presetsLabel}
        </p>
        <div className="flex flex-wrap gap-2">
          {STRESS_PRESETS.map((preset) => (
            <Button
              key={preset.id}
              type="button"
              size="sm"
              variant={activePreset === preset.id ? "default" : "outline"}
              aria-pressed={activePreset === preset.id}
              data-testid={`simulador-preset-${preset.id}`}
              onClick={() => applyPreset(preset.id)}
            >
              {C.presets[preset.id]}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
