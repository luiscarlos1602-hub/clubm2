// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { TermsScreen } from ".";

afterEach(cleanup);

describe("TermsScreen", () => {
  it("tiene un h1, los riesgos y el aviso de texto de ejemplo", () => {
    render(<TermsScreen />);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByTestId("terminos-riesgos").textContent).toMatch(/perder parte o la totalidad/);
    expect(screen.getByTestId("aviso-legal-placeholder").textContent).toMatch(/sujeto a revisión/);
  });
});
