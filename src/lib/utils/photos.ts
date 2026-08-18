import { formatDateHeading } from "@/lib/utils/format";
import type { Photo } from "@/lib/supabase/database.types";

export interface PhotoGroup {
  key: string;
  label: string;
  photos: Photo[];
}

/**
 * 촬영일(taken_at) 기준으로 사진을 날짜별로 묶는다. 관리자 사진 관리 화면과
 * 고객 페이지 갤러리가 공통으로 쓴다. 입력 배열의 정렬 순서를 그대로 유지한다.
 */
export function groupPhotosByDate(photos: Photo[]): PhotoGroup[] {
  const groups = new Map<string, PhotoGroup>();

  for (const photo of photos) {
    const key = photo.taken_at ?? "__unknown__";
    if (!groups.has(key)) {
      groups.set(key, {
        key,
        label: photo.taken_at ? formatDateHeading(photo.taken_at) : "촬영일 미상",
        photos: [],
      });
    }
    groups.get(key)!.photos.push(photo);
  }

  return Array.from(groups.values());
}
