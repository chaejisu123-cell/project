"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";

const TABS = [
  { key: "edit", label: "현장 정보" },
  { key: "photos", label: "사진" },
  { key: "schedule", label: "공정표" },
  { key: "notices", label: "공지사항" },
  { key: "settlement", label: "정산" },
  { key: "labor", label: "공수관리" },
  { key: "materials", label: "자재관리" },
] as const;

export function ProjectTabs({ projectId }: { projectId: string }) {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 overflow-x-auto border-b border-border">
      {TABS.map((tab) => {
        const href = `/admin/projects/${projectId}/${tab.key}`;
        const active = pathname === href;

        return (
          <Link
            key={tab.key}
            href={href}
            className={cn(
              "whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
              active
                ? "border-accent text-accent"
                : "border-transparent text-ink-muted hover:text-ink",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
