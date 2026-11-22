// @vitest-environment jsdom
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { ProjectGallery } from "./ProjectGallery";
import { ProjectImage, projectImageSrc } from "./ProjectImage";
import { PROCESS_STAGES, PROCESS_STAGE_LABEL, ProcessBoard, type ProcessStageView } from "./ProcessBoard";

describe("ProjectImage", () => {
  it("arma la ruta en minúsculas y rotula la referencia", () => {
    expect(projectImageSrc("M2-001", "antes")).toBe("/images/proyectos/m2-001/antes.svg");
    render(<ProjectImage code="M2-003" variant="despues" alt="x" />);
    expect(screen.getByTestId("project-image-referencia").textContent).toBe("Imagen de referencia");
  });
});

describe("ProjectGallery", () => {
  it("cambia de pestaña, marca la proyección y navega con flechas", () => {
    render(<ProjectGallery code="M2-006" name="Apto" />);
    expect(screen.getByTestId("project-gallery").getAttribute("data-active")).toBe("despues");
    expect(screen.queryByTestId("project-gallery-nota-proyeccion")).toBeNull();
    fireEvent.click(screen.getByTestId("project-gallery-tab-proyeccion"));
    expect(screen.getByTestId("project-gallery-nota-proyeccion").textContent).toContain("Proyección · no garantizada");
    fireEvent.keyDown(screen.getByTestId("project-gallery-tab-proyeccion"), { key: "ArrowRight" });
    expect(screen.getByTestId("project-gallery").getAttribute("data-active")).toBe("antes");
  });
});

describe("ProcessBoard", () => {
  const stages: ProcessStageView[] = PROCESS_STAGES.map((id, i) => ({
    id,
    status: i < 2 ? "done" : i === 2 ? "current" : "upcoming",
    date: "2026-12-01",
    estimated: i >= 2,
  }));
  it("pinta 6 etapas y rotula como proyección solo las estimadas", () => {
    render(<ProcessBoard stages={stages} />);
    expect(screen.getAllByRole("listitem")).toHaveLength(6);
    expect(screen.getByText(PROCESS_STAGE_LABEL["obra-80"])).toBeTruthy();
    expect(screen.getAllByTestId("projection-label")).toHaveLength(4);
    expect(screen.getByTestId("process-board-etapa-obra-80").getAttribute("aria-current")).toBe("step");
  });
});

afterEach(cleanup);
