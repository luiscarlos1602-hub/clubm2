// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { createContainer } from "@/composition/container";
import { Providers } from "@/composition/providers";
import { ProjectDetail } from "@/modules/finance/ui";
import { ProjectProcessBoard } from "@/modules/finance/backoffice-ui";
import type { IsoDate } from "@/shared/domain/calendar-date";
import { fixedClock } from "@/shared/domain/clock";
import { PanelScreen } from "../panel";

afterEach(cleanup);

/** Etapa → estado y fecha, tal como se ve en pantalla. */
function readBoard(testId: string): string[] {
  const board = screen.getByTestId(testId);
  return Array.from(board.querySelectorAll("li")).map((li) => `${li.getAttribute("data-testid")?.split("-etapa-")[1]}|${li.getAttribute("data-status")}|${li.querySelector("time")?.getAttribute("datetime")}`);
}

describe("el tablero de proceso es el mismo en ficha, panel y backoffice (M2-005)", () => {
  it("muestra las mismas etapas, estados y fechas, y ninguna es anterior a la compra", async () => {
    const container = createContainer({ clock: fixedClock("2026-11-22" as IsoDate), storage: null });
    const listing = (await container.participations.listMarketplace()).find((l) => l.code === "M2-005");
    expect(listing).toBeDefined();

    render(<Providers container={container}><ProjectDetail slug={listing!.slug} /></Providers>);
    await screen.findByTestId("ficha-proceso");
    const ficha = readBoard("ficha-proceso");
    cleanup();

    render(<Providers container={container}><PanelScreen /></Providers>);
    await waitFor(() => expect(screen.getByTestId("proceso-m2-005-tablero")).toBeTruthy());
    const panel = readBoard("proceso-m2-005-tablero");
    cleanup();

    render(<ProjectProcessBoard code="M2-005" acquiredOn={listing!.acquiredOn} data-testid="obra-proceso" />);
    const admin = readBoard("obra-proceso");

    expect(ficha).toHaveLength(6);
    expect(panel).toEqual(ficha);
    expect(admin).toEqual(ficha);
    for (const row of ficha) expect(row.split("|")[2]! >= listing!.acquiredOn).toBe(true);
  });
});
