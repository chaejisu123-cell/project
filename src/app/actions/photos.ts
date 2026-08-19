"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/dal";
import { createClient } from "@/lib/supabase/server";
import { storagePathFromPublicUrl } from "@/lib/utils/storage";
import { PHOTOS_BUCKET } from "@/lib/constants";

const PhotoInputSchema = z.object({
  image_url: z.string().url(),
  taken_at: z.string().nullable(),
  process_tag: z.string().nullable(),
});

const CreatePhotosSchema = z.array(PhotoInputSchema).min(1).max(30);

export type PhotoInput = z.infer<typeof PhotoInputSchema>;

export type CreatePhotosResult = { success: true } | { error: string };

/**
 * 파일 업로드 자체는 브라우저에서 Supabase Storage로 직접 이루어진다(용량 제한 회피).
 * 이 액션은 업로드가 끝난 뒤 결과 URL들을 photos 테이블에 기록하는 역할만 한다.
 */
export async function createPhotos(
  projectId: string,
  items: PhotoInput[],
): Promise<CreatePhotosResult> {
  await requireUser();

  const parsed = CreatePhotosSchema.safeParse(items);
  if (!parsed.success) {
    return { error: "업로드할 사진 정보가 올바르지 않습니다." };
  }

  const supabase = await createClient();
  const rows = parsed.data.map((item) => ({ project_id: projectId, ...item }));
  const { error } = await supabase.from("photos").insert(rows);

  if (error) {
    return { error: `사진 저장에 실패했습니다: ${error.message}` };
  }

  revalidatePath(`/admin/projects/${projectId}`);
  return { success: true };
}

export async function deletePhoto(photoId: string, projectId: string) {
  await requireUser();
  const supabase = await createClient();

  const { data: photo } = await supabase
    .from("photos")
    .select("image_url")
    .eq("id", photoId)
    .maybeSingle();

  if (photo) {
    const path = storagePathFromPublicUrl(photo.image_url, PHOTOS_BUCKET);
    if (path) {
      await supabase.storage.from(PHOTOS_BUCKET).remove([path]);
    }
  }

  await supabase.from("photos").delete().eq("id", photoId);
  revalidatePath(`/admin/projects/${projectId}`);
}
