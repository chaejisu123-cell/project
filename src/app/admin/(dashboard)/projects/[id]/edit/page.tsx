import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateProject } from "@/app/actions/projects";
import { ProjectForm } from "@/components/admin/ProjectForm";
import { Card } from "@/components/ui/Card";

export default async function EditProjectPage(
  props: PageProps<"/admin/projects/[id]/edit">,
) {
  const { id } = await props.params;

  const supabase = await createClient();
  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!project) {
    notFound();
  }

  const action = updateProject.bind(null, project.id);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-ink">현장 수정</h1>
        <p className="text-sm text-ink-muted">{project.name}</p>
      </div>
      <Card className="max-w-xl p-6">
        <ProjectForm action={action} project={project} />
      </Card>
    </div>
  );
}
