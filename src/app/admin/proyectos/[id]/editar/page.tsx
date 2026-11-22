import { ProjectSheetEditRoute } from "@/modules/finance/backoffice-ui";
import { routeMetadata } from "@/shared/ui/app-shell";

export const metadata = routeMetadata("b9");

export default function AdminEditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  return <ProjectSheetEditRoute params={params} />;
}
