import { createProject } from "@/app/actions/projects";
import { ProjectForm } from "@/components/admin/ProjectForm";
import { Card } from "@/components/ui/Card";

export default function NewProjectPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-ink">새 현장 등록</h1>
        <p className="text-sm text-ink-muted">
          등록하면 고객 전용 링크가 자동으로 생성됩니다.
        </p>
      </div>
      <Card className="max-w-xl p-6">
        <ProjectForm action={createProject} />
      </Card>
    </div>
  );
}
