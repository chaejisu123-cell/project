import type { ReactNode } from "react";
import { getProjectOrNotFound } from "@/lib/admin-project";
import { ProjectTabs } from "@/components/admin/ProjectTabs";

export default async function ProjectLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await getProjectOrNotFound(id);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-ink">{project.name}</h1>
        {project.address && (
          <p className="text-sm text-ink-muted">{project.address}</p>
        )}
      </div>
      <ProjectTabs projectId={project.id} />
      {children}
    </div>
  );
}
