import { deletePhoto } from "@/app/actions/photos";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate } from "@/lib/utils/format";
import type { Photo } from "@/lib/supabase/database.types";

export function PhotoManageGrid({
  photos,
  projectId,
}: {
  photos: Photo[];
  projectId: string;
}) {
  if (photos.length === 0) {
    return <EmptyState text="아직 업로드된 사진이 없습니다." />;
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {photos.map((photo) => {
        const boundDelete = deletePhoto.bind(null, photo.id, projectId);

        return (
          <div
            key={photo.id}
            className="flex flex-col gap-2 rounded-lg border border-border bg-canvas p-2"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.image_url}
              alt={photo.process_tag ?? "현장 사진"}
              className="aspect-square w-full rounded-md object-cover"
            />
            <p className="px-1 text-xs text-ink-muted">
              {photo.process_tag ?? "-"} · {formatDate(photo.taken_at)}
            </p>
            <form action={boundDelete}>
              <DeleteButton className="w-full" />
            </form>
          </div>
        );
      })}
    </div>
  );
}
