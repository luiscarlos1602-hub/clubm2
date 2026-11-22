import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ProjectDetailLoading, ProjectParticipate } from "@/modules/finance/ui";
import { isProjectSlug } from "@/modules/projects";
import { routeMetadata } from "@/shared/ui/app-shell";

export const metadata = routeMetadata("p5");

async function ParticipateContent({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!isProjectSlug(slug)) notFound();
  return <ProjectParticipate slug={slug} />;
}

export default function ParticipatePage({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense fallback={<ProjectDetailLoading testId="participar-cargando" />}>
      <ParticipateContent params={params} />
    </Suspense>
  );
}
