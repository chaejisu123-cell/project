"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/dal";
import { createClient } from "@/lib/supabase/server";
import { storagePathFromPublicUrl } from "@/lib/utils/storage";
import { RECEIPTS_BUCKET } from "@/lib/constants";
import type { ExpenseItem } from "@/lib/supabase/database.types";

const ExpenseItemSchema = z.object({
  budget_item_id: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? value : null)),
  vendor_name: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? value : null)),
  amount: z.coerce.number().positive("지출 금액을 입력해주세요."),
  expense_date: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? value : null)),
  receipt_image_url: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? value : null)),
  memo: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? value : null)),
});

export type ExpenseItemInput = {
  budget_item_id: string;
  vendor_name: string;
  amount: number | string;
  expense_date: string;
  receipt_image_url: string;
  memo: string;
};

export type ExpenseItemResult = { item: ExpenseItem } | { error: string };

/**
 * 영수증 이미지 업로드 자체는 브라우저에서 Supabase Storage로 직접 이루어진다
 * (photos.ts와 동일한 이유 — 서버리스 함수 용량 제한 회피). 이 액션은 업로드가
 * 끝난 뒤(또는 영수증 없이) 지출 1건을 expense_items 테이블에 기록하는 역할만 한다.
 */
export async function createExpense(
  projectId: string,
  input: ExpenseItemInput,
): Promise<ExpenseItemResult> {
  await requireUser();

  const parsed = ExpenseItemSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "입력값을 확인해주세요." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("expense_items")
    .insert({ project_id: projectId, ...parsed.data })
    .select()
    .single();

  if (error || !data) {
    return { error: `지출 등록에 실패했습니다: ${error?.message ?? ""}` };
  }

  revalidatePath(`/admin/projects/${projectId}/settlement`);
  return { item: data };
}

export async function deleteExpense(id: string, projectId: string) {
  await requireUser();
  const supabase = await createClient();

  const { data: expense } = await supabase
    .from("expense_items")
    .select("receipt_image_url")
    .eq("id", id)
    .maybeSingle();

  if (expense?.receipt_image_url) {
    const path = storagePathFromPublicUrl(expense.receipt_image_url, RECEIPTS_BUCKET);
    if (path) {
      await supabase.storage.from(RECEIPTS_BUCKET).remove([path]);
    }
  }

  await supabase.from("expense_items").delete().eq("id", id);
  revalidatePath(`/admin/projects/${projectId}/settlement`);
}
