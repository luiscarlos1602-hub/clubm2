import { usd, type Money } from "@/shared/domain/money";

// Datos de ejemplo del CRM (ADR-012). No existen en la semilla: personas y cifras ficticias.

export type FunnelStepKey = "lead" | "registered" | "enabled" | "invested";

/** Embudo de ejemplo: contactos que llegan a cada paso. */
export const FUNNEL: readonly { readonly key: FunnelStepKey; readonly count: number; readonly widthPercent: number }[] = [
  { key: "lead", count: 248, widthPercent: 100 },
  { key: "registered", count: 132, widthPercent: 53 },
  { key: "enabled", count: 41, widthPercent: 17 },
  { key: "invested", count: 17, widthPercent: 7 },
];

/** 17 de 132 registros, redondeado (ejemplo). */
export const REGISTRY_TO_INVESTED = "13 %";
export const LEADS_THIS_MONTH = 248;
/** Ticket promedio de ejemplo: 3 participaciones de USD 100. */
export const AVERAGE_TICKET: Money = usd(30_000);

export const ORIGINS: readonly { readonly label: string; readonly percent: number }[] = [
  { label: "Instagram", percent: 38 },
  { label: "Referidos", percent: 27 },
  { label: "Eventos del club", percent: 15 },
  { label: "Búsqueda web", percent: 12 },
  { label: "Otros", percent: 8 },
];

export type Lead = {
  readonly id: string;
  readonly name: string;
  readonly city: string;
  readonly origin: string;
  readonly step: FunnelStepKey;
  readonly date: string;
  readonly ticket: Money | null;
};

export const LEADS: readonly Lead[] = [
  { id: "ld-01", name: "Contacto de ejemplo 01", city: "Caracas", origin: "Instagram", step: "invested", date: "2026-11-19", ticket: usd(20_000) },
  { id: "ld-02", name: "Contacto de ejemplo 02", city: "Valencia", origin: "Referidos", step: "enabled", date: "2026-11-18", ticket: null },
  { id: "ld-03", name: "Contacto de ejemplo 03", city: "Caracas", origin: "Eventos del club", step: "registered", date: "2026-11-17", ticket: null },
  { id: "ld-04", name: "Contacto de ejemplo 04", city: "Maracaibo", origin: "Búsqueda web", step: "lead", date: "2026-11-17", ticket: null },
  { id: "ld-05", name: "Contacto de ejemplo 05", city: "Caracas", origin: "Instagram", step: "invested", date: "2026-11-15", ticket: usd(50_000) },
  { id: "ld-06", name: "Contacto de ejemplo 06", city: "Barquisimeto", origin: "Referidos", step: "registered", date: "2026-11-14", ticket: null },
  { id: "ld-07", name: "Contacto de ejemplo 07", city: "Caracas", origin: "Otros", step: "lead", date: "2026-11-12", ticket: null },
  { id: "ld-08", name: "Contacto de ejemplo 08", city: "Valencia", origin: "Instagram", step: "enabled", date: "2026-11-10", ticket: null },
];
