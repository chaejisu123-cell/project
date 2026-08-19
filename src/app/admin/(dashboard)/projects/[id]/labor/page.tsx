import { createClient } from "@/lib/supabase/server";
import { getProjectOrNotFound } from "@/lib/admin-project";
import { LaborSheet } from "@/components/admin/LaborSheet";

export default async function ProjectLaborPage(
  props: PageProps<"/admin/projects/[id]/labor">,
) {
  const { id } = await props.params;
  const project = await getProjectOrNotFound(id);

  const supabase = await createClient();
  const { data: records } = await supabase
    .from("labor_records")
    .select("*")
    .eq("project_id", id)
    .order("work_date", { ascending: true })
    .order("process_name", { ascending: true });

  return <LaborSheet projectId={project.id} initialRecords={records ?? []} />;
}
