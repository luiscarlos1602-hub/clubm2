// API interna del backoffice: solo app/admin/** y ui/components/admin/** (ADR-004, docs/01 §8.3).
export type { Wheel, WheelClassification, WheelInput } from "./domain/classify-wheel";
export {
  WHEEL_THRESHOLDS_MONTHS,
  classifyWheel,
  classifyProjectWheel,
} from "./domain/classify-wheel";
