"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/dal";
import { createClient } from "@/lib/supabase/server";
import { generateSiteToken } from "@/lib/utils/token";

const optionalText = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value ? value : null));

const ProjectSchema = z.object({
  name: z.string().trim().min(1, "현장 이름을 입력해주세요."),
  address: optionalText,
  customer_name: optionalText,
  budget_total: z.preprocess(
    (value) => (value === "" || value == null ? 0 : value),
    z.coerce.number().min(0, "0 이상의 금액을 입력해주세요."),
  ),
  status: z.enum(["진행중", "완료", "보류"]),
});

export type ProjectFormState =
  | {
      errors?: Partial<Record<string, string[]>>;
      message?: string;
    }
  | undefined;

function parseProjectForm(formData: FormData) {
  return ProjectSchema.safeParse({
    name: formData.get("name"),
    address: formData.get("address"),
    customer_name: formData.get("customer_name"),
    budget_total: formData.get("budget_total"),
    status: formData.get("status"),
  });
}

export async function createProject(
  _prevState: ProjectFormState,
  formData: FormData,
): Promise<ProjectFormState> {
  await requireUser();

  const parsed = parseProjectForm(formData);
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .insert({
      ...parsed.data,
      site_token: generateSiteToken(),
    })
    .select("id")
    .single();

  if (error || !data) {
    return { message: `현장 등록에 실패했습니다: ${error?.message ?? ""}` };
  }

  revalidatePath("/admin");
  redirect(`/admin/projects/${data.id}`);
}

export async function updateProject(
  id: string,
  _prevState: ProjectFormState,
  formData: FormData,
): Promise<ProjectFormState> {
  await requireUser();

  const parsed = parseProjectForm(formData);
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("projects")
    .update(parsed.data)
    .eq("id", id);

  if (error) {
    return { message: `현장 수정에 실패했습니다: ${error.message}` };
  }

  revalidatePath("/admin");
  revalidatePath(`/admin/projects/${id}`);
  redirect(`/admin/projects/${id}`);
}
