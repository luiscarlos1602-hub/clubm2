// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient } from "@tanstack/react-query";
import { DEMO_RESET_COPY } from "@/shared/ui/brand/demo-copy";
import type { Container } from "./container";
import { Providers } from "./providers";
import { ResetDemoDataButton } from "./ResetDemoDataButton";

afterEach(cleanup);

function setup() {
  const reset = vi.fn();
  const invalidate = vi.spyOn(QueryClient.prototype, "invalidateQueries").mockResolvedValue();
  const container = { demo: { reset } } as unknown as Container;
  render(
    <Providers container={container}>
      <ResetDemoDataButton />
    </Providers>,
  );
  return { reset, invalidate };
}

describe("ResetDemoDataButton", () => {
  afterEach(() => vi.restoreAllMocks());

  it("paso 1 → paso 2 → confirmar reinicia una vez e invalida consultas", async () => {
    const { reset, invalidate } = setup();
    fireEvent.click(screen.getByTestId("demo-reset-button"));
    expect(screen.getByText(DEMO_RESET_COPY.warning)).toBeTruthy();
    fireEvent.click(screen.getByTestId("demo-reset-confirm"));
    await waitFor(() => expect(screen.getByTestId("demo-reset-done").textContent).toBe(DEMO_RESET_COPY.done));
    expect(reset).toHaveBeenCalledTimes(1);
    expect(invalidate).toHaveBeenCalledTimes(1);
  });

  it("cancelar no reinicia y vuelve al paso 1", () => {
    const { reset } = setup();
    fireEvent.click(screen.getByTestId("demo-reset-button"));
    fireEvent.click(screen.getByTestId("demo-reset-cancel"));
    expect(reset).not.toHaveBeenCalled();
    expect(screen.getByTestId("demo-reset-button").textContent).toBe(DEMO_RESET_COPY.action);
  });
});
