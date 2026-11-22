// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { CrmScreen } from "./CrmScreen";

afterEach(cleanup);

describe("CrmScreen", () => {
  it("muestra embudo, origen y leads, y filtra por paso", () => {
    render(<CrmScreen />);
    expect(screen.getByTestId("crm-embudo")).toBeTruthy();
    expect(screen.getByTestId("crm-origen")).toBeTruthy();
    expect(screen.getByTestId("crm-fila-ld-01")).toBeTruthy();
    fireEvent.change(screen.getByTestId("crm-filtro"), { target: { value: "lead" } });
    expect(screen.queryByTestId("crm-fila-ld-01")).toBeNull();
    expect(screen.getByTestId("crm-fila-ld-04")).toBeTruthy();
  });
});
