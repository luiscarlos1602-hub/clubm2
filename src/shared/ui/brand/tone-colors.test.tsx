import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ErrorState } from "./ErrorState";
import { StatusBadge } from "./StatusBadge";

describe("atención y error usan Óxido (ADR-009), no el color de acción", () => {
  it("StatusBadge attention", () => {
    const html = renderToStaticMarkup(<StatusBadge tone="attention" label="x" />);
    expect(html).toContain("border-destructive");
    expect(html).toContain("text-destructive");
    expect(html).not.toContain("text-primary");
  });
  it("ErrorState", () => {
    const html = renderToStaticMarkup(<ErrorState />);
    expect(html).toContain("border-destructive");
    expect(html).toContain("text-destructive");
    expect(html).not.toContain("text-primary");
  });
});
