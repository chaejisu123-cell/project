"use client";

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  createScheduleItem,
  deleteScheduleItem,
  reorderScheduleItems,
  updateScheduleItem,
  type ScheduleItemInput,
  type ScheduleItemResult,
} from "@/app/actions/schedule";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/utils/cn";
import type { ScheduleItem, ScheduleStatus } from "@/lib/supabase/database.types";

const STATUS_OPTIONS: ScheduleStatus[] = ["예정", "진행중", "완료"];

export function ScheduleEditor({
  projectId,
  initialItems,
}: {
  projectId: string;
  initialItems: ScheduleItem[];
}) {
  const [items, setItems] = useState(initialItems);
  const [adding, setAdding] = useState(false);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setItems((current) => {
      const oldIndex = current.findIndex((item) => item.id === active.id);
      const newIndex = current.findIndex((item) => item.id === over.id);
      const next = arrayMove(current, oldIndex, newIndex);
      void reorderScheduleItems(
        projectId,
        next.map((item) => item.id),
      );
      return next;
    });
  }

  async function handleAdd(
    input: ScheduleItemInput,
  ): Promise<ScheduleItemResult> {
    const result = await createScheduleItem(projectId, input);
    if ("item" in result) {
      setItems((current) => [...current, result.item]);
      setAdding(false);
    }
    return result;
  }

  function handleUpdated(updated: ScheduleItem) {
    setItems((current) =>
      current.map((item) => (item.id === updated.id ? updated : item)),
    );
  }

  function handleDeleted(id: string) {
    setItems((current) => current.filter((item) => item.id !== id));
    void deleteScheduleItem(id, projectId);
  }

  return (
    <div className="flex flex-col gap-4">
      {items.length === 0 && !adding && (
        <EmptyState text="아직 등록된 공정이 없습니다." />
      )}

      {items.length > 0 && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={items.map((item) => item.id)}
            strategy={verticalListSortingStrategy}
          >
            <ul className="flex flex-col gap-2">
              {items.map((item) => (
                <ScheduleRow
                  key={item.id}
                  item={item}
                  projectId={projectId}
                  onUpdated={handleUpdated}
                  onDelete={() => handleDeleted(item.id)}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      )}

      {adding ? (
        <AddScheduleRow onCancel={() => setAdding(false)} onSubmit={handleAdd} />
      ) : (
        <Button
          type="button"
          variant="secondary"
          onClick={() => setAdding(true)}
          className="self-start"
        >
          + 공정 추가
        </Button>
      )}
    </div>
  );
}

function ScheduleRow({
  item,
  projectId,
  onUpdated,
  onDelete,
}: {
  item: ScheduleItem;
  projectId: string;
  onUpdated: (item: ScheduleItem) => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });

  const [processName, setProcessName] = useState(item.process_name);
  const [startDate, setStartDate] = useState(item.start_date ?? "");
  const [endDate, setEndDate] = useState(item.end_date ?? "");
  const [status, setStatus] = useState<ScheduleStatus>(item.status);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  const isDirty =
    processName !== item.process_name ||
    startDate !== (item.start_date ?? "") ||
    endDate !== (item.end_date ?? "") ||
    status !== item.status;

  async function handleSave() {
    setSaving(true);
    setError(null);
    const result = await updateScheduleItem(item.id, projectId, {
      process_name: processName,
      start_date: startDate,
      end_date: endDate,
      status,
    });
    setSaving(false);
    if ("item" in result) {
      onUpdated(result.item);
    } else {
      setError(result.error);
    }
  }

  function handleCancel() {
    setProcessName(item.process_name);
    setStartDate(item.start_date ?? "");
    setEndDate(item.end_date ?? "");
    setStatus(item.status);
    setError(null);
  }

  return (
    <li
      ref={setNodeRef}
      style={style}
      className="flex flex-col gap-2 rounded-lg border border-border bg-canvas p-4"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="button"
          {...attributes}
          {...listeners}
          aria-label="순서 변경"
          className="shrink-0 cursor-grab touch-none px-1 text-lg text-ink-muted hover:text-ink active:cursor-grabbing"
        >
          ⠿
        </button>

        <div className="grid flex-1 grid-cols-2 gap-3 sm:grid-cols-4">
          <Input
            value={processName}
            onChange={(event) => setProcessName(event.target.value)}
            placeholder="공정명"
            className="sm:col-span-2"
          />
          <Input
            type="date"
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
          />
          <Input
            type="date"
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
          />
        </div>

        <Select
          value={status}
          onChange={(event) => setStatus(event.target.value as ScheduleStatus)}
          className="sm:w-28"
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </Select>

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

function AddScheduleRow({
  onCancel,
  onSubmit,
}: {
  onCancel: () => void;
  onSubmit: (input: ScheduleItemInput) => Promise<ScheduleItemResult>;
}) {
  const [processName, setProcessName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState<ScheduleStatus>("예정");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit() {
    setPending(true);
    setError(null);
    const result = await onSubmit({
      process_name: processName,
      start_date: startDate,
      end_date: endDate,
      status,
    });
    setPending(false);
    if ("error" in result) {
      setError(result.error);
    }
  }

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-lg border border-dashed border-border bg-canvas p-4",
      )}
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Input
          placeholder="공정명"
          value={processName}
          onChange={(event) => setProcessName(event.target.value)}
          className="sm:col-span-2"
          autoFocus
        />
        <Input
          type="date"
          value={startDate}
          onChange={(event) => setStartDate(event.target.value)}
        />
        <Input
          type="date"
          value={endDate}
          onChange={(event) => setEndDate(event.target.value)}
        />
      </div>
      <div className="flex items-center gap-3">
        <Select
          value={status}
          onChange={(event) => setStatus(event.target.value as ScheduleStatus)}
          className="w-32"
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </Select>
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
