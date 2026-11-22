import { z } from "zod";
import { parseIsoDate, type IsoDate } from "@/shared/domain/calendar-date";
import { parseId, type Id } from "@/shared/domain/id";
import { parseUsdCents, type Money } from "@/shared/domain/money";

export const moneySchema: z.ZodType<Money> = z
  .object({ cents: z.number(), currency: z.literal("USD") })
  .transform((value, ctx) => {
    const parsed = parseUsdCents(value.cents);
    if (!parsed.ok) {
      ctx.addIssue({ code: "custom", message: parsed.error.detail ?? parsed.error.code });
      return z.NEVER;
    }
    return parsed.value;
  });

export const isoDateSchema: z.ZodType<IsoDate> = z.unknown().transform((raw, ctx) => {
  const parsed = parseIsoDate(raw);
  if (!parsed.ok) {
    ctx.addIssue({ code: "custom", message: parsed.error.detail ?? parsed.error.code });
    return z.NEVER;
  }
  return parsed.value;
});

export function idSchema<Tag extends string>(): z.ZodType<Id<Tag>> {
  return z.unknown().transform((raw, ctx) => {
    const parsed = parseId<Tag>(raw);
    if (!parsed.ok) {
      ctx.addIssue({ code: "custom", message: parsed.error.detail ?? parsed.error.code });
      return z.NEVER;
    }
    return parsed.value;
  });
}
