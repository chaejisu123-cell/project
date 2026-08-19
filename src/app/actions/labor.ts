"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/dal";
import { createClient } from "@/lib/supabase/server";
import type { LaborRecord } from "@/lib/supabase/database.types";

const LaborCellSchema = z.object({
  work_date: z.string().trim().min(1, "날짜를 선택해주세요."),
  process_name: z.string().trim().min(1, "공정명을 입력해주세요."),
  worker_count: z.coerce.number().min(0, "0 이상의 값을 입력해주세요."),
});

export type LaborCellInput = {
  work_date: string;
  process_name: string;
  worker_count: number | string;
};

export type LaborCellResult = { record: LaborRecord | null } | { error: string };

/**
 * 공수관리 표의 셀 하나(날짜 x 공정)를 저장한다. 별도의 공정 목록 테이블이 없기
 * 때문에, 0 이하로 지우면 행 자체를 삭제해서 "빈 칸"으로 되돌린다 — 이 방식이
 * 곧 공정/날짜 삭제의 기반이 된다(모든 셀이 비면 해당 열/행도 화면에서 사라짐).
 */
export async function saveLaborCell(
  projectId: string,
  input: LaborCellInput,
): Promise<LaborCellResult> {
  await requireUser();

  const parsed = LaborCellSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "입력값을 확인해주세요." };
  }

  const supabase = await createClient();
  const { work_date, process_name, worker_count } = parsed.data;

  if (worker_count <= 0) {
    await supabase
      .from("labor_records")
      .delete()
      .eq("project_id", projectId)
      .eq("work_date", work_date)
      .eq("process_name", process_name);

    revalidatePath(`/admin/projects/${projectId}/labor`);
    return { record: null };
  }

  const { data, error } = await supabase
    .from("labor_records")
    .upsert(
      { project_id: projectId, work_date, process_name, worker_count },
      { onConflict: "project_id,work_date,process_name" },
    )
    .select()
    .single();

  if (error || !data) {
    return { error: `저장에 실패했습니다: ${error?.message ?? ""}` };
  }

  revalidatePath(`/admin/projects/${projectId}/labor`);
  return { record: data };
}

/** 공정 열 삭제 — 해당 공정의 모든 날짜 기록을 한 번에 지운다. */
export async function deleteLaborProcess(projectId: string, processName: string) {
  await requireUser();
  const supabase = await createClient();

  await supabase
    .from("labor_records")
    .delete()
    .eq("project_id", projectId)
    .eq("process_name", processName);

  revalidatePath(`/admin/projects/${projectId}/labor`);
}
