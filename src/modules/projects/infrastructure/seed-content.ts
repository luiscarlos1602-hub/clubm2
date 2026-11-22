import type { IsoDate } from "@/shared/domain/calendar-date";
import { asId } from "@/shared/domain/id";
import type { RelativeDates } from "@/shared/infrastructure/relative-dates";
import type { Project } from "../domain/project";
import type { ProcessStageKind, ProcessStep, ProjectProcess } from "../domain/process";
import type { ProjectRiskKind, ProjectRisks } from "../domain/project-risk";
import type { ProjectUpdate, ProjectUpdateId } from "../domain/project-update";
import type { PropertyProfile } from "../domain/property-profile";

/**
 * Contenido de ejemplo de la ficha (maqueta de ADR-012/013 → semilla v2). Texto inventado, sin dirección exacta.
 * Proceso y actualizaciones van en días tras la compra: las fechas se derivan del Clock, nunca se escriben aquí.
 * Clave = parte final del id del proyecto (`prj_<key>`). M2-007 no se publica y no tiene contenido.
 */

const done = (offsetDays: number): ProcessStep => ({ status: "done", offsetDays, started: true });
/** Etapa en curso: `started` = ya empezó (fecha cierta); si no, la fecha es estimada. */
const current = (offsetDays: number, started = true): ProcessStep => ({
  status: "current",
  offsetDays,
  started,
});
const upcoming = (offsetDays: number): ProcessStep => ({
  status: "upcoming",
  offsetDays,
  started: false,
});

type UpdateSeed = { readonly offsetDays: number; readonly title: string; readonly body: string };

type ContentSeed = {
  readonly description: string;
  readonly highlights: readonly string[];
  readonly steps: Readonly<Record<ProcessStageKind, ProcessStep>>;
  readonly updates: readonly UpdateSeed[];
  readonly extraRisks: readonly ProjectRiskKind[];
};

const COMMON_RISKS: readonly ProjectRiskKind[] = [
  "sale_below_target",
  "works_overrun",
  "slow_sale",
];

const CONTENT: Readonly<Record<string, ContentSeed>> = {
  palos_grandes_01: {
    description:
      "Apartamento de tres ambientes en un edificio de los años 80, con reforma integral de cocina, baños y acabados.",
    highlights: ["Tres ambientes", "Dos baños", "Un puesto de estacionamiento"],
    steps: {
      works_start: done(7),
      works_50: done(30),
      works_80: done(50),
      sale_start: done(62),
      on_sale: done(70),
      sold: done(140),
    },
    updates: [
      {
        offsetDays: 160,
        title: "Liquidación realizada",
        body: "Se cerró la liquidación del proyecto y se registró el resultado realizado.",
      },
      { offsetDays: 140, title: "Venta firmada", body: "Se firmó la venta del inmueble." },
      {
        offsetDays: 62,
        title: "Reforma terminada",
        body: "La obra concluyó y el inmueble quedó listo para mostrarse.",
      },
    ],
    extraRisks: [],
  },
  hatillo_01: {
    description:
      "Casa de dos plantas con jardín, con reforma de cocina, baños, pisos y exteriores.",
    highlights: ["Dos plantas", "Jardín", "Tres baños"],
    steps: {
      works_start: done(10),
      works_50: done(50),
      works_80: done(100),
      sale_start: done(120),
      on_sale: current(135),
      sold: upcoming(300),
    },
    updates: [
      {
        offsetDays: 210,
        title: "Visitas de interesados",
        body: "Se atendieron nuevas visitas y se recibieron comentarios sobre precio y acabados.",
      },
      {
        offsetDays: 135,
        title: "Publicada en venta",
        body: "La casa se publicó en los canales de venta de la empresa.",
      },
      {
        offsetDays: 120,
        title: "Reforma terminada",
        body: "La obra concluyó con exteriores y jardín listos.",
      },
    ],
    extraRisks: ["narrow_buyer_pool"],
  },
  chacao_01: {
    description: "Apartamento de dos habitaciones con reforma de cocina, baños y acabados.",
    highlights: ["Dos habitaciones", "Un baño", "Edificio con vigilancia"],
    steps: {
      works_start: done(3),
      works_50: done(15),
      works_80: done(28),
      sale_start: done(35),
      on_sale: done(42),
      sold: done(75),
    },
    updates: [
      {
        offsetDays: 90,
        title: "Liquidación realizada",
        body: "Se cerró la liquidación y se registró el resultado realizado.",
      },
      { offsetDays: 75, title: "Venta firmada", body: "Se firmó la venta del inmueble." },
      {
        offsetDays: 35,
        title: "Reforma terminada",
        body: "La obra concluyó dentro del presupuesto.",
      },
    ],
    extraRisks: [],
  },
  valencia_01: {
    description: "Apartamento con reforma de cocina, baños, pisos y carpintería a medida.",
    highlights: ["Tres ambientes", "Carpintería a medida", "Un puesto de estacionamiento"],
    steps: {
      works_start: done(5),
      works_50: done(25),
      works_80: done(45),
      sale_start: done(60),
      on_sale: current(75),
      sold: upcoming(125),
    },
    updates: [
      {
        offsetDays: 98,
        title: "Visitas programadas",
        body: "Se programaron visitas con interesados en la zona.",
      },
      {
        offsetDays: 75,
        title: "Publicado en venta",
        body: "El apartamento se publicó para la venta.",
      },
      {
        offsetDays: 60,
        title: "Reforma terminada",
        body: "La obra concluyó y se hizo la limpieza final.",
      },
    ],
    extraRisks: ["local_market"],
  },
  paraiso_01: {
    description: "Apartamento en obra: reforma de cocina, baños, pisos y electricidad.",
    highlights: ["Dos habitaciones", "Un baño", "Reforma en curso"],
    steps: {
      works_start: done(7),
      works_50: current(50, false),
      works_80: upcoming(58),
      sale_start: upcoming(62),
      on_sale: upcoming(66),
      sold: upcoming(100),
    },
    updates: [
      {
        offsetDays: 38,
        title: "Instalaciones eléctricas",
        body: "Avanza el cambio de instalaciones eléctricas y de plomería.",
      },
      {
        offsetDays: 21,
        title: "Demolición terminada",
        body: "Terminó la demolición de la cocina y los baños.",
      },
      { offsetDays: 7, title: "Inicio de obra", body: "Comenzó la preparación del inmueble." },
    ],
    extraRisks: ["hidden_works_issues"],
  },
  chacao_02: {
    description:
      "Apartamento recién comprado, con reforma planificada de cocina, baños y acabados.",
    highlights: ["Tres ambientes", "Dos baños", "Colocación abierta"],
    steps: {
      works_start: current(30, false),
      works_50: upcoming(60),
      works_80: upcoming(78),
      sale_start: upcoming(90),
      on_sale: upcoming(94),
      sold: upcoming(125),
    },
    updates: [
      {
        offsetDays: 9,
        title: "Presupuesto de obra definido",
        body: "Se cerró el presupuesto de reforma con sus rubros y honorarios.",
      },
      {
        offsetDays: 3,
        title: "Colocación abierta",
        body: "Se abrió la colocación de participaciones económicas del proyecto.",
      },
    ],
    extraRisks: ["incomplete_placement"],
  },
};

export type ProjectContent = {
  readonly profiles: readonly PropertyProfile[];
  readonly processes: readonly ProjectProcess[];
  readonly updates: readonly ProjectUpdate[];
  readonly risks: readonly ProjectRisks[];
};

/** Contenido de los proyectos publicados. Los proyectos sin entrada en CONTENT (M2-007) quedan sin contenido. */
export function buildProjectContent(
  projects: readonly Project[],
  dates: RelativeDates,
): ProjectContent {
  const profiles: PropertyProfile[] = [];
  const processes: ProjectProcess[] = [];
  const updates: ProjectUpdate[] = [];
  const risks: ProjectRisks[] = [];

  for (const project of projects) {
    const key = project.id.replace(/^prj_/, "");
    const seed = CONTENT[key];
    if (seed === undefined) continue;
    const acquiredOn: IsoDate | null = project.timeline.acquiredOn;
    if (acquiredOn === null)
      throw new Error(`semilla de contenido: ${project.code} publicado sin fecha de compra`);

    profiles.push({
      propertyId: project.propertyId,
      description: seed.description,
      highlights: seed.highlights,
    });
    processes.push({ projectId: project.id, steps: seed.steps });
    risks.push({ projectId: project.id, kinds: [...COMMON_RISKS, ...seed.extraRisks] });

    [...seed.updates]
      .sort((a, b) => a.offsetDays - b.offsetDays)
      .forEach((u, i) => {
        updates.push({
          id: asId<"ProjectUpdate">(`upd_${key}_${i + 1}`) as ProjectUpdateId,
          projectId: project.id,
          publishedOn: dates.daysAfter(acquiredOn, u.offsetDays),
          title: u.title,
          body: u.body,
        });
      });
  }
  return { profiles, processes, updates, risks };
}
