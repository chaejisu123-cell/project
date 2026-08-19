"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/dal";
import { createClient } from "@/lib/supabase/server";
import type { ScheduleItem } from "@/lib/supabase/database.types";

const ScheduleItemSchema = z.object({
  process_name: z.string().trim().min(1, "공정명을 입력해주세요."),
  start_date: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? value : null)),
  end_date: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? value : null)),
  status: z.enum(["예정", "진행중", "완료"]),
});

export type ScheduleItemInput = {
  process_name: string;
  start_date: string;
  end_date: string;
  status: "예정" | "진행중" | "완료";
};

export type ScheduleItemResult = { item: ScheduleItem } | { error: string };

export async function createScheduleItem(
  projectId: string,
  input: ScheduleItemInput,
): Promise<ScheduleItemResult> {
  await requireUser();

  const parsed = ScheduleItemSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "입력값을 확인해주세요." };
  }

  const supabase = await createClient();

  const { data: last } = await supabase
    .from("schedule_items")
    .select("sort_order")
    .eq("project_id", projectId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextSortOrder = (last?.sort_order ?? -1) + 1;

  const { data, error } = await supabase
    .from("schedule_items")
    .insert({ project_id: projectId, ...parsed.data, sort_order: nextSortOrder })
    .select()
    .single();

  if (error || !data) {
    return { error: `공정 추가에 실패했습니다: ${error?.message ?? ""}` };
  }

  revalidatePath(`/admin/projects/${projectId}`);
  return { item: data };
}

export async function updateScheduleItem(
  id: string,
  projectId: string,
  input: ScheduleItemInput,
): Promise<ScheduleItemResult> {
  await requireUser();

  const parsed = ScheduleItemSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "입력값을 확인해주세요." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("schedule_items")
    .update(parsed.data)
    .eq("id", id)
    .select()
    .single();

  if (error || !data) {
    return { error: `저장에 실패했습니다: ${error?.message ?? ""}` };
  }

  revalidatePath(`/admin/projects/${projectId}`);
  return { item: data };
}

export async function deleteScheduleItem(id: string, projectId: string) {
  await requireUser();
  const supabase = await createClient();
  await supabase.from("schedule_items").delete().eq("id", id);
  revalidatePath(`/admin/projects/${projectId}`);
}

/** 드래그로 순서를 바꾼 뒤, 배열 순서 그대로 sort_order(0..n-1)를 다시 매긴다. */
export async function reorderScheduleItems(
  projectId: string,
  orderedIds: string[],
) {
  await requireUser();
  const supabase = await createClient();

  await Promise.all(
    orderedIds.map((id, index) =>
      supabase.from("schedule_items").update({ sort_order: index }).eq("id", id),
    ),
  );

  revalidatePath(`/admin/projects/${projectId}`);
}
