// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { createContainer } from "@/composition/container";
import { Providers } from "@/composition/providers";
import { fixedClock } from "@/shared/domain/clock";
import type { IsoDate } from "@/shared/domain/calendar-date";
import { FinanceScreen } from "./FinanceScreen";

afterEach(cleanup);

describe("FinanceScreen", () => {
  it("liquida con el motor: realizado en M2-001 y proyección en M2-002", async () => {
    const container = createContainer({ clock: fixedClock("2026-11-22" as IsoDate), storage: null });
    render(<Providers container={container}><FinanceScreen /></Providers>);
    expect(await screen.findByTestId("finanzas-resultado")).toBeTruthy();
    expect(screen.getByTestId("finanzas-base").textContent).toContain("realizada");
    fireEvent.change(screen.getByTestId("finanzas-selector"), { target: { value: "M2-002" } });
    expect(screen.getByTestId("finanzas-base").textContent).toContain("Simulación");
    expect(screen.getByTestId("finanzas-liquidar")).toBeTruthy();
  });
});
