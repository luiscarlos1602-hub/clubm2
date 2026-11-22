import { describe, expect, it } from "vitest";
import { LEGAL_COPY } from "./legal-copy";

describe("LEGAL_COPY (docs/06)", () => {
  it("fija los textos exactos", () => {
    expect(LEGAL_COPY).toEqual({
      demoBanner: "Datos simulados · no es una oferta de inversión",
      projectionTag: "Proyección · no garantizada",
      simulatorDisclaimer:
        "Simulación ilustrativa. Los resultados dependen de la venta real, los costos y los contratos aplicables. Puedes perder parte o la totalidad de tu aporte.",
      riskNotice: "Toda inversión puede sufrir pérdidas.",
      targetTermSuffix: "proyección, no garantizada",
      legalPlaceholder: "Texto legal de ejemplo, sujeto a revisión. No es un contrato.",
    });
  });
});
