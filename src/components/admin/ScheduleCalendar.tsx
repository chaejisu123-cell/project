"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { getMonthGrid, toDateKey } from "@/lib/utils/calendar";
import { formatDateHeading } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import type { ScheduleItem, ScheduleStatus } from "@/lib/supabase/database.types";

const WEEKDAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

const BAR_STYLE: Record<ScheduleStatus, string> = {
  완료: "bg-success text-white",
  진행중: "bg-accent text-white",
  예정: "bg-surface text-ink-muted border border-border",
};

const STATUS_TEXT: Record<ScheduleStatus, string> = {
  완료: "text-success",
  진행중: "text-accent",
  예정: "text-ink-muted",
};

const LEGEND: { status: ScheduleStatus; swatch: string }[] = [
  { status: "완료", swatch: "bg-success" },
  { status: "진행중", swatch: "bg-accent" },
  { status: "예정", swatch: "bg-surface border border-border" },
];

interface ItemRange {
  item: ScheduleItem;
  start: string;
  end: string;
}

function toRanges(items: ScheduleItem[]): ItemRange[] {
  return items.flatMap((item) => {
    const start = item.start_date ?? item.end_date;
    const end = item.end_date ?? item.start_date;
    if (!start || !end) return [];
    return [{ item, start, end }];
  });
}

/** 이번 주 안에서 막대가 차지할 요일 인덱스(0~6) 범위를 구한다. */
function weekBarSpan(weekKeys: string[], range: ItemRange) {
  const startIdx = weekKeys.findIndex((key) => key >= range.start);
  if (startIdx === -1) return null;

  let endIdx = -1;
  for (let i = weekKeys.length - 1; i >= 0; i -= 1) {
    if (weekKeys[i] <= range.end) {
      endIdx = i;
      break;
    }
  }
  if (endIdx === -1 || endIdx < startIdx) return null;

  return { startIdx, endIdx };
}

export function ScheduleCalendar({ items }: { items: ScheduleItem[] }) {
  const today = useMemo(() => new Date(), []);
  const [cursor, setCursor] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const ranges = useMemo(() => toRanges(items), [items]);
  const weeks = useMemo(
    () => getMonthGrid(cursor.getFullYear(), cursor.getMonth()),
    [cursor],
  );

  const todayKey = toDateKey(today);
  const monthLabel = `${cursor.getFullYear()}년 ${cursor.getMonth() + 1}월`;

  function goToMonth(diff: number) {
    setCursor((current) => new Date(current.getFullYear(), current.getMonth() + diff, 1));
  }

  const selectedItems = selectedDate
    ? ranges.filter((range) => range.start <= selectedDate && selectedDate <= range.end)
    : [];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-base font-semibold text-ink">{monthLabel}</h3>
        <div className="flex items-center gap-2">
          <Button type="button" size="sm" variant="secondary" onClick={() => goToMonth(-1)}>
            ← 이전달
          </Button>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => setCursor(new Date(today.getFullYear(), today.getMonth(), 1))}
          >
            이번달
          </Button>
          <Button type="button" size="sm" variant="secondary" onClick={() => goToMonth(1)}>
            다음달 →
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs text-ink-muted">
        {LEGEND.map((entry) => (
          <span key={entry.status} className="flex items-center gap-1.5">
            <span className={cn("h-2.5 w-2.5 rounded-full", entry.swatch)} />
            {entry.status}
          </span>
        ))}
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <div className="min-w-[640px]">
          <div className="grid grid-cols-7 border-b border-border bg-surface py-2 text-center text-xs font-medium text-ink-muted">
            {WEEKDAY_LABELS.map((label) => (
              <div key={label}>{label}</div>
            ))}
          </div>

          <div className="flex flex-col divide-y divide-border">
            {weeks.map((week) => {
              const weekKeys = week.map(toDateKey);
              const weekStart = weekKeys[0];
              const weekEnd = weekKeys[6];
              const weekRanges = ranges
                .filter((range) => range.start <= weekEnd && range.end >= weekStart)
                .sort((a, b) => a.start.localeCompare(b.start));

              return (
                <div key={weekStart} className="flex flex-col gap-1 px-2 py-2">
                  <div className="grid grid-cols-7 gap-1">
                    {week.map((day, dayIndex) => {
                      const dateKey = weekKeys[dayIndex];
                      const inMonth = day.getMonth() === cursor.getMonth();
                      const isToday = dateKey === todayKey;
                      const isSelected = dateKey === selectedDate;

                      return (
                        <button
                          key={dateKey}
                          type="button"
                          onClick={() =>
                            setSelectedDate(dateKey === selectedDate ? null : dateKey)
                          }
                          className={cn(
                            "flex h-8 items-center justify-center rounded-md text-sm transition-colors",
                            inMonth ? "text-ink" : "text-ink-muted/50",
                            isSelected
                              ? "bg-accent text-white"
                              : isToday
                                ? "font-semibold text-accent hover:bg-surface"
                                : "hover:bg-surface",
                          )}
                        >
                          {day.getDate()}
                        </button>
                      );
                    })}
                  </div>

                  {weekRanges.length > 0 && (
                    <div
                      className="grid grid-cols-7 gap-1"
                      style={{ gridAutoRows: "20px" }}
                    >
                      {weekRanges.map((range) => {
                        const span = weekBarSpan(weekKeys, range);
                        if (!span) return null;
                        const { startIdx, endIdx } = span;
                        const roundedStart = weekKeys[startIdx] === range.start;
                        const roundedEnd = weekKeys[endIdx] === range.end;

                        return (
                          <div
                            key={range.item.id}
                            title={`${range.item.process_name} (${range.item.status})`}
                            style={{ gridColumn: `${startIdx + 1} / ${endIdx + 2}` }}
                            className={cn(
                              "flex items-center truncate px-2 text-[11px] font-medium",
                              roundedStart ? "rounded-l-full" : "rounded-l-none",
                              roundedEnd ? "rounded-r-full" : "rounded-r-none",
                              BAR_STYLE[range.item.status],
                            )}
                          >
                            {roundedStart ? range.item.process_name : ""}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-lg border border-border bg-canvas p-4">
        <h4 className="text-sm font-semibold text-ink">
          {selectedDate
            ? `${formatDateHeading(selectedDate)} 공정`
            : "날짜를 클릭하면 그날의 공정이 표시됩니다."}
        </h4>

        {selectedDate && selectedItems.length === 0 && (
          <EmptyState text="이 날짜에 해당하는 공정이 없습니다." />
        )}

        {selectedItems.length > 0 && (
          <ul className="flex flex-col gap-2">
            {selectedItems.map(({ item }) => (
              <li
                key={item.id}
                className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm"
              >
                <span className="font-medium text-ink">{item.process_name}</span>
                <span className={cn("text-xs font-medium", STATUS_TEXT[item.status])}>
                  {item.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
