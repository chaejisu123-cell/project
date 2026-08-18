import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate } from "@/lib/utils/format";
import type { Notice } from "@/lib/supabase/database.types";

export function NoticeList({ notices }: { notices: Notice[] }) {
  if (notices.length === 0) {
    return <EmptyState text="아직 등록된 공지사항이 없습니다." />;
  }

  return (
    <ul className="flex flex-col gap-3">
      {notices.map((notice) => (
        <li
          key={notice.id}
          className="rounded-lg border border-border bg-canvas p-4"
        >
          <div className="flex items-center gap-2">
            {notice.is_pinned && (
              <span className="rounded-full bg-accent-soft px-2 py-0.5 text-xs font-medium text-accent-hover">
                고정
              </span>
            )}
            <h3 className="font-medium text-ink">{notice.title}</h3>
          </div>
          {notice.content && (
            <p className="mt-2 whitespace-pre-line text-sm text-ink-muted">
              {notice.content}
            </p>
          )}
          <p className="mt-3 text-xs text-ink-muted">
            {formatDate(notice.created_at)}
          </p>
        </li>
      ))}
    </ul>
  );
}
