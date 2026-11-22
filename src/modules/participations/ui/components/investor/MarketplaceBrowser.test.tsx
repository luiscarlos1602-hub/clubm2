// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import type { Container } from "@/composition/container";
import { Providers } from "@/composition/providers";
import type { ListingPhase, ProjectListing } from "../../../domain/marketplace-listing";
import { MarketplaceBrowser } from "./MarketplaceBrowser";

afterEach(cleanup);

function listing(code: string, phase: ListingPhase): ProjectListing {
  const stage = phase === "open" || phase === "placement_complete" ? "funding" : phase === "finished" ? "settled" : phase;
  return {
    projectId: `id-${code}`,
    code,
    slug: `${code.toLowerCase()}-ejemplo`,
    name: `Proyecto ${code}`,
    city: "Caracas",
    zone: "Chacao",
    acquiredOn: "2026-05-01",
    stage,
    phase,
    participations: { total: 100, available: phase === "open" ? 37 : 0 },
    unitPrice: { cents: 10_000, currency: "USD" },
    targetTermMonths: phase === "sold" || phase === "finished" ? null : 3,
    settledOn: phase === "finished" ? "2026-09-01" : null,
  } as unknown as ProjectListing;
}

function setup(listMarketplace: () => Promise<readonly ProjectListing[]>) {
  const container = { participations: { listMarketplace } } as unknown as Container;
  return render(
    <Providers container={container}>
      <MarketplaceBrowser />
    </Providers>,
  );
}

const THREE = [listing("M2-006", "open"), listing("M2-005", "renovation"), listing("M2-001", "finished")];

describe("MarketplaceBrowser", () => {
  it("muestra el esqueleto mientras carga", () => {
    setup(() => new Promise(() => undefined));
    expect(screen.getByTestId("marketplace-cargando")).toBeTruthy();
  });

  it("muestra el error y reintenta", async () => {
    const list = vi.fn().mockRejectedValue(new Error("fallo"));
    setup(list);
    await screen.findByTestId("marketplace-error");
    fireEvent.click(screen.getByTestId("marketplace-reintentar"));
    await waitFor(() => expect(list).toHaveBeenCalledTimes(2));
  });

  it("sin datos muestra el vacío sin acción de limpiar", async () => {
    setup(() => Promise.resolve([]));
    await screen.findByTestId("marketplace-vacio");
    expect(screen.queryByTestId("marketplace-limpiar-filtros")).toBeNull();
  });

  it("filtra por etapa y limpia los filtros", async () => {
    setup(() => Promise.resolve(THREE));
    await waitFor(() => expect(screen.getAllByTestId("tarjeta-proyecto")).toHaveLength(3));
    fireEvent.click(screen.getByTestId("filtro-etapa-abiertos"));
    expect(screen.getAllByTestId("tarjeta-proyecto")).toHaveLength(1);
    expect(screen.getByTestId("filtro-etapa-abiertos").getAttribute("aria-pressed")).toBe("true");
    fireEvent.click(screen.getByTestId("filtro-etapa-en-venta"));
    expect(screen.getByTestId("marketplace-vacio")).toBeTruthy();
    fireEvent.click(screen.getByTestId("marketplace-limpiar-filtros"));
    expect(screen.getAllByTestId("tarjeta-proyecto")).toHaveLength(3);
  });

  it("histórico sin proyección; abierto con plazo como proyección e imagen según fase, sin aviso por tarjeta", async () => {
    setup(() => Promise.resolve(THREE));
    const cards = await screen.findAllByTestId("tarjeta-proyecto");
    const finished = cards.find((c) => c.getAttribute("data-phase") === "finished")!;
    expect(within(finished).getByTestId("tarjeta-historico")).toBeTruthy();
    expect(within(finished).queryByTestId("projection-label")).toBeNull();
    const open = cards.find((c) => c.getAttribute("data-phase") === "open")!;
    expect(within(within(open).getByTestId("tarjeta-plazo-proyeccion")).getByTestId("tarjeta-plazo")).toBeTruthy();
    expect(within(open).getByTestId("projection-label")).toBeTruthy();
    expect(within(open).queryByTestId("tarjeta-aviso-riesgo")).toBeNull();
    expect(within(open).getByTestId("tarjeta-imagen").getAttribute("data-variant")).toBe("proyeccion");
    expect(within(finished).getByTestId("tarjeta-imagen").getAttribute("data-variant")).toBe("despues");
  });

  it("no menciona ruedas ni estancamiento", async () => {
    const { container } = setup(() => Promise.resolve(THREE));
    await screen.findAllByTestId("tarjeta-proyecto");
    expect(container.textContent).not.toMatch(/rueda|estancad/i);
  });
});
