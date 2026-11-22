import { ResetDemoDataButton } from "@/composition/ResetDemoDataButton";
import { ZoneShell } from "@/shared/ui/app-shell";

export default function InvestorLayout({ children }: { children: React.ReactNode }) {
  return <ZoneShell zone="investor" demoTools={<ResetDemoDataButton />}>{children}</ZoneShell>;
}
