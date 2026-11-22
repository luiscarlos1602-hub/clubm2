import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ProjectDetail, ProjectDetailLoading } from "@/modules/finance/ui";
import { isProjectSlug } from "@/modules/projects";
import { routeMetadata } from "@/shared/ui/app-shell";

export const metadata = routeMetadata("p4");

async function ProjectContent({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!isProjectSlug(slug)) notFound();
  return <ProjectDetail slug={slug} />;
}

export default function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense fallback={<ProjectDetailLoading />}>
      <ProjectContent params={params} />
    </Suspense>
  );
}
