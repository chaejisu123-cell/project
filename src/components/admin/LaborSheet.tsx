"use client";

import { Fragment, useMemo, useState } from "react";
import { deleteLaborProcess, saveLaborCell } from "@/app/actions/labor";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate, formatNumber } from "@/lib/utils/format";
import type { LaborRecord } from "@/lib/supabase/database.types";

function today() {
  return new Date().toISOString().slice(0, 10);
}

function cellKey(date: string, process: string) {
  return `${date}|${process}`;
}

export function LaborSheet({
  projectId,
  initialRecords,
}: {
  projectId: string;
  initialRecords: LaborRecord[];
}) {
  const [records, setRecords] = useState(initialRecords);
  const [pendingProcesses, setPendingProcesses] = useState<string[]>([]);
  const [pendingDates, setPendingDates] = useState<string[]>([]);
  const [newProcessName, setNewProcessName] = useState("");
  const [newDate, setNewDate] = useState(today());
  const [error, setError] = useState<string | null>(null);

  const recordMap = useMemo(() => {
    const map = new Map<string, LaborRecord>();
    for (const record of records) {
      map.set(cellKey(record.work_date, record.process_name), record);
    }
    return map;
  }, [records]);

  const processes = useMemo(() => {
    const set = new Set<string>(records.map((record) => record.process_name));
    for (const name of pendingProcesses) set.add(name);
    return [...set].sort((a, b) => a.localeCompare(b, "ko"));
  }, [records, pendingProcesses]);

  const dates = useMemo(() => {
    const set = new Set<string>(records.map((record) => record.work_date));
    for (const date of pendingDates) set.add(date);
    return [...set].sort();
  }, [records, pendingDates]);

  const cumulative = useMemo(() => {
    const map = new Map<string, number>();
    for (const process of processes) {
      let running = 0;
      for (const date of dates) {
        running += recordMap.get(cellKey(date, process))?.worker_count ?? 0;
        map.set(cellKey(date, process), running);
      }
    }
    return map;
  }, [processes, dates, recordMap]);

  const rowTotals = useMemo(() => {
    const map = new Map<string, number>();
    for (const date of dates) {
      let sum = 0;
      for (const process of processes) {
        sum += recordMap.get(cellKey(date, process))?.worker_count ?? 0;
      }
      map.set(date, sum);
    }
    return map;
  }, [dates, processes, recordMap]);

  const lastDate = dates[dates.length - 1] ?? "";
  const columnTotals = useMemo(() => {
    const map = new Map<string, number>();
    for (const process of processes) {
      map.set(process, cumulative.get(cellKey(lastDate, process)) ?? 0);
    }
    return map;
  }, [processes, cumulative, lastDate]);

  const grandTotal = useMemo(
    () => [...columnTotals.values()].reduce((sum, value) => sum + value, 0),
    [columnTotals],
  );

  async function handleCellBlur(date: string, process: string, rawValue: string) {
    setError(null);
    const result = await saveLaborCell(projectId, {
      work_date: date,
      process_name: process,
      worker_count: rawValue === "" ? 0 : rawValue,
    });

    if ("error" in result) {
      setError(result.error);
      return;
    }

    setRecords((current) => {
      const withoutCell = current.filter(
        (record) =>
          cellKey(record.work_date, record.process_name) !== cellKey(date, process),
      );
      return result.record ? [...withoutCell, result.record] : withoutCell;
    });
  }

  function handleAddProcess() {
    const name = newProcessName.trim();
    if (!name) return;
    if (!processes.includes(name)) {
      setPendingProcesses((current) => [...current, name]);
    }
    setNewProcessName("");
  }

  function handleAddDate() {
    if (!newDate || dates.includes(newDate)) return;
    setPendingDates((current) => [...current, newDate]);
  }

  async function handleDeleteProcess(process: string) {
    setRecords((current) => current.filter((record) => record.process_name !== process));
    setPendingProcesses((current) => current.filter((name) => name !== process));
    await deleteLaborProcess(projectId, process);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex items-end gap-2">
          <Input
            value={newProcessName}
            onChange={(event) => setNewProcessName(event.target.value)}
            placeholder="공정명"
            className="w-40"
          />
          <Button type="button" variant="secondary" size="sm" onClick={handleAddProcess}>
            + 공정 추가
          </Button>
        </div>
        <div className="flex items-end gap-2">
          <Input
            type="date"
            value={newDate}
            onChange={(event) => setNewDate(event.target.value)}
            className="w-40"
          />
          <Button type="button" variant="secondary" size="sm" onClick={handleAddDate}>
            + 날짜 추가
          </Button>
        </div>
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      {processes.length === 0 || dates.length === 0 ? (
        <EmptyState text="공정과 날짜를 추가하면 표가 시작됩니다." />
      ) : (
        <Card className="overflow-x-auto p-4">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-ink-muted">
                <th rowSpan={2} className="pb-2 pr-3 align-bottom font-medium">
                  날짜
                </th>
                {processes.map((process) => (
                  <th
                    key={process}
                    colSpan={2}
                    className="px-2 pb-2 text-center font-medium"
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span className="text-ink">{process}</span>
                      <button
                        type="button"
                        onClick={() => handleDeleteProcess(process)}
                        aria-label={`${process} 공정 삭제`}
                        className="text-ink-muted hover:text-danger"
                      >
                        ×
                      </button>
                    </div>
                  </th>
                ))}
                <th rowSpan={2} className="pb-2 pl-3 text-right align-bottom font-medium">
                  합계
                </th>
              </tr>
              <tr className="border-b border-border text-xs text-ink-muted">
                {processes.map((process) => (
                  <Fragment key={process}>
                    <th className="px-2 pb-2 text-right font-normal">인원</th>
                    <th className="px-2 pb-2 text-right font-normal">누계</th>
                  </Fragment>
                ))}
              </tr>
            </thead>
            <tbody>
              {dates.map((date) => (
                <tr key={date} className="border-b border-border last:border-0">
                  <td className="py-1.5 pr-3 text-ink">{formatDate(date)}</td>
                  {processes.map((process) => {
                    const record = recordMap.get(cellKey(date, process));
                    const cumulativeValue = cumulative.get(cellKey(date, process)) ?? 0;
                    return (
                      <Fragment key={process}>
                        <td className="px-2 py-1.5">
                          <input
                            type="number"
                            step={0.5}
                            min={0}
                            defaultValue={record?.worker_count ?? ""}
                            onBlur={(event) =>
                              handleCellBlur(date, process, event.target.value)
                            }
                            className="h-8 w-16 rounded border border-border bg-canvas px-2 text-right text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
                          />
                        </td>
                        <td className="px-2 py-1.5 text-right text-ink-muted">
                          {formatNumber(cumulativeValue)}
                        </td>
                      </Fragment>
                    );
                  })}
                  <td className="py-1.5 pl-3 text-right font-medium text-ink">
                    {formatNumber(rowTotals.get(date) ?? 0)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-border font-medium">
                <td className="pt-2 pr-3 text-ink">합계</td>
                {processes.map((process) => (
                  <td key={process} colSpan={2} className="px-2 pt-2 text-right text-ink">
                    {formatNumber(columnTotals.get(process) ?? 0)}
                  </td>
                ))}
                <td className="pl-3 pt-2 text-right text-ink">{formatNumber(grandTotal)}</td>
              </tr>
            </tfoot>
          </table>
        </Card>
      )}
    </div>
  );
}
