import { SaleRegistration } from "@/modules/finance/backoffice-ui";
import { CommercializationScreen } from "@/modules/projects/backoffice-ui";
import { Section } from "@/shared/ui/layout";
import { routeMetadata } from "@/shared/ui/app-shell";

export const metadata = routeMetadata("b4");

export default function AdminCommercializationPage() {
  return (
    <>
      <CommercializationScreen />
      <Section tone="paper" spacing="md" labelledBy="venta-titulo">
        <SaleRegistration />
      </Section>
    </>
  );
}
