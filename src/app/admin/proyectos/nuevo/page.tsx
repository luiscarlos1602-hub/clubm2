import { ProjectSheetNewScreen } from "@/modules/finance/backoffice-ui";
import { routeMetadata } from "@/shared/ui/app-shell";

export const metadata = routeMetadata("b8");

export default function AdminNewProjectPage() {
  return <ProjectSheetNewScreen />;
}
