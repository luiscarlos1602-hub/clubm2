// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
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
    clock: { today: () => "2026-11-22" },
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
    await waitFor(() => expect(screen.getAllByTestId(/^panel-participacion-m2-\d{3}$/)).toHaveLength(3));
    expect(screen.getByTestId("panel-abierto-m2-006")).toBeTruthy();
  });

  it("junto a toda ganancia aparece su % sobre el capital (motor) (ganancia realizada)", async () => {
    wrap(<PanelScreen />);
    expect(screen.getByTestId("panel-resumen-realizada-porcentaje").textContent).toContain("34,5 %");
    await waitFor(() => expect(screen.getByTestId("panel-participacion-m2-003-porcentaje").textContent).toContain("34,5 %"));
  });

  it("agendar visita: solo en proyectos en curso; confirma sin guardar nada", async () => {
    wrap(<PanelScreen />);
    await waitFor(() => expect(screen.getByTestId("visita-abrir-m2-005")).toBeTruthy());
    expect(screen.queryByTestId("visita-abrir-m2-003")).toBeNull();
    fireEvent.click(screen.getByTestId("visita-abrir-m2-005"));
    expect(screen.getByTestId("visita-fecha-m2-005").getAttribute("min")).toBe("2026-11-22");
    fireEvent.change(screen.getByTestId("visita-fecha-m2-005"), { target: { value: "2026-11-01" } });
    fireEvent.click(screen.getByTestId("visita-enviar-m2-005"));
    expect(screen.getByTestId("visita-fecha-error-m2-005")).toBeTruthy();
    expect(screen.queryByTestId("visita-confirmacion-m2-005")).toBeNull();
    fireEvent.change(screen.getByTestId("visita-fecha-m2-005"), { target: { value: "2026-12-10" } });
    fireEvent.click(screen.getByTestId("visita-enviar-m2-005"));
    expect(screen.getByTestId("visita-confirmacion-m2-005").textContent).toContain("El equipo te contactará para confirmar la visita");
  });

  it("muestra el proceso del inmueble de cada participación", async () => {
    wrap(<PanelScreen />);
    await waitFor(() => expect(screen.getByTestId("proceso-m2-005")).toBeTruthy());
    expect(screen.getByTestId("proceso-m2-005-resumen").textContent).toContain("Obra al 50 %");
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
