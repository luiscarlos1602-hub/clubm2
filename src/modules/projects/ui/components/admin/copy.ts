/** Textos del backoffice de proyectos (B1–B4). Pantallas internas: maqueta con datos de ejemplo (ADR-012). */
export const STAGE_LABEL = {
  opportunity: "Oportunidad",
  due_diligence: "Due diligence",
  acquired: "Comprado",
  funding: "Colocación",
  renovation: "En obra",
  on_sale: "En venta",
  sold: "Vendido",
  settled: "Liquidado",
  discarded: "Descartado",
  stalled: "Estancado",
} as const;

export const WHEEL_LABEL = {
  good: "Buena",
  medium: "Media",
  bad: "Mala",
  in_progress: "En curso",
} as const;

export const ADMIN_COMMON = {
  mockNotice: "Acción de maqueta: no se guarda nada.",
  scrollHint: "Tabla desplazable",
  open: "Abrir",
  backToPanel: "Volver al panel",
  internalOnly: "Interno · no se muestra al inversionista",
  code: "Código",
  project: "Proyecto",
  zone: "Zona",
  stage: "Etapa",
  wheel: "Rueda",
} as const;

export const DASHBOARD_COPY = {
  eyebrow: "Backoffice · B1",
  title: "Panel de operación",
  description:
    "Indicadores internos del club: capital inmovilizado, proyectos por etapa y colocación de participaciones. Todo con datos de ejemplo.",
  kpis: {
    heading: "Indicadores",
    ownCapital: "Capital propio inmovilizado",
    ownCapitalHint: "Compras de proyectos no liquidados (semilla M2-002, 004, 005, 006).",
    active: "Proyectos activos",
    activeHint: "No liquidados ni descartados.",
    placed: "Participaciones colocadas",
    placedValue: "526 de 600",
    placedHint: "Suma de los seis proyectos publicados (semilla de participaciones).",
  },
  byStage: { heading: "Proyectos por etapa", empty: "Sin proyectos en esta etapa" },
  wheels: {
    eyebrow: "Métrica interna",
    heading: "Ruedas de los proyectos",
    description:
      "Meses calendario desde la compra hasta la firma de venta: buena hasta 3, media hasta 6, mala después. Solo existe en el backoffice.",
    share: "del total medido",
    measured: "Medición",
    until: "hasta",
    none: "Sin compra todavía",
  },
  table: { heading: "Proyectos", placement: "Colocación", detail: "Ver obra" },
} as const;

export const ACQUISITIONS_COPY = {
  eyebrow: "Backoffice · B2",
  title: "Adquisiciones",
  description:
    "Pipeline de oportunidades desde la evaluación hasta la compra con capital propio. Oportunidades de ejemplo.",
  columns: {
    opportunity: "Oportunidad",
    due_diligence: "Due diligence",
    offer: "Oferta",
    acquired: "Comprado",
  },
  emptyColumn: "Sin oportunidades en esta columna",
  asking: "Precio de referencia",
  checklist: "Checklist",
  checklistOf: (done: number, total: number) => `${done} de ${total} revisiones`,
  panel: {
    heading: "Due diligence de M2-007",
    description: "Revisión legal, técnica y financiera antes de la oferta. Estado de ejemplo.",
    done: "Hecho",
    pending: "Pendiente",
    advance: "Pasar a oferta",
    advanced: "Maqueta: M2-007 pasaría a la columna Oferta. No se guardó nada.",
    discard: "Descartar",
    discarded: "Maqueta: M2-007 quedaría descartada. No se guardó nada.",
  },
  boardLabel: "Tablero de oportunidades",
} as const;

export const WORKS_COPY = {
  eyebrow: "Backoffice · B3",
  title: "Proyecto y obra",
  description: "Presupuesto frente a gasto, hitos y avances que verá el inversionista. Cifras de ejemplo.",
  notFound: { title: "No encontramos ese proyecto", description: "Revisa el enlace o vuelve al panel.", action: "Volver al panel" },
  noWorks: { title: "Todavía no hay obra", description: "El proyecto está antes de la compra: no hay presupuesto de reforma asignado." },
  budget: {
    heading: "Presupuesto de recuperación frente a gasto",
    description:
      "Lo presupuestado, lo devengado y lo remanente se registran por separado. Los honorarios no se cuentan como utilidad adicional.",
    budgeted: "Presupuestado",
    spent: "Devengado o gastado",
    remaining: "Remanente",
    over: "Sobre el presupuesto",
    lines: {
      works: "Obra",
      management_fee: "Honorarios de gestión",
      contingency: "Contingencia",
      reserve: "Reserva",
    },
    note: "Bolsa mixta de honorarios y contingencia (maestro §6).",
  },
  milestones: {
    heading: "Hitos",
    done: "Hecho",
    current: "En curso",
    upcoming: "Próximo",
  },
  orders: {
    heading: "Órdenes de trabajo",
    columns: { order: "Orden", contractor: "Contratista", budget: "Presupuesto", status: "Estado" },
  },
  deviations: {
    heading: "Desvíos",
    none: "Sin desvíos registrados.",
    some: "Hay una línea sobre su presupuesto: revisar con la unidad de reformas.",
  },
  publish: {
    heading: "Publicar avance",
    description: "El texto aparece fechado en la ficha del proyecto del inversionista.",
    label: "Resumen del avance",
    placeholder: "Qué se hizo esta semana, sin cifras de rentabilidad ni plazos ciertos.",
    action: "Publicar avance",
    done: "Maqueta: el avance se publicaría con fecha de hoy. No se guardó nada.",
    history: "Avances publicados",
  },
} as const;

export const COMMERCIAL_COPY = {
  eyebrow: "Backoffice · B4",
  title: "Comercialización",
  description: "Publicación, visitas y ofertas de los inmuebles ya reformados. Datos de ejemplo.",
  empty: { title: "Sin inmuebles en venta", description: "Cuando un proyecto pase a venta aparecerá aquí." },
  table: {
    heading: "Inmuebles en venta",
    listed: "Precio publicado",
    visits: "Visitas",
    offers: "Ofertas",
    days: "Días en venta",
    published: "Publicado",
    yes: "Sí",
    no: "No",
  },
  offersHeading: "Ofertas recibidas",
  offerColumns: { project: "Proyecto", date: "Fecha", amount: "Monto ofertado", status: "Estado" },
  visitsHeading: "Próximas visitas",
  actions: {
    publish: "Publicar inmueble",
    publishDone: "Maqueta: el inmueble quedaría publicado. No se guardó nada.",
    offer: "Registrar oferta",
    offerDone: "Maqueta: la oferta quedaría registrada. No se guardó nada.",
    close: "Cerrar venta",
    closeDone: "Maqueta: la venta quedaría firmada. No se guardó nada.",
  },
  stalledNote: "Estancado: más de 6 meses desde la compra sin firma de venta.",
} as const;
