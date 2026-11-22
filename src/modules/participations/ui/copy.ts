/** Textos de la vista de proyectos (P3). Revisión: skill copy-sin-promesas + check-copy.
 *  El aviso de riesgo (uno por página) y la etiqueta de proyección salen de LEGAL_COPY, no de aquí. */
export const MARKETPLACE_COPY = {
  header: {
    eyebrow: "Proyectos",
    title: "Proyectos del club",
    description:
      "Cada proyecto con su etapa, las participaciones disponibles y el plazo objetivo como proyección. Son proyectos de ejemplo.",
  },
  listHeading: "Lista de proyectos",
  filters: {
    stageLabel: "Etapa",
    stage: {
      all: "Todas",
      open: "Abiertos a participar",
      renovation: "En obra",
      on_sale: "En venta",
      finished: "Finalizados",
    },
    locationLabel: "Ubicación",
  },
  location: {
    all: "Todas las ubicaciones",
    city: (city: string) => `${city} · todas las zonas`,
    zone: (city: string, zone: string) => `${city} · ${zone}`,
  },
  results: (n: number) => (n === 1 ? "1 proyecto" : `${n} proyectos`),
  emptyAll: {
    title: "Todavía no hay proyectos publicados",
    description: "Los proyectos de ejemplo aparecerán aquí.",
  },
  emptyFiltered: {
    title: "No hay proyectos con estos filtros",
    description: "Prueba con otra etapa o ubicación.",
    action: "Ver todos los proyectos",
  },
  error: {
    title: "No pudimos cargar los proyectos",
    description: "Inténtalo de nuevo. Si continúa, reinicia los datos simulados.",
    action: "Reintentar",
  },
  phase: {
    open: "Abierto a participar",
    placement_complete: "Colocación completa",
    renovation: "En obra",
    on_sale: "En venta",
    sold: "Vendido",
    finished: "Finalizado",
  },
  card: {
    location: (city: string, zone: string) => `${city} · ${zone}`,
    availability: (available: number, total: number) => `Participaciones disponibles: ${available} de ${total}`,
    closedNote: "colocación cerrada",
    priceLeadOpen: "Desde",
    priceSuffix: "por participación",
    priceLeadClosed: "Precio por participación:",
    targetTerm: (months: number) => `Plazo objetivo: ${months} ${months === 1 ? "mes" : "meses"} desde la compra`,
    historic: {
      sold: "Histórico · vendido, liquidación en curso",
      finished: "Histórico · proyecto finalizado",
    },
    settledOn: "Liquidado el",
    imageAlt: (name: string, variant: "antes" | "despues" | "proyeccion") =>
      variant === "proyeccion"
        ? `${name}: render ilustrativo de la reforma prevista`
        : `${name}: ilustración del inmueble renovado`,
    cta: (name: string) => `Ver la ficha de ${name}`,
  },
  nextStep: {
    title: "¿Cómo será la ficha de un proyecto?",
    description: "La ficha mostrará el inmueble, el presupuesto desglosado, los escenarios y el simulador del reparto.",
    action: "Ver cómo será la ficha",
  },
} as const;
