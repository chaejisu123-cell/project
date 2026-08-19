"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteMaterialRecord, updateMaterialRecord } from "@/app/actions/material";
import { Button } from "@/components/ui/Button";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { formatNumber } from "@/lib/utils/format";
import type {
  MaterialRecord,
  MaterialRecordType,
} from "@/lib/supabase/database.types";

type FieldState = {
  record_date: string;
  type: MaterialRecordType;
  quantity: string;
  unit: string;
  memo: string;
};

function toFieldState(record: MaterialRecord): FieldState {
  return {
    record_date: record.record_date,
    type: record.type,
    quantity: String(record.quantity),
    unit: record.unit ?? "",
    memo: record.memo ?? "",
  };
}

/**
 * 자재관리 표의 한 행. 입력값은 "저장"을 누르기 전까지는 서버에 반영되지 않는다
 * (마지막으로 저장된 값을 `saved`에 스냅샷으로 들고 있다가, 현재 입력값과 다르면
 * 행 끝에 저장/취소 버튼이 나타난다).
 */
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
  const [saved, setSaved] = useState<FieldState>(() => toFieldState(record));
  const [draft, setDraft] = useState<FieldState>(() => toFieldState(record));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isDirty =
    draft.record_date !== saved.record_date ||
    draft.type !== saved.type ||
    draft.quantity !== saved.quantity ||
    draft.unit !== saved.unit ||
    draft.memo !== saved.memo;

  function updateDraft<K extends keyof FieldState>(key: K, value: FieldState[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    setError(null);

    const result = await updateMaterialRecord(record.id, projectId, {
      material_name: record.material_name,
      unit: draft.unit,
      record_date: draft.record_date,
      quantity: draft.quantity,
      type: draft.type,
      memo: draft.memo,
    });

    setSaving(false);

    if ("error" in result) {
      setError(result.error);
      return;
    }

    setSaved(draft);
    router.refresh();
  }

  function handleCancel() {
    setDraft(saved);
    setError(null);
  }

  const boundDelete = deleteMaterialRecord.bind(null, record.id, projectId);

  return (
    <>
      <tr className="border-b border-border last:border-0 align-top">
        <td className="py-1.5 pr-2">
          <input
            type="date"
            value={draft.record_date}
            onChange={(event) => updateDraft("record_date", event.target.value)}
            className="h-8 rounded border border-border bg-canvas px-1 text-xs text-ink"
          />
        </td>
        <td className="py-1.5 pr-2">
          <select
            value={draft.type}
            onChange={(event) =>
              updateDraft("type", event.target.value as MaterialRecordType)
            }
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
              value={draft.quantity}
              onChange={(event) => updateDraft("quantity", event.target.value)}
              className="h-8 w-20 rounded border border-border bg-canvas px-2 text-right text-xs text-ink"
            />
            <input
              value={draft.unit}
              onChange={(event) => updateDraft("unit", event.target.value)}
              placeholder="단위"
              className="h-8 w-14 rounded border border-border bg-canvas px-1 text-xs text-ink"
            />
          </div>
        </td>
        <td className="py-1.5 pr-2 text-right text-ink-muted">
          {formatNumber(cumulative)}
          {draft.unit}
        </td>
        <td className="py-1.5 pr-2">
          <input
            value={draft.memo}
            onChange={(event) => updateDraft("memo", event.target.value)}
            placeholder="메모"
            className="h-8 w-full rounded border border-border bg-canvas px-2 text-xs text-ink"
          />
        </td>
        <td className="py-1.5">
          <div className="flex items-center gap-1">
            {isDirty && (
              <>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  disabled={saving}
                  onClick={handleSave}
                >
                  {saving ? "저장 중..." : "저장"}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  disabled={saving}
                  onClick={handleCancel}
                >
                  취소
                </Button>
              </>
            )}
            <form action={boundDelete}>
              <DeleteButton />
            </form>
          </div>
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
