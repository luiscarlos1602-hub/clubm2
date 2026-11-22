import { OpportunityFigures } from "@/modules/finance/backoffice-ui";
import { AdminOpportunityRoute } from "@/modules/projects/backoffice-ui";
import { routeMetadata } from "@/shared/ui/app-shell";

export const metadata = routeMetadata("b2");

export default function AdminOpportunityPage({ params }: { params: Promise<{ id: string }> }) {
  return <AdminOpportunityRoute params={params} FiguresView={OpportunityFigures} />;
}
