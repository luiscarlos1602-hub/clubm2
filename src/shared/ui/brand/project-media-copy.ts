/** Textos de imágenes y tablero de proceso (docs/06: referencia, nunca promesa). */
export const PROJECT_MEDIA_COPY = {
  referenceTag: "Imagen de referencia",
  gallery: {
    tablist: "Imágenes del proyecto",
    antes: "Antes",
    despues: "Después",
    proyeccion: "Proyección (render)",
    projectionNote: "Render ilustrativo de cómo podría quedar. Es una proyección, no un resultado.",
    alt: {
      antes: (name: string) => `${name}: ilustración del estado previo a la reforma`,
      despues: (name: string) => `${name}: ilustración del inmueble renovado`,
      proyeccion: (name: string) => `${name}: render ilustrativo de la reforma prevista`,
    },
  },
  process: {
    label: "Etapas del proceso",
    stages: {
      "inicio-obra": "Inicio de obra",
      "obra-50": "Obra al 50 %",
      "obra-80": "Obra al 80 %",
      "inicio-venta": "Inicio de venta",
      "en-venta": "En venta",
      vendida: "Vendida",
    },
    status: { done: "Completada", current: "En curso", upcoming: "Próxima" },
    estimatedDate: "Fecha estimada",
    realDate: "Fecha",
  },
} as const;
