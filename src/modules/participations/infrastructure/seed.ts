import { z } from "zod";
import { addDays, type IsoDate } from "@/shared/domain/calendar-date";
import { asId } from "@/shared/domain/id";
import { usdUnits } from "@/shared/domain/money";
import { idSchema, isoDateSchema, moneySchema } from "@/shared/infrastructure/zod-schemas";
import {
  PARTICIPATION_STATUSES,
  type HolderId,
  type Participation,
  type ParticipationClass,
} from "../domain/participation";

/** Inversionista demo: solo un id. Nombre y perfil llegan con `investors` (F2). */
export const DEMO_HOLDER_ID: HolderId = asId<"Investor">("inv_demo");

export type ParticipationsSlice = {
  readonly classes: readonly ParticipationClass[];
  readonly participations: readonly Participation[];
};

export const participationsSliceSchema: z.ZodType<ParticipationsSlice> = z.object({
  classes: z.array(
    z.object({
      id: idSchema<"ParticipationClass">(),
      projectId: idSchema<"Project">(),
      total: z.number().int().min(1),
      placed: z.number().int().min(0),
      unitPrice: moneySchema,
    }),
  ),
  participations: z.array(
    z.object({
      id: idSchema<"Participation">(),
      classId: idSchema<"ParticipationClass">(),
      projectId: idSchema<"Project">(),
      holderId: idSchema<"Investor">(),
      quantity: z.number().int().min(1),
      status: z.enum(PARTICIPATION_STATUSES),
      subscribedOn: isoDateSchema,
    }),
  ),
});

export type ParticipationsSeedContext = {
  /** Fecha de compra por proyecto (la pone composition desde la semilla de projects). */
  readonly acquiredOn: ReadonlyMap<ParticipationClass["projectId"], IsoDate>;
};

const CLASSES = [
  { suffix: "palos_grandes_01", placed: 88 },
  { suffix: "hatillo_01", placed: 81 },
  { suffix: "chacao_01", placed: 100 },
  { suffix: "valencia_01", placed: 94 },
  { suffix: "paraiso_01", placed: 100 },
  { suffix: "chacao_02", placed: 63 },
] as const;

const HOLDINGS = [
  { id: "par_demo_chacao_01", suffix: "chacao_01", quantity: 5, afterDays: 3 },
  { id: "par_demo_paraiso_01", suffix: "paraiso_01", quantity: 3, afterDays: 4 },
  { id: "par_demo_chacao_02", suffix: "chacao_02", quantity: 2, afterDays: 2 },
] as const;

/** Todas las clases: 100 × USD 100 (ref. del maestro). M2-007 no tiene clase: se publica tras la compra. */
export function buildParticipationsSeed(ctx: ParticipationsSeedContext): ParticipationsSlice {
  const classes: ParticipationClass[] = CLASSES.map((c) => ({
    id: asId<"ParticipationClass">(`pcl_${c.suffix}`),
    projectId: asId<"Project">(`prj_${c.suffix}`),
    total: 100,
    placed: c.placed,
    unitPrice: usdUnits(100),
  }));

  const participations: Participation[] = HOLDINGS.map((h) => {
    const projectId = asId<"Project">(`prj_${h.suffix}`);
    const acquiredOn = ctx.acquiredOn.get(projectId);
    if (acquiredOn === undefined) {
      throw new Error(`semilla de participaciones: falta la fecha de compra de ${projectId}`);
    }
    return {
      id: asId<"Participation">(h.id),
      classId: asId<"ParticipationClass">(`pcl_${h.suffix}`),
      projectId,
      holderId: DEMO_HOLDER_ID,
      quantity: h.quantity,
      status: "confirmed",
      subscribedOn: addDays(acquiredOn, h.afterDays),
    };
  });

  return participationsSliceSchema.parse({ classes, participations });
}
