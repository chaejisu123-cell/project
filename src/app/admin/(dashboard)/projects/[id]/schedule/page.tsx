import { createClient } from "@/lib/supabase/server";
import { getProjectOrNotFound } from "@/lib/admin-project";
import { ScheduleEditor } from "@/components/admin/ScheduleEditor";

export default async function ProjectSchedulePage(
  props: PageProps<"/admin/projects/[id]/schedule">,
) {
  const { id } = await props.params;
  const project = await getProjectOrNotFound(id);

  const supabase = await createClient();
  const { data: items } = await supabase
    .from("schedule_items")
    .select("*")
    .eq("project_id", id)
    .order("sort_order", { ascending: true });

  return <ScheduleEditor projectId={project.id} initialItems={items ?? []} />;
}
