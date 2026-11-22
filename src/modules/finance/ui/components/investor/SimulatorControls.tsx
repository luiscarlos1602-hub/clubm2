"use client";

import { formatMoney } from "@/shared/lib/format-money";
import { Button } from "@/shared/ui/primitives/button";
import { SIMULATION_RANGES, type SimulationResult } from "../../../domain/simulator";
import { STRESS_PRESET_IDS } from "../../../domain/stress-presets";
import type { UseSimulator } from "../../hooks/use-simulator";
import { PROJECT_DETAIL_COPY } from "./copy";
import { RangeField } from "./RangeField";

const C = PROJECT_DETAIL_COPY.simulator;

export type SimulatorControlsProps = {
  simulator: UseSimulator;
  salePrice: SimulationResult["salePrice"];
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
        value={controls.saleAdjustmentBps}
        min={SIMULATION_RANGES.saleAdjustmentBps.min}
        max={SIMULATION_RANGES.saleAdjustmentBps.max}
        step={SIMULATION_RANGES.saleAdjustmentBps.step}
        valueText={`${formatMoney(salePrice)} · ${C.controls.saleVariation(controls.saleAdjustmentBps)}`}
        onChange={(v) => setControl("saleAdjustmentBps", v)}
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
        value={controls.worksOverrunBps}
        min={SIMULATION_RANGES.worksOverrunBps.min}
        max={SIMULATION_RANGES.worksOverrunBps.max}
        step={SIMULATION_RANGES.worksOverrunBps.step}
        valueText={C.controls.overrunValue(controls.worksOverrunBps)}
        onChange={(v) => setControl("worksOverrunBps", v)}
        testId="simulador-sobrecosto"
      />
      <RangeField
        label={C.controls.delay}
        value={controls.delayMonths}
        min={SIMULATION_RANGES.delayMonths.min}
        max={SIMULATION_RANGES.delayMonths.max}
        step={SIMULATION_RANGES.delayMonths.step}
        valueText={C.controls.delayValue(controls.delayMonths)}
        onChange={(v) => setControl("delayMonths", v)}
        testId="simulador-retraso"
      />
      <div role="group" aria-labelledby="simulador-presets-titulo" className="flex flex-col gap-3">
        <p id="simulador-presets-titulo" className="text-sm font-medium">
          {C.presetsLabel}
        </p>
        <div className="flex flex-wrap gap-2">
          {STRESS_PRESET_IDS.map((id) => (
            <Button
              key={id}
              type="button"
              size="sm"
              variant={activePreset === id ? "default" : "outline"}
              aria-pressed={activePreset === id}
              data-testid={`simulador-preset-${id}`}
              onClick={() => applyPreset(id)}
            >
              {C.presets[id]}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
