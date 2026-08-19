import { createClient } from "@/lib/supabase/server";
import { getProjectOrNotFound } from "@/lib/admin-project";
import { ProjectDetailView } from "@/components/admin/ProjectDetailView";

/**
 * 예전에는 탭(현장정보/사진/공정표/공지사항/정산/공수관리/자재관리)마다 별도 라우트가
 * 있어서 탭을 바꿀 때마다 서버에 새로 데이터를 요청했다. 지금은 이 페이지 하나가
 * 7개 탭에 필요한 데이터를 한 번에 병렬로 조회하고, 실제 탭 전환은 ProjectDetailView
 * (클라이언트 컴포넌트)의 로컬 state로만 이루어져서 네트워크 왕복이 없다.
 */
export default async function ProjectDetailPage(
  props: PageProps<"/admin/projects/[id]">,
) {
  const { id } = await props.params;
  const project = await getProjectOrNotFound(id);

  const supabase = await createClient();
  const [photosRes, scheduleRes, noticesRes, budgetRes, expenseRes, laborRes, materialRes] =
    await Promise.all([
      supabase
        .from("photos")
        .select("*")
        .eq("project_id", id)
        .order("taken_at", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false }),
      supabase
        .from("schedule_items")
        .select("*")
        .eq("project_id", id)
        .order("sort_order", { ascending: true }),
      supabase
        .from("notices")
        .select("*")
        .eq("project_id", id)
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false }),
      supabase
        .from("budget_items")
        .select("*")
        .eq("project_id", id)
        .order("created_at", { ascending: true }),
      supabase
        .from("expense_items")
        .select("*")
        .eq("project_id", id)
        .order("expense_date", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false }),
      supabase
        .from("labor_records")
        .select("*")
        .eq("project_id", id)
        .order("work_date", { ascending: true })
        .order("process_name", { ascending: true }),
      supabase
        .from("material_records")
        .select("*")
        .eq("project_id", id)
        .order("material_name", { ascending: true })
        .order("record_date", { ascending: true }),
    ]);

  return (
    <ProjectDetailView
      project={project}
      photos={photosRes.data ?? []}
      scheduleItems={scheduleRes.data ?? []}
      notices={noticesRes.data ?? []}
      budgetItems={budgetRes.data ?? []}
      expenses={expenseRes.data ?? []}
      laborRecords={laborRes.data ?? []}
      materialRecords={materialRes.data ?? []}
    />
  );
}
