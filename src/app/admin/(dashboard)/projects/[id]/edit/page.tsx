import { getProjectOrNotFound } from "@/lib/admin-project";
import { updateProject } from "@/app/actions/projects";
import { ProjectForm } from "@/components/admin/ProjectForm";
import { Card } from "@/components/ui/Card";

export default async function EditProjectPage(
  props: PageProps<"/admin/projects/[id]/edit">,
) {
  const { id } = await props.params;
  const project = await getProjectOrNotFound(id);
  const action = updateProject.bind(null, project.id);

  return (
    <Card className="max-w-xl p-6">
      <ProjectForm action={action} project={project} />
    </Card>
  );
}
