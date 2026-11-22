export const demoConfig = {
  storageKey: "club-demo:v2",
  /** Claves de versiones anteriores: el container las borra al crearse (la v1 se reinicia, sin migración). */
  legacyStorageKeys: ["club-demo:v1"] as const,
  /** SUPUESTO L9 */
  timeZone: "America/Caracas",
  /** "Viaje en el tiempo" para capturas y E2E: NEXT_PUBLIC_DEMO_TODAY=YYYY-MM-DD. Se valida en demoClock(). */
  fixedToday: process.env.NEXT_PUBLIC_DEMO_TODAY ?? null,
} as const;
