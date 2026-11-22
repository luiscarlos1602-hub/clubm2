"use client";

import { useCallback, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useContainer } from "./providers";

export function useResetDemoData(): { reset(): Promise<void>; readonly isResetting: boolean } {
  const container = useContainer();
  const queryClient = useQueryClient();
  const [isResetting, setIsResetting] = useState(false);

  const reset = useCallback(async () => {
    setIsResetting(true);
    try {
      container.demo.reset();
      await queryClient.invalidateQueries();
    } finally {
      setIsResetting(false);
    }
  }, [container, queryClient]);

  return { reset, isResetting };
}
