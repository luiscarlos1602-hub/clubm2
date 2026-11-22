import { Suspense } from "react";
import { notFound } from "next/navigation";
import { PUBLISHED_PROJECT_SLUGS, ProjectDetail, ProjectDetailLoading, isPublishedProjectSlug } from "@/modules/finance/ui";
import { routeMetadata } from "@/shared/ui/app-shell";

export const metadata = routeMetadata("p4");

export function generateStaticParams() {
  return PUBLISHED_PROJECT_SLUGS.map((slug) => ({ slug }));
}

async function ProjectContent({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!isPublishedProjectSlug(slug)) notFound();
  return <ProjectDetail slug={slug} />;
}

export default function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense fallback={<ProjectDetailLoading />}>
      <ProjectContent params={params} />
    </Suspense>
  );
}
