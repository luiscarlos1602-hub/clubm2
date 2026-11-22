// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
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

type StageResult = { ok: true; value: unknown } | { ok: false; error: { code: string } };

function setup(ui: React.ReactElement, fail = false, stage: StageResult = { ok: true, value: {} }) {
  const rows = [project(2, "on_sale", "2026-03-01"), project(5, "renovation", "2026-10-01"), project(7, "due_diligence", null)];
  // Como el repositorio real: un cambio guardado se ve en la siguiente lectura.
  const changeProjectStage = vi.fn((id: string, to: string) => {
    if (stage.ok) {
      const i = rows.findIndex((r) => r.id === id);
      if (i >= 0) rows[i] = { ...rows[i], status: to, timeline: { ...rows[i].timeline, acquiredOn: rows[i].timeline.acquiredOn ?? (to === "acquired" ? "2026-11-22" : null) } };
    }
    return Promise.resolve(stage);
  });
  const container = {
    clock: fixedClock("2026-11-22" as IsoDate),
    projects: {
      changeProjectStage,
      projectRepository: { list: () => (fail ? Promise.reject(new Error("x")) : Promise.resolve([...rows])) },
      propertyRepository: { list: () => Promise.resolve([property(2), property(5), property(7)]) },
    },
  } as unknown as Container;
  return { changeProjectStage, ...render(<Providers container={container}>{ui}</Providers>) };
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

  it("el kanban usa las etapas reales y enlaza cada oportunidad a su detalle", async () => {
    setup(<AcquisitionsBoard />);
    const link = await screen.findByTestId("oportunidad-ver-M2-007");
    expect(link.getAttribute("href")).toBe("/admin/adquisiciones/m2-007-zona");
    expect(screen.getByTestId("columna-due-diligence").textContent).toContain("Proyecto 7");
    expect(screen.getByTestId("columna-comprado").textContent).toContain("Proyecto 5");
    expect(screen.getByTestId("columna-oportunidad").textContent).toContain("Sin oportunidades");
    expect(screen.getByTestId("adq-nueva-oportunidad").getAttribute("href")).toBe("/admin/proyectos/nuevo");
    expect(screen.queryByTestId("columna-oferta")).toBeNull();
  });

  it("el detalle de due diligence muestra inmueble, guía y decisión real; registrar la compra llama al caso de uso", async () => {
    const { changeProjectStage } = setup(<OpportunityDetailScreen id="m2-007-zona" />);
    expect(await screen.findByTestId("adq-detalle-inmueble")).toBeTruthy();
    expect(screen.getByTestId("adq-detalle-checklist").querySelectorAll("li")).toHaveLength(7);
    fireEvent.click(screen.getByTestId("adq-detalle-decision-acquired"));
    await waitFor(() => expect(changeProjectStage).toHaveBeenCalledWith("prj_7", "acquired"));
    // La relectura desmonta los botones: queda la insignia nueva, el enlace a la obra, el anuncio y el foco en el título.
    expect(await screen.findByTestId("adq-detalle-abrir-proyecto")).toBeTruthy();
    expect(screen.queryByTestId("adq-detalle-decision")).toBeNull();
    expect(screen.getByTestId("admin-adq-detalle-cabecera").textContent).toContain("Comprado");
    expect(screen.getByTestId("adq-detalle-anuncio").textContent).toBe("Etapa actualizada: Comprado.");
    expect(document.activeElement?.id).toBe("adq-decision-h");
  });

  it("descartar pide confirmación antes de guardar", async () => {
    const { changeProjectStage } = setup(<OpportunityDetailScreen id="M2-007" />);
    fireEvent.click(await screen.findByTestId("adq-detalle-decision-discarded"));
    expect(changeProjectStage).not.toHaveBeenCalled();
    fireEvent.click(screen.getByTestId("adq-detalle-decision-confirmar-descarte"));
    await waitFor(() => expect(changeProjectStage).toHaveBeenCalledWith("prj_7", "discarded"));
  });

  it("el detalle avisa si no existe y un proyecto comprado enlaza a su obra", async () => {
    setup(<OpportunityDetailScreen id="xx" />);
    expect(await screen.findByTestId("adq-detalle-no-encontrado")).toBeTruthy();
    cleanup();
    setup(<OpportunityDetailScreen id="m2-005-zona" />);
    expect((await screen.findByTestId("adq-detalle-abrir-proyecto")).getAttribute("href")).toBe("/admin/proyectos/m2-005-zona");
    expect(screen.queryByTestId("adq-detalle-decision")).toBeNull();
  });

  it("la obra ofrece el siguiente paso de etapa; en venta remite a Comercialización", async () => {
    const { changeProjectStage } = setup(<ProjectWorksScreen idOrSlug="m2-005-zona" />);
    fireEvent.click(await screen.findByTestId("obra-etapa-on_sale"));
    await waitFor(() => expect(changeProjectStage).toHaveBeenCalledWith("prj_5", "on_sale"));
    cleanup();
    setup(<ProjectWorksScreen idOrSlug="m2-002-zona" />);
    expect((await screen.findByTestId("obra-etapa")).textContent).toContain("Comercialización");
    expect(screen.queryByTestId("obra-etapa-sold")).toBeNull();
  });

  it("publicar sin la ficha completa explica lo que falta y enlaza a la ficha", async () => {
    setup(<OpportunityDetailScreen id="m2-007-zona" />, false, { ok: false, error: { code: "NOT_READY_TO_PUBLISH" } });
    fireEvent.click(await screen.findByTestId("adq-detalle-decision-acquired"));
    expect((await screen.findByTestId("adq-detalle-decision-completar")).getAttribute("href")).toContain("m2-007-zona");
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
