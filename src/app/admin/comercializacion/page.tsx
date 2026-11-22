import { CommercializationScreen } from "@/modules/projects/backoffice-ui";
import { routeMetadata } from "@/shared/ui/app-shell";

export const metadata = routeMetadata("b4");

export default function AdminCommercializationPage() {
  return <CommercializationScreen />;
}
