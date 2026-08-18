export interface CompressImageOptions {
  maxDimension?: number;
  quality?: number;
  mimeType?: string;
}

/**
 * 브라우저 canvas로 이미지를 축소/압축한다 (서버 왕복 없이 업로드 전에 처리).
 * 기본값: 긴 변 1600px, JPEG 품질 0.82 — 웹에서 보기엔 충분하고 용량은 크게 줄어든다.
 */
export async function compressImage(
  file: File,
  {
    maxDimension = 1600,
    quality = 0.82,
    mimeType = "image/jpeg",
  }: CompressImageOptions = {},
): Promise<Blob> {
  const bitmap = await createImageBitmap(file);

  const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    throw new Error("이 브라우저에서는 이미지 압축을 사용할 수 없습니다.");
  }

  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, mimeType, quality),
  );

  if (!blob) {
    throw new Error("이미지 압축에 실패했습니다.");
  }

  return blob;
}
