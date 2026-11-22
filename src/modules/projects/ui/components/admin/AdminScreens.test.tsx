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
import { OpportunityDetailScreen } from "./OpportunityDetailScreen";
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

  it("el kanban enlaza cada oportunidad a su detalle", async () => {
    setup(<AcquisitionsBoard />);
    const link = await screen.findByTestId("oportunidad-ver-OP-014");
    expect(link.getAttribute("href")).toBe("/admin/adquisiciones/OP-014");
    expect(screen.getByTestId("oportunidad-ver-M2-007").getAttribute("href")).toBe("/admin/adquisiciones/m2-007-zona");
  });

  it("el detalle de oportunidad muestra inmueble, due diligence, cifras y decisión", async () => {
    setup(<OpportunityDetailScreen id="OP-015" />);
    expect(await screen.findByTestId("adq-detalle-inmueble")).toBeTruthy();
    expect(screen.getByTestId("adq-detalle-galeria")).toBeTruthy();
    expect(screen.getByTestId("adq-detalle-progreso").textContent).toContain("1 de 6");
    expect(screen.getByTestId("adq-detalle-cifras")).toBeTruthy();
    expect(screen.getByTestId("adq-detalle-decision")).toBeTruthy();
  });

  it("el detalle resuelve el proyecto en due diligence y avisa si no existe", async () => {
    setup(<OpportunityDetailScreen id="m2-007-zona" />);
    expect((await screen.findByTestId("adq-detalle-progreso")).textContent).toContain("3 de 6");
    cleanup();
    setup(<OpportunityDetailScreen id="xx" />);
    expect(await screen.findByTestId("adq-detalle-no-encontrado")).toBeTruthy();
  });

  it("el proyecto muestra galería, colocación, gráfica de presupuesto, proceso e inversionistas", async () => {
    const Stub = ({ code, acquiredOn }: { code: string; acquiredOn: string; "data-testid"?: string }) => <ol data-testid="obra-proceso">{code} {acquiredOn}</ol>;
    setup(<ProjectWorksScreen idOrSlug="m2-005-zona" ProcessView={Stub} />);
    expect(await screen.findByTestId("obra-galeria")).toBeTruthy();
    expect(screen.getByTestId("obra-grafica-colocacion")).toBeTruthy();
    expect(screen.getByTestId("obra-grafica-presupuesto")).toBeTruthy();
    expect(screen.getByTestId("obra-proceso")).toBeTruthy();
    expect(screen.getByTestId("obra-inversionistas")).toBeTruthy();
    expect(screen.getByTestId("obra-proceso").textContent).toContain("M2-005");
    expect(screen.queryByTestId("obra-hitos")).toBeNull();
  });
});
