import Link from "next/link";
import { StatusBadge } from "@/components/ui/Badge";
import { CopyLinkButton } from "./CopyLinkButton";
import { formatWon, formatDate } from "@/lib/utils/format";
import type { Project } from "@/lib/supabase/database.types";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <div className="flex h-full flex-col gap-4 rounded-lg border border-border bg-canvas p-5">
      <Link href={`/admin/projects/${project.id}`} className="flex flex-1 flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="truncate font-semibold text-ink">{project.name}</h2>
            {project.customer_name && (
              <p className="truncate text-sm text-ink-muted">
                {project.customer_name} 고객님
              </p>
            )}
          </div>
          <StatusBadge status={project.status} />
        </div>

        <dl className="flex flex-col gap-1 text-sm text-ink-muted">
          {project.address && <div className="truncate">{project.address}</div>}
          <div>예산 {formatWon(project.budget_total)}</div>
          <div>등록일 {formatDate(project.created_at)}</div>
        </dl>
      </Link>

      <div className="mt-auto flex items-center border-t border-border pt-4">
        <CopyLinkButton token={project.site_token} />
      </div>
    </div>
  );
}
