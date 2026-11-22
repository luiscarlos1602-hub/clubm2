import { z } from "zod";
import { brand } from "@/shared/config/brand";
import type { IsoDate } from "@/shared/domain/calendar-date";
import type { Clock } from "@/shared/domain/clock";
import { asId } from "@/shared/domain/id";
import { idSchema, isoDateSchema } from "@/shared/infrastructure/zod-schemas";
import { relativeDates } from "@/shared/infrastructure/relative-dates";
import {
  parseProjectCode,
  type Project,
  type ProjectCode,
  type ProjectId,
  type Property,
  type PropertyId,
} from "../domain/project";
import { PROJECT_STATUSES, type ProjectStatus } from "../domain/project-status";

export type ProjectsSlice = {
  readonly properties: readonly Property[];
  readonly projects: readonly Project[];
};

const codeSchema = z.unknown().transform((raw, ctx): ProjectCode => {
  const parsed = parseProjectCode(raw);
  if (!parsed.ok) {
    ctx.addIssue({ code: "custom", message: parsed.error.detail ?? parsed.error.code });
    return z.NEVER;
  }
  return parsed.value;
});

const nullableDate = isoDateSchema.nullable();

const propertySchema = z.object({
  id: idSchema<"Property">(),
  city: z.string().min(1),
  zone: z.string().min(1),
  kind: z.enum(["apartment", "house"]),
  areaM2: z.number().int().positive(),
});

const projectSchema = z.object({
  id: idSchema<"Project">(),
  code: codeSchema,
  slug: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
  name: z.string().min(1),
  propertyId: idSchema<"Property">(),
  status: z.enum(PROJECT_STATUSES),
  timeline: z.object({
    acquiredOn: nullableDate,
    saleSignedOn: nullableDate,
    settledOn: nullableDate,
  }),
});

export const projectsSliceSchema: z.ZodType<ProjectsSlice> = z.object({
  properties: z.array(propertySchema),
  projects: z.array(projectSchema),
});

type Scenario = {
  readonly n: number;
  readonly key: string;
  readonly slugZone: string;
  readonly name: string;
  readonly city: string;
  readonly zone: string;
  readonly kind: Property["kind"];
  readonly areaM2: number;
  readonly status: ProjectStatus;
  /** Días atrás desde hoy hasta la compra; null = aún sin comprar. */
  readonly acquiredDaysAgo: number | null;
  /** Días tras la compra hasta la firma de venta. */
  readonly saleAfterDays: number | null;
  /** Días atrás desde hoy hasta la liquidación. */
  readonly settledDaysAgo: number | null;
};

// Datos primarios de plan 003 §3.7. Todo lo derivado (ruedas, cifras) lo calcula el motor.
const SCENARIOS: readonly Scenario[] = [
  { n: 1, key: "palos_grandes_01", slugZone: "palos-grandes", name: "Apartamento Los Palos Grandes", city: "Caracas", zone: "Los Palos Grandes", kind: "apartment", areaM2: 92, status: "settled", acquiredDaysAgo: 300, saleAfterDays: 140, settledDaysAgo: 140 },
  { n: 2, key: "hatillo_01", slugZone: "el-hatillo", name: "Casa El Hatillo", city: "Caracas", zone: "El Hatillo", kind: "house", areaM2: 180, status: "on_sale", acquiredDaysAgo: 250, saleAfterDays: null, settledDaysAgo: null },
  { n: 3, key: "chacao_01", slugZone: "chacao", name: "Apartamento Bello Campo", city: "Caracas", zone: "Chacao", kind: "apartment", areaM2: 78, status: "settled", acquiredDaysAgo: 210, saleAfterDays: 75, settledDaysAgo: 120 },
  { n: 4, key: "valencia_01", slugZone: "el-vinedo", name: "Apartamento El Viñedo", city: "Valencia", zone: "El Viñedo", kind: "apartment", areaM2: 85, status: "on_sale", acquiredDaysAgo: 110, saleAfterDays: null, settledDaysAgo: null },
  { n: 5, key: "paraiso_01", slugZone: "el-paraiso", name: "Apartamento El Paraíso", city: "Caracas", zone: "El Paraíso", kind: "apartment", areaM2: 70, status: "renovation", acquiredDaysAgo: 45, saleAfterDays: null, settledDaysAgo: null },
  { n: 6, key: "chacao_02", slugZone: "chacao", name: "Apartamento El Rosal", city: "Caracas", zone: "Chacao", kind: "apartment", areaM2: 88, status: "funding", acquiredDaysAgo: 12, saleAfterDays: null, settledDaysAgo: null },
  { n: 7, key: "palos_grandes_02", slugZone: "palos-grandes", name: "Dúplex Los Palos Grandes", city: "Caracas", zone: "Los Palos Grandes", kind: "apartment", areaM2: 120, status: "due_diligence", acquiredDaysAgo: null, saleAfterDays: null, settledDaysAgo: null },
];

/** Única semilla que lee el Clock. El código se arma con brand.shortName y se valida con parseProjectCode. */
export function buildProjectsSeed(clock: Clock): ProjectsSlice {
  const dates = relativeDates(clock);
  const properties: Property[] = [];
  const projects: Project[] = [];

  for (const s of SCENARIOS) {
    const code = `${brand.shortName}-${String(s.n).padStart(3, "0")}`;
    const acquiredOn: IsoDate | null =
      s.acquiredDaysAgo === null ? null : dates.daysAgo(s.acquiredDaysAgo);
    const saleSignedOn: IsoDate | null =
      acquiredOn === null || s.saleAfterDays === null
        ? null
        : dates.daysAfter(acquiredOn, s.saleAfterDays);
    const settledOn: IsoDate | null =
      s.settledDaysAgo === null ? null : dates.daysAgo(s.settledDaysAgo);

    const propertyId: PropertyId = asId<"Property">(`prop_${s.key}`);
    properties.push({ id: propertyId, city: s.city, zone: s.zone, kind: s.kind, areaM2: s.areaM2 });
    projects.push({
      id: asId<"Project">(`prj_${s.key}`) as ProjectId,
      code: code as ProjectCode,
      slug: `${code.toLowerCase()}-${s.slugZone}`,
      name: s.name,
      propertyId,
      status: s.status,
      timeline: { acquiredOn, saleSignedOn, settledOn },
    });
  }
  return projectsSliceSchema.parse({ properties, projects });
}
