import { createClient } from "@/lib/supabase/server";
import { getProjectOrNotFound } from "@/lib/admin-project";
import { PhotoUploadForm } from "@/components/admin/PhotoUploadForm";
import { PhotoManageGrid } from "@/components/admin/PhotoManageGrid";

export default async function ProjectPhotosPage(
  props: PageProps<"/admin/projects/[id]/photos">,
) {
  const { id } = await props.params;
  const project = await getProjectOrNotFound(id);

  const supabase = await createClient();
  const { data: photos } = await supabase
    .from("photos")
    .select("*")
    .eq("project_id", id)
    .order("taken_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-col gap-6">
      <PhotoUploadForm projectId={project.id} />
      <PhotoManageGrid photos={photos ?? []} projectId={project.id} />
    </div>
  );
}
