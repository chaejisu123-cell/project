"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/dal";
import { createClient } from "@/lib/supabase/server";

const NoticeSchema = z.object({
  title: z.string().trim().min(1, "제목을 입력해주세요."),
  content: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? value : null)),
  is_pinned: z.preprocess((value) => value === "on", z.boolean()),
});

export type NoticeFormState =
  | {
      errors?: Partial<Record<string, string[]>>;
      message?: string;
      ok?: boolean;
    }
  | undefined;

export async function createNotice(
  projectId: string,
  _prevState: NoticeFormState,
  formData: FormData,
): Promise<NoticeFormState> {
  await requireUser();

  const parsed = NoticeSchema.safeParse({
    title: formData.get("title"),
    content: formData.get("content"),
    is_pinned: formData.get("is_pinned"),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("notices")
    .insert({ project_id: projectId, ...parsed.data });

  if (error) {
    return { message: `공지 등록에 실패했습니다: ${error.message}` };
  }

  revalidatePath(`/admin/projects/${projectId}/notices`);
  return { ok: true };
}

export async function deleteNotice(id: string, projectId: string) {
  await requireUser();
  const supabase = await createClient();
  await supabase.from("notices").delete().eq("id", id);
  revalidatePath(`/admin/projects/${projectId}/notices`);
}
