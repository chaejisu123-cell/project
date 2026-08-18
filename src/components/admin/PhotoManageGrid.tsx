import { deletePhoto } from "@/app/actions/photos";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDateHeading } from "@/lib/utils/format";
import type { Photo } from "@/lib/supabase/database.types";

interface PhotoGroup {
  key: string;
  label: string;
  photos: Photo[];
}

function groupPhotosByDate(photos: Photo[]): PhotoGroup[] {
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

  const groups = groupPhotosByDate(photos);

  return (
    <div className="flex flex-col gap-8">
      {groups.map((group) => (
        <div key={group.key} className="flex flex-col gap-3">
          <h3 className="flex items-baseline gap-2 text-sm font-semibold text-ink">
            {group.label}
            <span className="text-xs font-normal text-ink-muted">
              {group.photos.length}장
            </span>
          </h3>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {group.photos.map((photo) => {
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
                    {photo.process_tag ?? "-"}
                  </p>
                  <form action={boundDelete}>
                    <DeleteButton className="w-full" />
                  </form>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
