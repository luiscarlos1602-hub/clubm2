import { ResetDemoDataButton } from "@/composition/ResetDemoDataButton";
import type { Metadata } from "next";
import { ZoneShell } from "@/shared/ui/app-shell";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <ZoneShell zone="admin" demoTools={<ResetDemoDataButton />}>{children}</ZoneShell>;
}
