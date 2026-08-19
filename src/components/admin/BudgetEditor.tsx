"use client";

import { useState } from "react";
import {
  createBudgetItem,
  deleteBudgetItem,
  updateBudgetItem,
  type BudgetItemInput,
  type BudgetItemResult,
} from "@/app/actions/budget";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatWon } from "@/lib/utils/format";
import type { BudgetItem } from "@/lib/supabase/database.types";

export function BudgetEditor({
  projectId,
  initialItems,
}: {
  projectId: string;
  initialItems: BudgetItem[];
}) {
  const [items, setItems] = useState(initialItems);
  const [adding, setAdding] = useState(false);

  const total = items.reduce((sum, item) => sum + item.planned_amount, 0);

  async function handleAdd(input: BudgetItemInput): Promise<BudgetItemResult> {
    const result = await createBudgetItem(projectId, input);
    if ("item" in result) {
      setItems((current) => [...current, result.item]);
      setAdding(false);
    }
    return result;
  }

  function handleUpdated(updated: BudgetItem) {
    setItems((current) =>
      current.map((item) => (item.id === updated.id ? updated : item)),
    );
  }

  function handleDeleted(id: string) {
    setItems((current) => current.filter((item) => item.id !== id));
    void deleteBudgetItem(id, projectId);
  }

  return (
    <div className="flex flex-col gap-4">
      {items.length === 0 && !adding && (
        <EmptyState text="아직 등록된 예산 항목이 없습니다." />
      )}

      {items.length > 0 && (
        <ul className="flex flex-col gap-2">
          {items.map((item) => (
            <BudgetRow
              key={item.id}
              item={item}
              projectId={projectId}
              onUpdated={handleUpdated}
              onDelete={() => handleDeleted(item.id)}
            />
          ))}
        </ul>
      )}

      {adding ? (
        <AddBudgetRow onCancel={() => setAdding(false)} onSubmit={handleAdd} />
      ) : (
        <Button
          type="button"
          variant="secondary"
          onClick={() => setAdding(true)}
          className="self-start"
        >
          + 예산 항목 추가
        </Button>
      )}

      {items.length > 0 && (
        <p className="text-sm text-ink-muted">
          예산 항목 합계:{" "}
          <span className="font-medium text-ink">{formatWon(total)}</span>
        </p>
      )}
    </div>
  );
}

function BudgetRow({
  item,
  projectId,
  onUpdated,
  onDelete,
}: {
  item: BudgetItem;
  projectId: string;
  onUpdated: (item: BudgetItem) => void;
  onDelete: () => void;
}) {
  const [category, setCategory] = useState(item.category ?? "");
  const [itemName, setItemName] = useState(item.item_name);
  const [plannedAmount, setPlannedAmount] = useState(String(item.planned_amount));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isDirty =
    category !== (item.category ?? "") ||
    itemName !== item.item_name ||
    plannedAmount !== String(item.planned_amount);

  async function handleSave() {
    setSaving(true);
    setError(null);
    const result = await updateBudgetItem(item.id, projectId, {
      category,
      item_name: itemName,
      planned_amount: plannedAmount,
    });
    setSaving(false);
    if ("item" in result) {
      onUpdated(result.item);
    } else {
      setError(result.error);
    }
  }

  function handleCancel() {
    setCategory(item.category ?? "");
    setItemName(item.item_name);
    setPlannedAmount(String(item.planned_amount));
    setError(null);
  }

  return (
    <li className="flex flex-col gap-2 rounded-lg border border-border bg-canvas p-4">
      <div className="grid flex-1 grid-cols-2 gap-3 sm:grid-cols-[1fr_2fr_1fr_auto]">
        <Input
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          placeholder="분류(선택)"
        />
        <Input
          value={itemName}
          onChange={(event) => setItemName(event.target.value)}
          placeholder="항목명"
        />
        <Input
          type="number"
          min={0}
          value={plannedAmount}
          onChange={(event) => setPlannedAmount(event.target.value)}
          placeholder="계획 금액"
        />
        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={saving || !isDirty}
            onClick={handleSave}
          >
            {saving ? "저장 중..." : "저장"}
          </Button>
          {isDirty && (
            <Button type="button" size="sm" variant="ghost" onClick={handleCancel}>
              취소
            </Button>
          )}
          <Button type="button" size="sm" variant="ghost" onClick={onDelete}>
            삭제
          </Button>
        </div>
      </div>
      {error && <p className="text-xs text-danger">{error}</p>}
    </li>
  );
}

function AddBudgetRow({
  onCancel,
  onSubmit,
}: {
  onCancel: () => void;
  onSubmit: (input: BudgetItemInput) => Promise<BudgetItemResult>;
}) {
  const [category, setCategory] = useState("");
  const [itemName, setItemName] = useState("");
  const [plannedAmount, setPlannedAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit() {
    setPending(true);
    setError(null);
    const result = await onSubmit({
      category,
      item_name: itemName,
      planned_amount: plannedAmount,
    });
    setPending(false);
    if ("error" in result) {
      setError(result.error);
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-dashed border-border bg-canvas p-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Input
          placeholder="분류(선택)"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          autoFocus
        />
        <Input
          placeholder="항목명"
          value={itemName}
          onChange={(event) => setItemName(event.target.value)}
        />
        <Input
          type="number"
          min={0}
          placeholder="계획 금액"
          value={plannedAmount}
          onChange={(event) => setPlannedAmount(event.target.value)}
        />
      </div>
      <div className="flex items-center gap-3">
        <Button type="button" size="sm" disabled={pending} onClick={handleSubmit}>
          {pending ? "추가 중..." : "추가"}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={onCancel}>
          취소
        </Button>
      </div>
      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  );
}
