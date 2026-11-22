// Textos de los estados genéricos de las vistas con datos del backoffice.
export const ADMIN_QUERY_COPY = {
  loading: "Cargando datos de ejemplo",
  error: { title: "No pudimos cargar los datos", description: "Los datos de ejemplo no respondieron.", action: "Reintentar" },
  empty: { title: "Sin datos", description: "Los datos de ejemplo aparecerán aquí." },
} as const;
