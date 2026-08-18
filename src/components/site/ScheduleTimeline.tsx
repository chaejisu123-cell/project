import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/utils/cn";
import { formatDate } from "@/lib/utils/format";
import type { ScheduleItem, ScheduleStatus } from "@/lib/supabase/database.types";

const MARKER_STYLE: Record<ScheduleStatus, string> = {
  완료: "bg-success border-success",
  진행중: "bg-accent border-accent",
  예정: "bg-canvas border-border",
};

const LABEL_STYLE: Record<ScheduleStatus, string> = {
  완료: "text-success",
  진행중: "text-accent",
  예정: "text-ink-muted",
};

function dateRangeLabel(item: ScheduleItem): string | null {
  if (!item.start_date && !item.end_date) return null;
  if (item.start_date && item.end_date) {
    return `${formatDate(item.start_date)} - ${formatDate(item.end_date)}`;
  }
  return formatDate(item.start_date ?? item.end_date);
}

export function ScheduleTimeline({ items }: { items: ScheduleItem[] }) {
  if (items.length === 0) {
    return <EmptyState text="아직 등록된 공정이 없습니다." />;
  }

  return (
    <ol className="flex flex-col">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const range = dateRangeLabel(item);

        return (
          <li key={item.id} className="relative flex gap-4 pb-8 last:pb-0">
            {!isLast && (
              <span
                aria-hidden
                className="absolute left-[7px] top-5 h-full w-px bg-border"
              />
            )}
            <span
              aria-hidden
              className={cn(
                "relative z-10 mt-1 h-4 w-4 shrink-0 rounded-full border-2",
                MARKER_STYLE[item.status],
              )}
            />
            <div className="flex flex-1 flex-col gap-1 pt-0.5">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-medium text-ink">{item.process_name}</h3>
                <span
                  className={cn("text-xs font-medium", LABEL_STYLE[item.status])}
                >
                  {item.status}
                </span>
              </div>
              {range && <p className="text-sm text-ink-muted">{range}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
