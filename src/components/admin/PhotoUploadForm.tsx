"use client";

import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { createPhotos } from "@/app/actions/photos";
import { compressImage } from "@/lib/utils/image";
import { PHOTOS_BUCKET, PROCESS_TAGS } from "@/lib/constants";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

function today() {
  return new Date().toISOString().slice(0, 10);
}

export function PhotoUploadForm({ projectId }: { projectId: string }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [files, setFiles] = useState<File[]>([]);
  const [takenAt, setTakenAt] = useState(today());
  const [processTag, setProcessTag] = useState<string>(PROCESS_TAGS[0]);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  function handleCancel() {
    setFiles([]);
    setTakenAt(today());
    setProcessTag(PROCESS_TAGS[0]);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (files.length === 0) {
      setError("업로드할 사진을 선택해주세요.");
      return;
    }

    setUploading(true);
    setError(null);

    const supabase = createClient();
    const uploaded: {
      image_url: string;
      taken_at: string | null;
      process_tag: string | null;
    }[] = [];

    try {
      for (let i = 0; i < files.length; i += 1) {
        setStatus(`${i + 1}/${files.length}장 업로드 중...`);
        const compressed = await compressImage(files[i]);
        const path = `${projectId}/${crypto.randomUUID()}.jpg`;

        const { error: uploadError } = await supabase.storage
          .from(PHOTOS_BUCKET)
          .upload(path, compressed, { contentType: "image/jpeg" });

        if (uploadError) {
          throw new Error(uploadError.message);
        }

        const { data } = supabase.storage.from(PHOTOS_BUCKET).getPublicUrl(path);
        uploaded.push({
          image_url: data.publicUrl,
          taken_at: takenAt || null,
          process_tag: processTag || null,
        });
      }

      setStatus("저장 중...");
      const result = await createPhotos(projectId, uploaded);

      if ("error" in result) {
        setError(result.error);
        return;
      }

      setFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "업로드 중 문제가 발생했습니다.",
      );
    } finally {
      setUploading(false);
      setStatus(null);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-5 rounded-lg border border-border bg-canvas p-6"
    >
      <Field
        label="사진 선택"
        htmlFor="photo-files"
        hint="여러 장을 한 번에 선택할 수 있습니다. 업로드 시 자동으로 축소·압축됩니다."
      >
        <input
          id="photo-files"
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(event) => setFiles(Array.from(event.target.files ?? []))}
          className="block w-full text-sm text-ink file:mr-4 file:rounded-md file:border-0 file:bg-accent-soft file:px-4 file:py-2 file:text-sm file:font-medium file:text-accent-hover"
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="촬영일" htmlFor="taken_at">
          <Input
            id="taken_at"
            type="date"
            value={takenAt}
            onChange={(event) => setTakenAt(event.target.value)}
          />
        </Field>
        <Field label="공정 태그" htmlFor="process_tag">
          <Select
            id="process_tag"
            value={processTag}
            onChange={(event) => setProcessTag(event.target.value)}
          >
            {PROCESS_TAGS.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      {files.length > 0 && (
        <p className="text-sm text-ink-muted">{files.length}장 선택됨</p>
      )}

      {error && <p className="text-sm text-danger">{error}</p>}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={uploading}>
          {uploading ? (status ?? "업로드 중...") : "업로드"}
        </Button>
        {files.length > 0 && (
          <Button type="button" variant="ghost" disabled={uploading} onClick={handleCancel}>
            취소
          </Button>
        )}
      </div>
    </form>
  );
}
