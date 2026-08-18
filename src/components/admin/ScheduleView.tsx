"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ScheduleEditor } from "@/components/admin/ScheduleEditor";
import { ScheduleCalendar } from "@/components/admin/ScheduleCalendar";
import { cn } from "@/lib/utils/cn";
import type { ScheduleItem } from "@/lib/supabase/database.types";

type View = "list" | "calendar";

export function ScheduleView({
  projectId,
  initialItems,
}: {
  projectId: string;
  initialItems: ScheduleItem[];
}) {
  const router = useRouter();
  const [view, setView] = useState<View>("list");

  // 탭을 바꿀 때마다 서버에서 최신 목록을 다시 받아와서, 목록 화면에서 편집한 내용이
  // 달력 화면(또는 그 반대)에도 곧바로 반영되게 한다.
  function handleSwitch(next: View) {
    setView(next);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="inline-flex w-fit rounded-md border border-border p-1">
        <button
          type="button"
          onClick={() => handleSwitch("list")}
          className={cn(
            "rounded px-3 py-1.5 text-sm font-medium transition-colors",
            view === "list" ? "bg-accent text-white" : "text-ink-muted hover:text-ink",
          )}
        >
          목록
        </button>
        <button
          type="button"
          onClick={() => handleSwitch("calendar")}
          className={cn(
            "rounded px-3 py-1.5 text-sm font-medium transition-colors",
            view === "calendar" ? "bg-accent text-white" : "text-ink-muted hover:text-ink",
          )}
        >
          달력
        </button>
      </div>

      {view === "list" ? (
        <ScheduleEditor projectId={projectId} initialItems={initialItems} />
      ) : (
        <ScheduleCalendar items={initialItems} />
      )}
    </div>
  );
}
