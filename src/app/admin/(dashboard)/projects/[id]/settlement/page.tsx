import { createClient } from "@/lib/supabase/server";
import { getProjectOrNotFound } from "@/lib/admin-project";
import { BudgetEditor } from "@/components/admin/BudgetEditor";
import { ExpenseForm } from "@/components/admin/ExpenseForm";
import { ExpenseManageList } from "@/components/admin/ExpenseManageList";
import { SettlementSummary } from "@/components/admin/SettlementSummary";
import { Section } from "@/components/ui/Section";

export default async function ProjectSettlementPage(
  props: PageProps<"/admin/projects/[id]/settlement">,
) {
  const { id } = await props.params;
  const project = await getProjectOrNotFound(id);

  const supabase = await createClient();
  const [budgetRes, expenseRes] = await Promise.all([
    supabase
      .from("budget_items")
      .select("*")
      .eq("project_id", id)
      .order("created_at", { ascending: true }),
    supabase
      .from("expense_items")
      .select("*")
      .eq("project_id", id)
      .order("expense_date", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false }),
  ]);

  const budgetItems = budgetRes.data ?? [];
  const expenses = expenseRes.data ?? [];

  return (
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
  );
}
