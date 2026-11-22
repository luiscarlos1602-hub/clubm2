"use client";

import { useMemo, useState } from "react";
import {
  applyStressPreset,
  neutralControls,
  simulate,
  type SimulatorBase,
  type SimulatorControls,
  type SimulatorResult,
  type StressPresetId,
} from "./simulate";

export type UseSimulator = {
  controls: SimulatorControls;
  result: SimulatorResult;
  activePreset: StressPresetId | null;
  setControl: <K extends keyof SimulatorControls>(key: K, value: SimulatorControls[K]) => void;
  applyPreset: (id: StressPresetId) => void;
};

/** Estado del simulador. Los números los entrega `simulate` (motor); aquí solo vive la interacción. */
export function useSimulator(base: SimulatorBase): UseSimulator {
  const [controls, setControls] = useState<SimulatorControls>(() => neutralControls(base));
  const [activePreset, setActivePreset] = useState<StressPresetId | null>("base");
  const result = useMemo(() => simulate(base, controls), [base, controls]);

  return {
    controls,
    result,
    activePreset,
    setControl: (key, value) => {
      setControls((current) => ({ ...current, [key]: value }));
      setActivePreset(null);
    },
    applyPreset: (id) => {
      setControls((current) => applyStressPreset(base, current, id));
      setActivePreset(id);
    },
  };
}
