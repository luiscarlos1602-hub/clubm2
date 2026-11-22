import { z } from "zod";
import type { IsoDate } from "@/shared/domain/calendar-date";
import { usdUnits, type Money } from "@/shared/domain/money";
import { SALE_COPY } from "./copy";

const E = SALE_COPY.formErrors;

/** Solo forma (texto, enteros, fecha). Las reglas de negocio las aplica `recordProjectSale`. */
export const saleFormSchema = z.object({
  projectId: z.string().min(1, E.project),
  salePrice: z.string().trim().regex(/^\d{1,9}$/, E.digits),
  saleCosts: z.string().trim().regex(/^\d{1,9}$/, E.digits),
  signedOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, E.date),
});

export type SaleFormValues = z.infer<typeof saleFormSchema>;

/** Texto de USD enteros (ya validado por el esquema) → Money. */
export function usdOfText(text: string): Money {
  return usdUnits(Number(text.trim()));
}

export const asIsoDate = (text: string): IsoDate => text as IsoDate;
