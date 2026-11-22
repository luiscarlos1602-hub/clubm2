// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { createContainer } from "@/composition/container";
import { Providers } from "@/composition/providers";
import { ProjectDetail, loadProjectDetail, projectHolding } from "@/modules/finance/ui";
import type { IsoDate } from "@/shared/domain/calendar-date";
import { fixedClock } from "@/shared/domain/clock";
import { formatMoney } from "@/shared/lib/format-money";
import { PanelScreen, PortfolioScreen } from ".";

afterEach(cleanup);

const container = () => createContainer({ clock: fixedClock("2026-11-22" as IsoDate), storage: null });
const CASES = [
  { code: "M2-005", quantity: 3 },
  { code: "M2-006", quantity: 2 },
] as const;

describe("la proyección del panel coincide con la de la ficha (motor único)", () => {
  it.each(CASES)("$code: panel y portafolio muestran lo mismo que la ficha", async ({ code, quantity }) => {
    const c = container();
    const listing = (await c.participations.listMarketplace()).find((l) => l.code === code);
    expect(listing).toBeDefined();
    const data = await loadProjectDetail(c, listing!.slug);
    expect(data).not.toBeNull();
    const perHolding = projectHolding(data!, quantity);
    const single = projectHolding(data!, 1);
    expect(perHolding).not.toBeNull();

    // ficha: escenario base, 1 participación
    render(<Providers container={c}><ProjectDetail slug={listing!.slug} /></Providers>);
    const base = await screen.findByTestId("escenario-base-ganancia");
    expect(base.textContent).toContain(formatMoney(single!));
    cleanup();

    // panel: la tenencia de ejemplo
    render(<Providers container={c}><PanelScreen /></Providers>);
    await waitFor(() => expect(screen.getByTestId(`panel-participacion-${code.toLowerCase()}-proyeccion`).textContent).toContain(formatMoney(perHolding!)));
    // el % sale del motor (ganancia / capital) y lleva el rótulo de proyección
    expect(screen.getByTestId(`panel-participacion-${code.toLowerCase()}-proyeccion-porcentaje`).textContent).toMatch(/^\d+(,\d+)? % sobre el capital.*no garantizada/);
    cleanup();

    // portafolio: misma cifra en la tabla
    render(<Providers container={c}><PortfolioScreen /></Providers>);
    await waitFor(() => expect(screen.getByTestId(`portafolio-fila-${code.toLowerCase()}`).textContent).toContain(formatMoney(perHolding!)));
  });
});
