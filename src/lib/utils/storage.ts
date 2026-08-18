import { PHOTOS_BUCKET } from "@/lib/constants";

const PUBLIC_PREFIX = `/storage/v1/object/public/${PHOTOS_BUCKET}/`;

/** 공개 Storage URL에서 삭제(remove)에 필요한 버킷 내부 경로만 뽑아낸다. */
export function storagePathFromPublicUrl(url: string): string | null {
  const index = url.indexOf(PUBLIC_PREFIX);
  if (index === -1) return null;
  return url.slice(index + PUBLIC_PREFIX.length);
}
