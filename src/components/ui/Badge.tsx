import { cn } from "@/lib/utils/cn";
import type { ProjectStatus } from "@/lib/supabase/database.types";

const STATUS_STYLE: Record<ProjectStatus, string> = {
  진행중: "bg-accent-soft text-accent-hover",
  완료: "bg-success-soft text-success",
  보류: "bg-surface text-ink-muted",
};

export function StatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        STATUS_STYLE[status],
      )}
    >
      {status}
    </span>
  );
}
