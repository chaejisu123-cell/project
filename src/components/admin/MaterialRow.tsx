"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteMaterialRecord, updateMaterialRecord } from "@/app/actions/material";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { formatNumber } from "@/lib/utils/format";
import type {
  MaterialRecord,
  MaterialRecordType,
} from "@/lib/supabase/database.types";

/** 자재관리 표의 한 행 — 필드마다 onBlur/onChange에서 바로 저장한다("셀 클릭 → 바로 수정"). */
export function MaterialRow({
  record,
  projectId,
  cumulative,
}: {
  record: MaterialRecord;
  projectId: string;
  cumulative: number;
}) {
  const router = useRouter();
  const [recordDate, setRecordDate] = useState(record.record_date);
  const [type, setType] = useState<MaterialRecordType>(record.type);
  const [quantity, setQuantity] = useState(String(record.quantity));
  const [unit, setUnit] = useState(record.unit ?? "");
  const [memo, setMemo] = useState(record.memo ?? "");
  const [error, setError] = useState<string | null>(null);

  async function persist(
    overrides: Partial<{
      record_date: string;
      type: MaterialRecordType;
      quantity: string;
      unit: string;
      memo: string;
    }> = {},
  ) {
    const result = await updateMaterialRecord(record.id, projectId, {
      material_name: record.material_name,
      unit: overrides.unit ?? unit,
      record_date: overrides.record_date ?? recordDate,
      quantity: overrides.quantity ?? quantity,
      type: overrides.type ?? type,
      memo: overrides.memo ?? memo,
    });

    if ("error" in result) {
      setError(result.error);
      return;
    }

    setError(null);
    router.refresh();
  }

  const boundDelete = deleteMaterialRecord.bind(null, record.id, projectId);

  return (
    <>
      <tr className="border-b border-border last:border-0 align-top">
        <td className="py-1.5 pr-2">
          <input
            type="date"
            value={recordDate}
            onChange={(event) => {
              setRecordDate(event.target.value);
              void persist({ record_date: event.target.value });
            }}
            className="h-8 rounded border border-border bg-canvas px-1 text-xs text-ink"
          />
        </td>
        <td className="py-1.5 pr-2">
          <select
            value={type}
            onChange={(event) => {
              const next = event.target.value as MaterialRecordType;
              setType(next);
              void persist({ type: next });
            }}
            className="h-8 rounded border border-border bg-canvas px-1 text-xs text-ink"
          >
            <option value="사용">사용</option>
            <option value="발주">발주</option>
          </select>
        </td>
        <td className="py-1.5 pr-2">
          <div className="flex items-center gap-1">
            <input
              type="number"
              min={0}
              step={0.01}
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
              onBlur={() => void persist()}
              className="h-8 w-20 rounded border border-border bg-canvas px-2 text-right text-xs text-ink"
            />
            <input
              value={unit}
              onChange={(event) => setUnit(event.target.value)}
              onBlur={() => void persist()}
              placeholder="단위"
              className="h-8 w-14 rounded border border-border bg-canvas px-1 text-xs text-ink"
            />
          </div>
        </td>
        <td className="py-1.5 pr-2 text-right text-ink-muted">
          {formatNumber(cumulative)}
          {unit}
        </td>
        <td className="py-1.5 pr-2">
          <input
            value={memo}
            onChange={(event) => setMemo(event.target.value)}
            onBlur={() => void persist()}
            placeholder="메모"
            className="h-8 w-full rounded border border-border bg-canvas px-2 text-xs text-ink"
          />
        </td>
        <td className="py-1.5">
          <form action={boundDelete}>
            <DeleteButton />
          </form>
        </td>
      </tr>
      {error && (
        <tr>
          <td colSpan={6} className="pb-2 text-xs text-danger">
            {error}
          </td>
        </tr>
      )}
    </>
  );
}
