"use client";

import { useMemo, useState } from "react";
import {
  neutralControls,
  normalizeControls,
  simulateProjection,
  type SimulationBase,
  type SimulationControls,
  type SimulationResult,
} from "../../domain/simulator";
import { applyStressPreset, type StressPresetId } from "../../domain/stress-presets";

export type UseSimulator = {
  controls: SimulationControls;
  result: SimulationResult;
  activePreset: StressPresetId | null;
  setControl: <K extends keyof SimulationControls>(key: K, value: SimulationControls[K]) => void;
  applyPreset: (id: StressPresetId) => void;
};

/** Estado del simulador. Los números los entrega `simulateProjection` (motor); aquí solo vive la interacción. */
export function useSimulator(base: SimulationBase, heldMax: number): UseSimulator {
  const [controls, setControls] = useState<SimulationControls>(() => neutralControls(base));
  const [activePreset, setActivePreset] = useState<StressPresetId | null>("base");
  const result = useMemo(() => simulateProjection(base, controls), [base, controls]);

  return {
    controls,
    result,
    activePreset,
    setControl: (key, value) => {
      setControls((current) => normalizeControls(base, heldMax, { ...current, [key]: value }));
      setActivePreset(null);
    },
    applyPreset: (id) => {
      setControls((current) => normalizeControls(base, heldMax, applyStressPreset(base, current, id)));
      setActivePreset(id);
    },
  };
}
