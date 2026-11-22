import { FinanceScreen } from "@/modules/finance/backoffice-ui";
import { routeMetadata } from "@/shared/ui/app-shell";

export const metadata = routeMetadata("b5");

export default function AdminFinancePage() {
  return <FinanceScreen />;
}
