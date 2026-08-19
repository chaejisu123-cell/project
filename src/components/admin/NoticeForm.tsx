"use client";

import { useActionState, useEffect, useRef } from "react";
import { createNotice, type NoticeFormState } from "@/app/actions/notices";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";

export function NoticeForm({ projectId }: { projectId: string }) {
  const action = createNotice.bind(null, projectId);
  const [state, formAction, pending] = useActionState<NoticeFormState, FormData>(
    action,
    undefined,
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="flex flex-col gap-5 rounded-lg border border-border bg-canvas p-6"
    >
      <Field label="제목" htmlFor="title" required error={state?.errors?.title}>
        <Input id="title" name="title" required />
      </Field>

      <Field label="내용" htmlFor="content" error={state?.errors?.content}>
        <Textarea id="content" name="content" rows={4} />
      </Field>

      <label className="flex items-center gap-2 text-sm text-ink">
        <input
          type="checkbox"
          name="is_pinned"
          className="h-4 w-4 rounded border-border text-accent focus:ring-accent/40"
        />
        상단 고정
      </label>

      {state?.message && <p className="text-sm text-danger">{state.message}</p>}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "등록 중..." : "공지 등록"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          disabled={pending}
          onClick={() => formRef.current?.reset()}
        >
          취소
        </Button>
      </div>
    </form>
  );
}
