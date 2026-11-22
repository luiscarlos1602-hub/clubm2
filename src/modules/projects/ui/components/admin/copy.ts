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
  charts: {
    heading: "Vista gráfica",
    stageLabel: "Proyectos por etapa (cantidad)",
    placementHeading: "Colocación por proyecto",
    placementDescription: "Participaciones colocadas y disponibles de cada proyecto publicado (de 100).",
    placementLabel: "Participaciones colocadas y disponibles por proyecto",
    placed: "Colocadas",
    available: "Disponibles",
    wheelsLabel: "Ruedas de los proyectos medidos (cantidad)",
  },
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
  openDetail: "Ver detalle",
} as const;

export const OPPORTUNITY_COPY = {
  eyebrow: "Backoffice · B2",
  back: "Volver al tablero",
  titleFallback: "Oportunidad",
  notFound: { title: "No encontramos esa oportunidad", description: "Revisa el enlace o vuelve al tablero.", action: "Volver al tablero" },
  stageLabel: { opportunity: "Oportunidad", due_diligence: "Due diligence", offer: "Oferta", acquired: "Comprado" },
  property: {
    heading: "Inmueble",
    galleryNote: "Imágenes de referencia del tipo de inmueble; se reemplazan por fotos reales de la visita.",
    kind: "Tipo",
    zone: "Zona",
    area: "Superficie",
    rooms: "Habitaciones",
    bathrooms: "Baños",
    parking: "Puestos de estacionamiento",
    condition: "Estado general",
    source: "Origen de la oportunidad",
    areaValue: (m2: number) => `${m2} m²`,
    kinds: { apartment: "Apartamento", house: "Casa", duplex: "Dúplex" },
  },
  dd: {
    heading: "Due diligence",
    description: "Revisión legal, técnica y financiera antes de la oferta. Estado de ejemplo.",
    progress: (done: number, total: number) => `${done} de ${total} revisiones hechas`,
    done: "Hecho",
    pending: "Pendiente",
    listLabel: "Revisiones de due diligence",
  },
  figures: {
    heading: "Cifras de compra y presupuesto",
    description: "Cifras de ejemplo: la compra la financia la empresa con capital propio y la reforma se financia con participaciones.",
    asking: "Precio de referencia pedido",
    offer: "Oferta realizada",
    noOffer: "Sin oferta todavía",
    reform: "Presupuesto de reforma de referencia (F)",
    reformNote: "Se financia con participaciones económicas (ref. 100 × USD 100).",
    sale: "Precio de venta de referencia",
    notBought: "Capital propio: la compra aún no se ha ejecutado.",
  },
  decision: {
    heading: "Decisión",
    description: "Solo es una maqueta: ninguna acción guarda datos ni mueve la oportunidad de columna.",
    advance: "Pasar a la siguiente etapa",
    advanced: "Maqueta: la oportunidad pasaría a la siguiente columna. No se guardó nada.",
    discard: "Descartar oportunidad",
    discarded: "Maqueta: la oportunidad quedaría descartada. No se guardó nada.",
    bought: "La compra ya se ejecutó: el seguimiento continúa en el proyecto.",
    openProject: "Abrir proyecto",
  },
} as const;

export { WORKS_COPY } from "./copy-works";

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
