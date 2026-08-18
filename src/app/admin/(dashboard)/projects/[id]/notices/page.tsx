import { createClient } from "@/lib/supabase/server";
import { getProjectOrNotFound } from "@/lib/admin-project";
import { NoticeForm } from "@/components/admin/NoticeForm";
import { NoticeManageList } from "@/components/admin/NoticeManageList";

export default async function ProjectNoticesPage(
  props: PageProps<"/admin/projects/[id]/notices">,
) {
  const { id } = await props.params;
  const project = await getProjectOrNotFound(id);

  const supabase = await createClient();
  const { data: notices } = await supabase
    .from("notices")
    .select("*")
    .eq("project_id", id)
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-col gap-6">
      <NoticeForm projectId={project.id} />
      <NoticeManageList notices={notices ?? []} projectId={project.id} />
    </div>
  );
}
