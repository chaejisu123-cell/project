"use client";

import { useActionState } from "react";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import type { ProjectFormState } from "@/app/actions/projects";
import type { Project } from "@/lib/supabase/database.types";

type ProjectAction = (
  state: ProjectFormState,
  formData: FormData,
) => Promise<ProjectFormState>;

interface ProjectFormProps {
  action: ProjectAction;
  project?: Project;
}

export function ProjectForm({ action, project }: ProjectFormProps) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <Field
        label="현장 이름"
        htmlFor="name"
        required
        error={state?.errors?.name}
      >
        <Input
          id="name"
          name="name"
          defaultValue={project?.name}
          placeholder="예) 봉양동 양계장 리모델링"
          required
        />
      </Field>

      <Field label="주소" htmlFor="address" error={state?.errors?.address}>
        <Input
          id="address"
          name="address"
          defaultValue={project?.address ?? ""}
          placeholder="현장 주소"
        />
      </Field>

      <Field
        label="고객명"
        htmlFor="customer_name"
        error={state?.errors?.customer_name}
      >
        <Input
          id="customer_name"
          name="customer_name"
          defaultValue={project?.customer_name ?? ""}
          placeholder="고객 / 건축주 이름"
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field
          label="예산 총액"
          htmlFor="budget_total"
          error={state?.errors?.budget_total}
        >
          <Input
            id="budget_total"
            name="budget_total"
            type="number"
            min={0}
            step={10000}
            defaultValue={project?.budget_total ?? 0}
          />
        </Field>

        <Field label="상태" htmlFor="status" error={state?.errors?.status}>
          <Select
            id="status"
            name="status"
            defaultValue={project?.status ?? "진행중"}
          >
            <option value="진행중">진행중</option>
            <option value="완료">완료</option>
            <option value="보류">보류</option>
          </Select>
        </Field>
      </div>

      {project && (
        <Field
          label="고객 링크"
          htmlFor="site_token"
          hint="이 링크로 접속하면 로그인 없이 현장을 확인할 수 있습니다."
        >
          <Input
            id="site_token"
            readOnly
            value={`/site/${project.site_token}`}
            className="text-ink-muted"
          />
        </Field>
      )}

      {state?.message && (
        <p className="text-sm text-danger">{state.message}</p>
      )}

      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" disabled={pending}>
          {pending ? "저장 중..." : project ? "수정 저장" : "현장 등록"}
        </Button>
        <Button href="/admin" variant="secondary">
          취소
        </Button>
      </div>
    </form>
  );
}
