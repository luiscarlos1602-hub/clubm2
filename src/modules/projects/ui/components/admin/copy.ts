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
  editSheet: "Editar ficha",
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
  table: { heading: "Proyectos", placement: "Colocación", detail: "Ver obra", manage: "Administrar inmuebles" },
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
    "Pipeline de oportunidades desde la evaluación hasta la compra con capital propio. Los cambios de etapa se guardan en este navegador; los datos son simulados.",
  columns: {
    opportunity: "Oportunidad",
    due_diligence: "Due diligence",
    acquired: "Comprado",
    discarded: "Descartado",
  },
  emptyColumn: "Sin oportunidades en esta columna",
  newOpportunity: "Dar de alta una oportunidad",
  boardLabel: "Tablero de oportunidades",
  openDetail: "Ver detalle",
} as const;

export const OPPORTUNITY_COPY = {
  eyebrow: "Backoffice · B2",
  back: "Volver al tablero",
  titleFallback: "Oportunidad",
  notFound: { title: "No encontramos esa oportunidad", description: "Revisa el enlace o vuelve al tablero.", action: "Volver al tablero" },
  property: {
    heading: "Inmueble",
    galleryNote: "Imágenes de referencia del tipo de inmueble; se reemplazan por fotos reales de la visita.",
    kind: "Tipo",
    zone: "Ubicación",
    area: "Superficie",
    areaValue: (m2: number) => `${m2} m²`,
    kinds: { apartment: "Apartamento", house: "Casa" },
  },
  dd: {
    heading: "Due diligence",
    title: "Qué se revisa antes de comprar",
    description: "Revisión legal, técnica y financiera antes de la compra. Es una guía: el avance por revisión todavía no se registra.",
    listLabel: "Revisiones de due diligence",
    items: [
      "Título de propiedad y cadena titulativa",
      "Gravámenes y solvencias",
      "Ocupación del inmueble",
      "Permisos y condominio",
      "Inspección física",
      "Costos de cierre",
      "Comparables de venta en la zona",
    ],
  },
  decision: {
    heading: "Decisión",
    description: "Avanza la oportunidad, regístrala como comprada con capital propio o descártala. El cambio se guarda y se ve en el tablero.",
    bought: "La compra ya se ejecutó: el seguimiento continúa en el proyecto.",
    discarded: "Esta oportunidad se descartó. Queda en el tablero como referencia.",
    openProject: "Abrir proyecto",
  },
} as const;

/** W-3 · cambio de etapa real (B2 y B3). */
export const STAGE_ACTIONS_COPY = {
  heading: "Etapa",
  description: "Cambia la etapa cuando el proyecto avance. Los datos son simulados: cada cambio se guarda en este navegador y se refleja en la cara pública si el proyecto está publicado.",
  actions: {
    due_diligence: "Pasar a due diligence",
    acquired: "Registrar la compra",
    discarded: "Descartar oportunidad",
    funding: "Publicar y abrir la colocación",
    renovation: "Iniciar la obra",
    on_sale: "Poner en venta",
    stalled: "Marcar como estancado",
  },
  hints: {
    acquired: "Se registra con la fecha de hoy; la compra se paga con capital propio de la empresa.",
    funding: "Exige la ficha completa para publicar.",
  },
  confirmDiscard: "Confirmar descarte",
  confirmDiscardNote: "Una oportunidad descartada no vuelve al pipeline.",
  cancel: "Cancelar",
  saving: "Guardando…",
  done: (stage: string) => `Etapa actualizada: ${stage}.`,
  saleNote: "La venta se registra en Comercialización, con el precio y los costos reales.",
  noMoves: "No hay cambios de etapa disponibles desde aquí.",
  errors: {
    NOT_READY_TO_PUBLISH: "Para publicar, la ficha debe tener: fecha de compra, descripción y destacados, proceso, clase de participación, riesgos comunes e imágenes.",
    dates: "Las fechas del proyecto no permiten este cambio. Revisa la ficha.",
    INVALID_TRANSITION: "Ese cambio de etapa ya no es posible. Recarga la página.",
    generic: "No se pudo guardar el cambio. Inténtalo de nuevo.",
  },
  completeSheet: "Completar la ficha",
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

export const PROJECTS_LIST_COPY = {
  eyebrow: "Backoffice · Proyectos",
  title: "Proyectos",
  description: "Todos los inmuebles dados de alta, también los internos. Crea uno nuevo o edita su ficha; el almacén es local y los datos son simulados.",
  newProperty: "Nuevo inmueble",
  table: { heading: "Inmuebles", edit: "Editar", view: "Ver ficha", detail: "Detalle de obra" },
  internal: "Interno",
  published: "Visible en Proyectos",
  empty: { title: "Sin inmuebles dados de alta", description: "Los inmuebles que registres aparecerán aquí." },
} as const;
