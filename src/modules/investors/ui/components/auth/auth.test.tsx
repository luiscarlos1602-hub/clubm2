// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

import { LoginForm } from "./LoginForm";
import { RegisterWizard } from "./RegisterWizard";
import { useDemoRoleStore } from "@/shared/ui/app-shell";

afterEach(() => {
  cleanup();
  push.mockClear();
  useDemoRoleStore.setState({ role: null });
});

describe("LoginForm", () => {
  it("muestra un h1, el aviso de demostración y el acceso del equipo", () => {
    render(<LoginForm />);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByTestId("ingresar-aviso-demo").textContent).toMatch(/no se valida ni guarda/);
    expect(screen.getByTestId("ingresar-equipo").getAttribute("href")).toBe("/admin");
  });

  it("al entrar fija el rol inversionista y va al panel", () => {
    render(<LoginForm />);
    fireEvent.click(screen.getByTestId("ingresar-entrar"));
    expect(useDemoRoleStore.getState().role).toBe("investor");
    expect(push).toHaveBeenCalledWith("/panel");
  });
});

describe("RegisterWizard", () => {
  it("recorre los tres pasos y exige las cuatro casillas de riesgo", () => {
    render(<RegisterWizard />);
    expect(screen.getByTestId("registro-paso-datos")).toBeTruthy();
    fireEvent.click(screen.getByTestId("registro-continuar"));
    expect(screen.getByTestId("registro-paso-experiencia")).toBeTruthy();
    fireEvent.click(screen.getByTestId("registro-continuar"));
    const finish = screen.getByTestId("registro-continuar") as HTMLButtonElement;
    expect(finish.disabled).toBe(true);
    for (const box of screen.getAllByRole("checkbox")) fireEvent.click(box);
    expect(finish.disabled).toBe(false);
    fireEvent.click(finish);
    expect(push).toHaveBeenCalledWith("/panel");
  });
});
