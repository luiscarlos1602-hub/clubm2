"use client";

import { useContainer } from "@/composition/providers";
import type { IsoDate } from "@/shared/domain/calendar-date";

/** Hoy según el reloj del container (el mismo de la semilla), no el del navegador. */
export function useToday(): IsoDate {
  return useContainer().clock.today();
}
