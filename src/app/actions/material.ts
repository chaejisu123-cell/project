"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/dal";
import { createClient } from "@/lib/supabase/server";
import type { MaterialRecord } from "@/lib/supabase/database.types";

const MaterialRecordSchema = z.object({
  material_name: z.string().trim().min(1, "자재명을 입력해주세요."),
  unit: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? value : null)),
  record_date: z.string().trim().min(1, "날짜를 선택해주세요."),
  quantity: z.coerce.number().positive("수량을 입력해주세요."),
  type: z.enum(["사용", "발주"]),
  memo: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? value : null)),
});

export type MaterialRecordInput = {
  material_name: string;
  unit: string;
  record_date: string;
  quantity: number | string;
  type: "사용" | "발주";
  memo: string;
};

export type MaterialRecordResult =
  | { record: MaterialRecord }
  | { error: string };

export async function createMaterialRecord(
  projectId: string,
  input: MaterialRecordInput,
): Promise<MaterialRecordResult> {
  await requireUser();

  const parsed = MaterialRecordSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "입력값을 확인해주세요." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("material_records")
    .insert({ project_id: projectId, ...parsed.data })
    .select()
    .single();

  if (error || !data) {
    return { error: `자재 기록 등록에 실패했습니다: ${error?.message ?? ""}` };
  }

  revalidatePath(`/admin/projects/${projectId}/materials`);
  return { record: data };
}

export async function updateMaterialRecord(
  id: string,
  projectId: string,
  input: MaterialRecordInput,
): Promise<MaterialRecordResult> {
  await requireUser();

  const parsed = MaterialRecordSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "입력값을 확인해주세요." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("material_records")
    .update(parsed.data)
    .eq("id", id)
    .select()
    .single();

  if (error || !data) {
    return { error: `저장에 실패했습니다: ${error?.message ?? ""}` };
  }

  revalidatePath(`/admin/projects/${projectId}/materials`);
  return { record: data };
}

export async function deleteMaterialRecord(id: string, projectId: string) {
  await requireUser();
  const supabase = await createClient();
  await supabase.from("material_records").delete().eq("id", id);
  revalidatePath(`/admin/projects/${projectId}/materials`);
}

/** 자재 카드 전체 삭제 — 같은 자재명의 모든 기록(사용+발주)을 한 번에 지운다. */
export async function deleteMaterialGroup(
  projectId: string,
  materialName: string,
) {
  await requireUser();
  const supabase = await createClient();

  await supabase
    .from("material_records")
    .delete()
    .eq("project_id", projectId)
    .eq("material_name", materialName);

  revalidatePath(`/admin/projects/${projectId}/materials`);
}
