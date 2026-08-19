/** 공개 Storage URL에서 삭제(remove)에 필요한 버킷 내부 경로만 뽑아낸다. */
export function storagePathFromPublicUrl(
  url: string,
  bucket: string,
): string | null {
  const prefix = `/storage/v1/object/public/${bucket}/`;
  const index = url.indexOf(prefix);
  if (index === -1) return null;
  return url.slice(index + prefix.length);
}
