"use client";

import { createContext, useContext, useState, type ReactElement, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createContainer, type Container } from "./container";

const ContainerContext = createContext<Container | null>(null);

export type ProvidersProps = {
  readonly children: ReactNode;
  /** Solo para pruebas: container ya construido. */
  readonly container?: Container;
};

export function Providers({ children, container }: ProvidersProps): ReactElement {
  const [value] = useState<Container>(() => container ?? createContainer());
  const [queryClient] = useState(() => new QueryClient());
  return (
    <ContainerContext.Provider value={value}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </ContainerContext.Provider>
  );
}

export function useContainer(): Container {
  const value = useContext(ContainerContext);
  if (value === null) throw new Error("useContainer requiere <Providers> en el árbol.");
  return value;
}
