/** Avisos fijos de docs/06-guia-de-contenido.md. Cambiarlos exige tocar legal-copy.test.ts a propósito. */
export const LEGAL_COPY = {
  demoBanner: "Datos simulados · no es una oferta de inversión",
  projectionTag: "Proyección · no garantizada",
  simulatorDisclaimer:
    "Simulación ilustrativa. Los resultados dependen de la venta real, los costos y los contratos aplicables. Puedes perder parte o la totalidad de tu aporte.",
  riskNotice: "Toda inversión puede sufrir pérdidas.",
  targetTermSuffix: "proyección, no garantizada",
  legalPlaceholder: "Texto legal de ejemplo, sujeto a revisión. No es un contrato.",
} as const;

export type LegalNoticeKey = keyof typeof LEGAL_COPY;
