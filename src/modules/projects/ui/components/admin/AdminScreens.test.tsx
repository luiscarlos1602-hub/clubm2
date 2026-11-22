// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import type { Container } from "@/composition/container";
import { Providers } from "@/composition/providers";
import { fixedClock } from "@/shared/domain/clock";
import type { IsoDate } from "@/shared/domain/calendar-date";
import { AcquisitionsBoard } from "./AcquisitionsBoard";
import { AdminDashboard } from "./AdminDashboard";
import { CommercializationScreen } from "./CommercializationScreen";
import { ProjectWorksScreen } from "./ProjectWorksScreen";

afterEach(cleanup);

const project = (n: number, status: string, acquiredOn: string | null) => ({
  id: `prj_${n}`, code: `M2-00${n}`, slug: `m2-00${n}-zona`, name: `Proyecto ${n}`, propertyId: `prop_${n}`, status,
  timeline: { acquiredOn, saleSignedOn: null, settledOn: null },
});
const property = (n: number) => ({ id: `prop_${n}`, city: "Caracas", zone: "Zona", kind: "apartment", areaM2: 80 });

function setup(ui: React.ReactElement, fail = false) {
  const container = {
    clock: fixedClock("2026-11-22" as IsoDate),
    projects: {
      projectRepository: { list: () => (fail ? Promise.reject(new Error("x")) : Promise.resolve([project(2, "on_sale", "2026-03-01"), project(5, "renovation", "2026-10-01"), project(7, "due_diligence", null)])) },
      propertyRepository: { list: () => Promise.resolve([property(2), property(5), property(7)]) },
    },
  } as unknown as Container;
  return render(<Providers container={container}>{ui}</Providers>);
}

describe("backoffice de projects", () => {
  it("el panel muestra las ruedas y la tabla", async () => {
    setup(<AdminDashboard />);
    expect(await screen.findByTestId("admin-fila-M2-002")).toBeTruthy();
    expect(screen.getByTestId("admin-ruedas")).toBeTruthy();
  });

  it("muestra error con reintento", async () => {
    setup(<AdminDashboard />, true);
    expect(await screen.findByTestId("admin-panel-error")).toBeTruthy();
  });

  it("el kanban reparte due diligence y comprado", async () => {
    setup(<AcquisitionsBoard />);
    expect(await screen.findByTestId("oportunidad-M2-007")).toBeTruthy();
    expect(screen.getByTestId("oportunidad-M2-005")).toBeTruthy();
  });

  it("la obra muestra presupuesto y avisa si no existe", async () => {
    setup(<ProjectWorksScreen idOrSlug="m2-005-zona" />);
    expect(await screen.findByTestId("obra-presupuesto")).toBeTruthy();
    cleanup();
    setup(<ProjectWorksScreen idOrSlug="no-existe" />);
    expect(await screen.findByTestId("admin-obra-no-encontrado")).toBeTruthy();
  });

  it("comercialización lista los inmuebles en venta", async () => {
    setup(<CommercializationScreen />);
    expect(await screen.findByTestId("admin-com-fila-M2-002")).toBeTruthy();
  });
});
