import { createClient } from "@/lib/supabase/server";
import { getProjectOrNotFound } from "@/lib/admin-project";
import { MaterialForm } from "@/components/admin/MaterialForm";
import { MaterialManageList } from "@/components/admin/MaterialManageList";

export default async function ProjectMaterialsPage(
  props: PageProps<"/admin/projects/[id]/materials">,
) {
  const { id } = await props.params;
  const project = await getProjectOrNotFound(id);

  const supabase = await createClient();
  const { data: records } = await supabase
    .from("material_records")
    .select("*")
    .eq("project_id", id)
    .order("material_name", { ascending: true })
    .order("record_date", { ascending: true });

  return (
    <div className="flex flex-col gap-6">
      <MaterialForm projectId={project.id} />
      <MaterialManageList records={records ?? []} projectId={project.id} />
    </div>
  );
}
