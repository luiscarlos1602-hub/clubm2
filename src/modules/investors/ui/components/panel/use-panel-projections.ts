"use client";

import type { UseQueryResult } from "@tanstack/react-query";
import { useHoldingProjections, type HoldingProjections } from "@/modules/finance/ui";
import { EXAMPLE_HOLDINGS } from "./examples";

/** Tenencias en curso (las liquidadas no proyectan). Constante para que la query key sea estable. */
const IN_PROGRESS = EXAMPLE_HOLDINGS.filter((h) => h.status !== "settled").map((h) => ({ code: h.code, quantity: h.quantity }));

/** Proyección base de cada tenencia: la calcula finance con el mismo cálculo del simulador de la ficha. */
export function usePanelProjections(): UseQueryResult<HoldingProjections, Error> {
  return useHoldingProjections(IN_PROGRESS);
}
