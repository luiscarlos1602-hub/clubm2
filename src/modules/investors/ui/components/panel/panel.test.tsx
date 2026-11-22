// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import type { Container } from "@/composition/container";
import { Providers } from "@/composition/providers";
import { AccountScreen, ClubScreen, PanelScreen, PortfolioScreen } from ".";

afterEach(cleanup);

const listing = (code: string, name: string, phase: string) =>
  ({
    code, slug: `${code.toLowerCase()}-x`, name, city: "Caracas", zone: "Chacao", acquiredOn: "2026-05-01",
    stage: "funding", phase, participations: { total: 100, available: phase === "open" ? 37 : 0 },
    unitPrice: { cents: 10_000, currency: "USD" }, targetTermMonths: 3, settledOn: phase === "finished" ? "2026-09-01" : null,
  }) as never;

const LISTINGS = [listing("M2-006", "Proyecto Seis", "open"), listing("M2-005", "Proyecto Cinco", "renovation"), listing("M2-003", "Proyecto Tres", "finished")];

function wrap(ui: React.ReactNode, fail = false) {
  const container = {
    participations: { listMarketplace: () => (fail ? Promise.reject(new Error("x")) : Promise.resolve(LISTINGS)) },
  } as unknown as Container;
  return render(<Providers container={container}>{ui}</Providers>);
}

describe("panel del inversionista", () => {
  it("muestra capital, ganancia realizada y proyección en bloques separados", async () => {
    wrap(<PanelScreen />);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toContain("Hola");
    for (const id of ["capital", "realizada", "proyeccion"]) expect(screen.getByTestId(`panel-resumen-${id}`)).toBeTruthy();
    expect(within(screen.getByTestId("panel-resumen-proyeccion")).getByText(/no garantizada/i)).toBeTruthy();
    await waitFor(() => expect(screen.getAllByTestId(/^panel-participacion-m2/)).toHaveLength(3));
    expect(screen.getByTestId("panel-abierto-m2-006")).toBeTruthy();
  });

  it("informa el error con opción de reintentar", async () => {
    wrap(<PanelScreen />, true);
    await waitFor(() => expect(screen.getByTestId("panel-error")).toBeTruthy());
  });

  it("portafolio: tabla por proyecto e histórico", async () => {
    wrap(<PortfolioScreen />);
    await waitFor(() => expect(screen.getByTestId("portafolio-fila-m2-003")).toBeTruthy());
    expect(screen.getByTestId("portafolio-historico-cifras")).toBeTruthy();
  });

  it("cuenta y club se renderizan con un solo h1", () => {
    render(<AccountScreen />);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    cleanup();
    render(<ClubScreen />);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByTestId("club-eventos")).toBeTruthy();
  });
});
