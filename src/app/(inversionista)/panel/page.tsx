import { PanelScreen } from "@/modules/investors/ui";
import { routeMetadata } from "@/shared/ui/app-shell";

export const metadata = routeMetadata("panel");

export default function PanelPage() {
  return <PanelScreen />;
}
