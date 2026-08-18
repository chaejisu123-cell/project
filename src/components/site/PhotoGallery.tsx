"use client";

import { useMemo, useState } from "react";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate } from "@/lib/utils/format";
import { groupPhotosByDate } from "@/lib/utils/photos";
import type { Photo } from "@/lib/supabase/database.types";

export function PhotoGallery({ photos }: { photos: Photo[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const groups = useMemo(() => groupPhotosByDate(photos), [photos]);
  const indexById = useMemo(() => {
    const map = new Map<string, number>();
    photos.forEach((photo, index) => map.set(photo.id, index));
    return map;
  }, [photos]);

  if (photos.length === 0) {
    return <EmptyState text="아직 등록된 사진이 없습니다." />;
  }

  const active = openIndex !== null ? photos[openIndex] : null;

  function showPrev() {
    setOpenIndex((current) =>
      current === null ? null : (current - 1 + photos.length) % photos.length,
    );
  }

  function showNext() {
    setOpenIndex((current) =>
      current === null ? null : (current + 1) % photos.length,
    );
  }

  return (
    <>
      <div className="flex flex-col gap-8">
        {groups.map((group) => (
          <div key={group.key} className="flex flex-col gap-3">
            <h3 className="flex items-baseline gap-2 text-sm font-semibold text-ink">
              {group.label}
              <span className="text-xs font-normal text-ink-muted">
                {group.photos.length}장
              </span>
            </h3>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {group.photos.map((photo) => (
                <button
                  key={photo.id}
                  type="button"
                  onClick={() => setOpenIndex(indexById.get(photo.id) ?? 0)}
                  className="group aspect-square overflow-hidden rounded-lg border border-border bg-surface"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.image_url}
                    alt={photo.process_tag ?? "현장 사진"}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {active && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setOpenIndex(null)}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-ink/90 px-4 py-8"
        >
          <button
            type="button"
            onClick={() => setOpenIndex(null)}
            className="absolute right-4 top-4 text-sm font-medium text-white/80 hover:text-white"
          >
            닫기 ✕
          </button>

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={active.image_url}
            alt={active.process_tag ?? "현장 사진"}
            onClick={(event) => event.stopPropagation()}
            className="max-h-[75vh] max-w-full rounded-lg object-contain"
          />

          <div
            onClick={(event) => event.stopPropagation()}
            className="flex items-center gap-4 text-sm text-white/80"
          >
            {photos.length > 1 && (
              <button type="button" onClick={showPrev} className="hover:text-white">
                ← 이전
              </button>
            )}
            <span>
              {active.process_tag && <span className="mr-2">{active.process_tag}</span>}
              {formatDate(active.taken_at)}
            </span>
            {photos.length > 1 && (
              <button type="button" onClick={showNext} className="hover:text-white">
                다음 →
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
