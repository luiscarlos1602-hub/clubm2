// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

vi.mock("next/navigation", () => ({ usePathname: () => "/admin/crm" }));

import { AdminSidebar } from "./AdminSidebar";

afterEach(cleanup);

describe("AdminSidebar", () => {
  it("se pliega a solo iconos y conserva el nombre accesible de cada enlace", () => {
    render(<AdminSidebar />);
    const toggle = screen.getByTestId("admin-sidebar-toggle");
    expect(toggle.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByTestId("nav-link-b6").textContent).toContain("CRM");
    fireEvent.click(toggle);
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
    expect(screen.getByTestId("admin-sidebar").getAttribute("data-collapsed")).toBe("true");
    const link = screen.getByTestId("nav-link-b6");
    expect(link.getAttribute("aria-label")).toBeTruthy();
    expect(link.getAttribute("aria-current")).toBe("page");
  });
});
