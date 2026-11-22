import { Suspense } from "react";
import { notFound } from "next/navigation";
import { PUBLISHED_PROJECT_SLUGS, ProjectDetailLoading, ProjectParticipate, isPublishedProjectSlug } from "@/modules/finance/ui";
import { routeMetadata } from "@/shared/ui/app-shell";

export const metadata = routeMetadata("p5");

export function generateStaticParams() {
  return PUBLISHED_PROJECT_SLUGS.map((slug) => ({ slug }));
}

async function ParticipateContent({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!isPublishedProjectSlug(slug)) notFound();
  return <ProjectParticipate slug={slug} />;
}

export default function ParticipatePage({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense fallback={<ProjectDetailLoading testId="participar-cargando" />}>
      <ParticipateContent params={params} />
    </Suspense>
  );
}
