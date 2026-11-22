import { ResetDemoDataButton } from "@/composition/ResetDemoDataButton";
import { ZoneShell } from "@/shared/ui/app-shell";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return <ZoneShell zone="public" demoTools={<ResetDemoDataButton />}>{children}</ZoneShell>;
}
