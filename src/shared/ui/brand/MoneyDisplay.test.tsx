import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { BRAND_COPY } from "./brand-copy";
import { LEGAL_COPY } from "./legal-copy";
import { MoneyDisplay } from "./MoneyDisplay";

const value = { cents: 1_000_000, currency: "USD" } as const;
const html = (kind: "capital" | "realized" | "projection" | "amount") =>
  renderToStaticMarkup(<MoneyDisplay value={value} kind={kind} />);

describe("MoneyDisplay", () => {
  it("projection siempre incluye ProjectionLabel con el texto legal", () => {
    const out = html("projection");
    expect(out).toContain('data-testid="projection-label"');
    expect(out).toContain(LEGAL_COPY.projectionTag);
  });
  it.each(["capital", "realized", "amount"] as const)("%s no incluye ProjectionLabel", (kind) => {
    expect(html(kind)).not.toContain("projection-label");
  });
  it("usa el rótulo por defecto de BRAND_COPY", () => {
    expect(html("capital")).toContain(BRAND_COPY.figureLabels.capital);
    expect(html("realized")).toContain(BRAND_COPY.figureLabels.realized);
    expect(html("projection")).toContain(BRAND_COPY.figureLabels.projection);
  });
  it("amount no tiene rótulo propio", () => {
    const out = html("amount");
    for (const label of Object.values(BRAND_COPY.figureLabels)) expect(out).not.toContain(label);
  });
  it("refleja data-kind y formatea el monto", () => {
    const out = html("realized");
    expect(out).toContain('data-kind="realized"');
    expect(out).toContain("USD 10.000");
  });
});
