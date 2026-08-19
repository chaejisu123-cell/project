"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createMaterialRecord } from "@/app/actions/material";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";

function today() {
  return new Date().toISOString().slice(0, 10);
}

export function MaterialForm({ projectId }: { projectId: string }) {
  const router = useRouter();

  const [materialName, setMaterialName] = useState("");
  const [unit, setUnit] = useState("");
  const [recordDate, setRecordDate] = useState(today());
  const [quantity, setQuantity] = useState("");
  const [type, setType] = useState<"사용" | "발주">("사용");
  const [memo, setMemo] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function handleCancel() {
    setMaterialName("");
    setUnit("");
    setRecordDate(today());
    setQuantity("");
    setType("사용");
    setMemo("");
    setError(null);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const result = await createMaterialRecord(projectId, {
      material_name: materialName,
      unit,
      record_date: recordDate,
      quantity,
      type,
      memo,
    });

    setSubmitting(false);

    if ("error" in result) {
      setError(result.error);
      return;
    }

    setMaterialName("");
    setUnit("");
    setQuantity("");
    setMemo("");
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-5 rounded-lg border border-border bg-canvas p-6"
    >
      <div className="grid grid-cols-2 gap-4">
        <Field label="자재명" htmlFor="material_name" required>
          <Input
            id="material_name"
            value={materialName}
            onChange={(event) => setMaterialName(event.target.value)}
            placeholder="예: 강화마루"
          />
        </Field>
        <Field label="규격/단위" htmlFor="unit">
          <Input
            id="unit"
            value={unit}
            onChange={(event) => setUnit(event.target.value)}
            placeholder="예: 박스, m², 개"
          />
        </Field>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Field label="날짜" htmlFor="record_date">
          <Input
            id="record_date"
            type="date"
            value={recordDate}
            onChange={(event) => setRecordDate(event.target.value)}
          />
        </Field>
        <Field label="수량" htmlFor="quantity" required>
          <Input
            id="quantity"
            type="number"
            min={0}
            step={0.01}
            value={quantity}
            onChange={(event) => setQuantity(event.target.value)}
            placeholder="0"
          />
        </Field>
        <Field label="구분" htmlFor="type">
          <Select
            id="type"
            value={type}
            onChange={(event) => setType(event.target.value as "사용" | "발주")}
          >
            <option value="사용">사용</option>
            <option value="발주">발주</option>
          </Select>
        </Field>
      </div>

      <Field label="메모" htmlFor="memo">
        <Textarea
          id="memo"
          value={memo}
          onChange={(event) => setMemo(event.target.value)}
          rows={2}
        />
      </Field>

      {error && <p className="text-sm text-danger">{error}</p>}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={submitting}>
          {submitting ? "저장 중..." : "자재 기록 추가"}
        </Button>
        <Button type="button" variant="ghost" disabled={submitting} onClick={handleCancel}>
          취소
        </Button>
      </div>
    </form>
  );
}
