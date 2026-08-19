"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/dal";
import { createClient } from "@/lib/supabase/server";
import type { BudgetItem } from "@/lib/supabase/database.types";

const BudgetItemSchema = z.object({
  category: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? value : null)),
  item_name: z.string().trim().min(1, "항목명을 입력해주세요."),
  planned_amount: z.coerce
    .number()
    .min(0, "0 이상의 금액을 입력해주세요."),
});

export type BudgetItemInput = {
  category: string;
  item_name: string;
  planned_amount: number | string;
};

export type BudgetItemResult = { item: BudgetItem } | { error: string };

export async function createBudgetItem(
  projectId: string,
  input: BudgetItemInput,
): Promise<BudgetItemResult> {
  await requireUser();

  const parsed = BudgetItemSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "입력값을 확인해주세요." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("budget_items")
    .insert({ project_id: projectId, ...parsed.data })
    .select()
    .single();

  if (error || !data) {
    return { error: `예산 항목 추가에 실패했습니다: ${error?.message ?? ""}` };
  }

  revalidatePath(`/admin/projects/${projectId}/settlement`);
  return { item: data };
}

export async function updateBudgetItem(
  id: string,
  projectId: string,
  input: BudgetItemInput,
): Promise<BudgetItemResult> {
  await requireUser();

  const parsed = BudgetItemSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "입력값을 확인해주세요." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("budget_items")
    .update(parsed.data)
    .eq("id", id)
    .select()
    .single();

  if (error || !data) {
    return { error: `저장에 실패했습니다: ${error?.message ?? ""}` };
  }

  revalidatePath(`/admin/projects/${projectId}/settlement`);
  return { item: data };
}

/** budget_item 삭제 시 참조하던 expense_items.budget_item_id는 스키마의
 * on delete set null 규칙에 따라 자동으로 미지정 처리된다. */
export async function deleteBudgetItem(id: string, projectId: string) {
  await requireUser();
  const supabase = await createClient();
  await supabase.from("budget_items").delete().eq("id", id);
  revalidatePath(`/admin/projects/${projectId}/settlement`);
}
