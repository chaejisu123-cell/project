import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ProjectCard } from "@/components/admin/ProjectCard";

export default async function AdminProjectsPage() {
  const supabase = await createClient();
  const { data: projects, error } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-ink">현장 목록</h1>
          <p className="text-sm text-ink-muted">
            현재 진행 중인 현장을 관리합니다.
          </p>
        </div>
        <Button href="/admin/projects/new">+ 새 현장 등록</Button>
      </div>

      {error && (
        <p className="text-sm text-danger">
          현장 목록을 불러오지 못했습니다: {error.message}
        </p>
      )}

      {projects && projects.length === 0 && (
        <Card className="p-10 text-center text-sm text-ink-muted">
          등록된 현장이 없습니다. 새 현장을 등록해보세요.
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {projects?.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  );
}
