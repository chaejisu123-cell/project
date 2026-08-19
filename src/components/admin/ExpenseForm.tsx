"use client";

import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { createExpense } from "@/app/actions/expense";
import { compressImage } from "@/lib/utils/image";
import { RECEIPTS_BUCKET } from "@/lib/constants";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import type { BudgetItem } from "@/lib/supabase/database.types";

function today() {
  return new Date().toISOString().slice(0, 10);
}

export function ExpenseForm({
  projectId,
  budgetItems,
}: {
  projectId: string;
  budgetItems: BudgetItem[];
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [budgetItemId, setBudgetItemId] = useState("");
  const [vendorName, setVendorName] = useState("");
  const [amount, setAmount] = useState("");
  const [expenseDate, setExpenseDate] = useState(today());
  const [memo, setMemo] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      let receiptUrl = "";

      if (file) {
        setStatus("영수증 업로드 중...");
        const supabase = createClient();
        const compressed = await compressImage(file);
        const path = `${projectId}/${crypto.randomUUID()}.jpg`;

        const { error: uploadError } = await supabase.storage
          .from(RECEIPTS_BUCKET)
          .upload(path, compressed, { contentType: "image/jpeg" });

        if (uploadError) {
          throw new Error(uploadError.message);
        }

        const { data } = supabase.storage.from(RECEIPTS_BUCKET).getPublicUrl(path);
        receiptUrl = data.publicUrl;
      }

      setStatus("저장 중...");
      const result = await createExpense(projectId, {
        budget_item_id: budgetItemId,
        vendor_name: vendorName,
        amount,
        expense_date: expenseDate,
        receipt_image_url: receiptUrl,
        memo,
      });

      if ("error" in result) {
        setError(result.error);
        return;
      }

      setVendorName("");
      setAmount("");
      setMemo("");
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "지출 등록 중 문제가 발생했습니다.",
      );
    } finally {
      setSubmitting(false);
      setStatus(null);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-5 rounded-lg border border-border bg-canvas p-6"
    >
      <div className="grid grid-cols-2 gap-4">
        <Field label="지출일" htmlFor="expense_date">
          <Input
            id="expense_date"
            type="date"
            value={expenseDate}
            onChange={(event) => setExpenseDate(event.target.value)}
          />
        </Field>
        <Field
          label="예산 항목"
          htmlFor="budget_item_id"
          hint="선택하지 않으면 미지정으로 기록됩니다."
        >
          <Select
            id="budget_item_id"
            value={budgetItemId}
            onChange={(event) => setBudgetItemId(event.target.value)}
          >
            <option value="">미지정</option>
            {budgetItems.map((item) => (
              <option key={item.id} value={item.id}>
                {item.category ? `[${item.category}] ` : ""}
                {item.item_name}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="협력업체" htmlFor="vendor_name">
          <Input
            id="vendor_name"
            value={vendorName}
            onChange={(event) => setVendorName(event.target.value)}
            placeholder="예: OO설비"
          />
        </Field>
        <Field label="금액" htmlFor="amount" required>
          <Input
            id="amount"
            type="number"
            min={0}
            inputMode="numeric"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="0"
          />
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

      <Field
        label="영수증 이미지"
        htmlFor="receipt_file"
        hint="선택 사항입니다. 업로드 시 자동으로 축소·압축됩니다."
      >
        <input
          id="receipt_file"
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          className="block w-full text-sm text-ink file:mr-4 file:rounded-md file:border-0 file:bg-accent-soft file:px-4 file:py-2 file:text-sm file:font-medium file:text-accent-hover"
        />
      </Field>

      {error && <p className="text-sm text-danger">{error}</p>}

      <Button type="submit" disabled={submitting} className="self-start">
        {submitting ? (status ?? "저장 중...") : "지출 등록"}
      </Button>
    </form>
  );
}
