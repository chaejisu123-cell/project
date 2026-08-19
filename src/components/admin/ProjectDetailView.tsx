"use client";

import { useState } from "react";
import { updateProject } from "@/app/actions/projects";
import { ProjectForm } from "@/components/admin/ProjectForm";
import { PhotoUploadForm } from "@/components/admin/PhotoUploadForm";
import { PhotoManageGrid } from "@/components/admin/PhotoManageGrid";
import { ScheduleView } from "@/components/admin/ScheduleView";
import { NoticeForm } from "@/components/admin/NoticeForm";
import { NoticeManageList } from "@/components/admin/NoticeManageList";
import { SettlementSummary } from "@/components/admin/SettlementSummary";
import { BudgetEditor } from "@/components/admin/BudgetEditor";
import { ExpenseForm } from "@/components/admin/ExpenseForm";
import { ExpenseManageList } from "@/components/admin/ExpenseManageList";
import { LaborSheet } from "@/components/admin/LaborSheet";
import { MaterialForm } from "@/components/admin/MaterialForm";
import { MaterialManageList } from "@/components/admin/MaterialManageList";
import { Section } from "@/components/ui/Section";
import { cn } from "@/lib/utils/cn";
import type {
  BudgetItem,
  ExpenseItem,
  LaborRecord,
  MaterialRecord,
  Notice,
  Photo,
  Project,
  ScheduleItem,
} from "@/lib/supabase/database.types";

const TABS = [
  { key: "info", label: "현장 정보" },
  { key: "photos", label: "사진" },
  { key: "schedule", label: "공정표" },
  { key: "notices", label: "공지사항" },
  { key: "settlement", label: "정산" },
  { key: "labor", label: "공수관리" },
  { key: "materials", label: "자재관리" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export function ProjectDetailView({
  project,
  photos,
  scheduleItems,
  notices,
  budgetItems,
  expenses,
  laborRecords,
  materialRecords,
}: {
  project: Project;
  photos: Photo[];
  scheduleItems: ScheduleItem[];
  notices: Notice[];
  budgetItems: BudgetItem[];
  expenses: ExpenseItem[];
  laborRecords: LaborRecord[];
  materialRecords: MaterialRecord[];
}) {
  const [activeTab, setActiveTab] = useState<TabKey>("info");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-ink">{project.name}</h1>
        {project.address && (
          <p className="text-sm text-ink-muted">{project.address}</p>
        )}
      </div>

      <nav className="flex gap-1 overflow-x-auto border-b border-border">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
              activeTab === tab.key
                ? "border-accent text-accent"
                : "border-transparent text-ink-muted hover:text-ink",
            )}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {activeTab === "info" && (
        <div className="max-w-xl">
          <ProjectForm action={updateProject.bind(null, project.id)} project={project} />
        </div>
      )}

      {activeTab === "photos" && (
        <div className="flex flex-col gap-6">
          <PhotoUploadForm projectId={project.id} />
          <PhotoManageGrid photos={photos} projectId={project.id} />
        </div>
      )}

      {activeTab === "schedule" && (
        <ScheduleView projectId={project.id} initialItems={scheduleItems} />
      )}

      {activeTab === "notices" && (
        <div className="flex flex-col gap-6">
          <NoticeForm projectId={project.id} />
          <NoticeManageList notices={notices} projectId={project.id} />
        </div>
      )}

      {activeTab === "settlement" && (
        <div className="flex flex-col gap-8">
          <SettlementSummary
            project={project}
            budgetItems={budgetItems}
            expenses={expenses}
          />
          <Section title="예산 항목">
            <BudgetEditor projectId={project.id} initialItems={budgetItems} />
          </Section>
          <Section title="지출 내역">
            <div className="flex flex-col gap-6">
              <ExpenseForm projectId={project.id} budgetItems={budgetItems} />
              <ExpenseManageList
                expenses={expenses}
                budgetItems={budgetItems}
                projectId={project.id}
              />
            </div>
          </Section>
        </div>
      )}

      {activeTab === "labor" && (
        <LaborSheet projectId={project.id} initialRecords={laborRecords} />
      )}

      {activeTab === "materials" && (
        <div className="flex flex-col gap-6">
          <MaterialForm projectId={project.id} />
          <MaterialManageList records={materialRecords} projectId={project.id} />
        </div>
      )}
    </div>
  );
}
