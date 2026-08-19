"use client";

import { useMemo, useState } from "react";
import { deleteLaborProcess, saveLaborCell } from "@/app/actions/labor";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { DEFAULT_LABOR_PROCESSES } from "@/lib/constants";
import { formatDateHeading, formatNumber } from "@/lib/utils/format";
import type { LaborRecord, WorkerType } from "@/lib/supabase/database.types";

const WORKER_TYPES: WorkerType[] = ["기공", "조공"];

function today() {
  return new Date().toISOString().slice(0, 10);
}

/** "YYYY-MM-DD" 문자열을 UTC 기준으로 계산해서 하루 밀리는 문제 없이 날짜를 옮긴다. */
function shiftDate(date: string, days: number): string {
  const [y, m, d] = date.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + days);
  return dt.toISOString().slice(0, 10);
}

function cellKey(date: string, process: string, workerType: WorkerType) {
  return `${date}|${process}|${workerType}`;
}

export function LaborSheet({
  projectId,
  initialRecords,
}: {
  projectId: string;
  initialRecords: LaborRecord[];
}) {
  const [records, setRecords] = useState(initialRecords);
  const [selectedDate, setSelectedDate] = useState(today());
  const [newProcessName, setNewProcessName] = useState("");
  const [error, setError] = useState<string | null>(null);

  // 공정 목록: 이미 저장된 기록이 있으면 거기서(가장 먼저 등장한 순서로) 가져오고,
  // 완전히 새 현장이면 기본 공종 11개로 시작한다. 별도의 공정 목록 테이블은 없다.
  const [processNames, setProcessNames] = useState<string[]>(() => {
    const seen = new Set<string>();
    const ordered: string[] = [];
    for (const record of [...initialRecords].sort((a, b) =>
      a.created_at.localeCompare(b.created_at),
    )) {
      if (!seen.has(record.process_name)) {
        seen.add(record.process_name);
        ordered.push(record.process_name);
      }
    }
    return ordered.length > 0 ? ordered : [...DEFAULT_LABOR_PROCESSES];
  });

  const recordMap = useMemo(() => {
    const map = new Map<string, LaborRecord>();
    for (const record of records) {
      map.set(cellKey(record.work_date, record.process_name, record.worker_type), record);
    }
    return map;
  }, [records]);

  // 누계: 프로젝트 전체 기간 중 선택한 날짜까지, 그 공정에 투입된 인원 누적 합.
  // 기공/조공을 합치지 않고 각각 따로 누적한다.
  const cumulativeByProcessType = useMemo(() => {
    const map = new Map<string, number>();
    for (const process of processNames) {
      for (const workerType of WORKER_TYPES) {
        let sum = 0;
        for (const record of records) {
          if (
            record.process_name === process &&
            record.worker_type === workerType &&
            record.work_date <= selectedDate
          ) {
            sum += record.worker_count;
          }
        }
        map.set(`${process}|${workerType}`, sum);
      }
    }
    return map;
  }, [processNames, records, selectedDate]);

  async function handleCellBlur(process: string, workerType: WorkerType, rawValue: string) {
    setError(null);
    const result = await saveLaborCell(projectId, {
      work_date: selectedDate,
      process_name: process,
      worker_type: workerType,
      worker_count: rawValue === "" ? 0 : rawValue,
    });

    if ("error" in result) {
      setError(result.error);
      return;
    }

    setRecords((current) => {
      const targetKey = cellKey(selectedDate, process, workerType);
      const without = current.filter(
        (record) =>
          cellKey(record.work_date, record.process_name, record.worker_type) !== targetKey,
      );
      return result.record ? [...without, result.record] : without;
    });
  }

  function handleAddProcess() {
    const name = newProcessName.trim();
    if (!name || processNames.includes(name)) {
      setNewProcessName("");
      return;
    }
    setProcessNames((current) => [...current, name]);
    setNewProcessName("");
  }

  async function handleDeleteProcess(process: string) {
    setProcessNames((current) => current.filter((name) => name !== process));
    setRecords((current) => current.filter((record) => record.process_name !== process));
    await deleteLaborProcess(projectId, process);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => setSelectedDate((date) => shiftDate(date, -1))}
            aria-label="전날"
          >
            ◀
          </Button>
          <div className="flex flex-col items-center">
            <span className="text-sm font-medium text-ink">
              {formatDateHeading(selectedDate)}
            </span>
            <input
              type="date"
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
              className="h-7 rounded border border-border bg-canvas px-1 text-xs text-ink-muted"
            />
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => setSelectedDate((date) => shiftDate(date, 1))}
            aria-label="다음날"
          >
            ▶
          </Button>
          {selectedDate !== today() && (
            <Button type="button" variant="ghost" size="sm" onClick={() => setSelectedDate(today())}>
              오늘로
            </Button>
          )}
        </div>

        <div className="flex items-end gap-2">
          <Input
            value={newProcessName}
            onChange={(event) => setNewProcessName(event.target.value)}
            placeholder="공정명"
            className="w-36"
          />
          <Button type="button" variant="secondary" size="sm" onClick={handleAddProcess}>
            + 공정 추가
          </Button>
        </div>
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      {processNames.length === 0 ? (
        <EmptyState text="공정을 추가하면 표가 시작됩니다." />
      ) : (
        <Card className="overflow-x-auto p-4">
          <table className="w-full table-fixed border-collapse text-sm">
            <colgroup>
              <col className="w-[30%]" />
              <col className="w-[17.5%]" />
              <col className="w-[17.5%]" />
              <col className="w-[17.5%]" />
              <col className="w-[17.5%]" />
            </colgroup>
            <thead>
              <tr className="border-b border-border text-xs text-ink-muted">
                <th className="pb-2 pr-2 text-left font-medium">공종</th>
                <th className="pb-2 px-1 text-right font-medium">기공</th>
                <th className="pb-2 px-1 text-right font-medium">조공</th>
                <th className="pb-2 px-1 text-right font-medium">기공누계</th>
                <th className="pb-2 px-1 text-right font-medium">조공누계</th>
              </tr>
            </thead>
            <tbody>
              {processNames.map((process) => {
                const gigongRecord = recordMap.get(cellKey(selectedDate, process, "기공"));
                const jogongRecord = recordMap.get(cellKey(selectedDate, process, "조공"));
                const gigongCumulative = cumulativeByProcessType.get(`${process}|기공`) ?? 0;
                const jogongCumulative = cumulativeByProcessType.get(`${process}|조공`) ?? 0;

                return (
                  <tr key={process} className="border-b border-border last:border-0">
                    <td className="py-1.5 pr-2">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate text-ink">{process}</span>
                        <button
                          type="button"
                          onClick={() => handleDeleteProcess(process)}
                          aria-label={`${process} 공정 삭제`}
                          className="shrink-0 text-ink-muted hover:text-danger"
                        >
                          ×
                        </button>
                      </div>
                    </td>
                    <td className="px-1 py-1.5">
                      <input
                        key={`${selectedDate}-${process}-기공`}
                        type="number"
                        step={0.5}
                        min={0}
                        defaultValue={gigongRecord?.worker_count ?? ""}
                        onBlur={(event) => handleCellBlur(process, "기공", event.target.value)}
                        className="h-8 w-full rounded border border-border bg-canvas px-2 text-right text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
                      />
                    </td>
                    <td className="px-1 py-1.5">
                      <input
                        key={`${selectedDate}-${process}-조공`}
                        type="number"
                        step={0.5}
                        min={0}
                        defaultValue={jogongRecord?.worker_count ?? ""}
                        onBlur={(event) => handleCellBlur(process, "조공", event.target.value)}
                        className="h-8 w-full rounded border border-border bg-canvas px-2 text-right text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
                      />
                    </td>
                    <td className="px-1 py-1.5 text-right text-ink-muted">
                      {formatNumber(gigongCumulative)}
                    </td>
                    <td className="px-1 py-1.5 text-right text-ink-muted">
                      {formatNumber(jogongCumulative)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
