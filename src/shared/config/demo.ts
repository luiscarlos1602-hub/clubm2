export const demoConfig = {
  storageKey: "club-demo:v1",
  /** SUPUESTO L9 */
  timeZone: "America/Caracas",
  /** "Viaje en el tiempo" para capturas y E2E: NEXT_PUBLIC_DEMO_TODAY=YYYY-MM-DD. Se valida en demoClock(). */
  fixedToday: process.env.NEXT_PUBLIC_DEMO_TODAY ?? null,
} as const;
