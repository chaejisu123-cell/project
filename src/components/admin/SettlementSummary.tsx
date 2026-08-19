import { Card } from "@/components/ui/Card";
import { formatWon } from "@/lib/utils/format";
import type {
  BudgetItem,
  ExpenseItem,
  Project,
} from "@/lib/supabase/database.types";

export function SettlementSummary({
  project,
  budgetItems,
  expenses,
}: {
  project: Project;
  budgetItems: BudgetItem[];
  expenses: ExpenseItem[];
}) {
  const totalPlanned = budgetItems.reduce(
    (sum, item) => sum + item.planned_amount,
    0,
  );
  const totalSpent = expenses.reduce((sum, item) => sum + item.amount, 0);
  const budgetTotal = project.budget_total;
  const remaining = budgetTotal - totalSpent;
  const spentRate =
    budgetTotal > 0 ? Math.round((totalSpent / budgetTotal) * 100) : 0;

  const spentByBudgetItem = new Map<string, number>();
  let unassignedSpent = 0;
  for (const expense of expenses) {
    if (expense.budget_item_id) {
      spentByBudgetItem.set(
        expense.budget_item_id,
        (spentByBudgetItem.get(expense.budget_item_id) ?? 0) + expense.amount,
      );
    } else {
      unassignedSpent += expense.amount;
    }
  }

  const spentByVendor = new Map<string, number>();
  for (const expense of expenses) {
    const key = expense.vendor_name?.trim() || "미지정";
    spentByVendor.set(key, (spentByVendor.get(key) ?? 0) + expense.amount);
  }
  const vendorRows = [...spentByVendor.entries()].sort((a, b) => b[1] - a[1]);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SummaryTile label="총 예산" value={formatWon(budgetTotal)} />
        <SummaryTile label="총 집행액" value={formatWon(totalSpent)} />
        <SummaryTile
          label="잔액"
          value={formatWon(remaining)}
          tone={remaining < 0 ? "danger" : "default"}
        />
        <SummaryTile
          label="집행률"
          value={`${spentRate}%`}
          tone={spentRate > 100 ? "danger" : "default"}
        />
      </div>

      {budgetItems.length > 0 && (
        <Card className="overflow-x-auto p-4">
          <table className="w-full min-w-[480px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-ink-muted">
                <th className="pb-2 font-medium">항목</th>
                <th className="pb-2 font-medium">계획</th>
                <th className="pb-2 font-medium">집행</th>
                <th className="pb-2 font-medium">차이</th>
              </tr>
            </thead>
            <tbody>
              {budgetItems.map((item) => {
                const spent = spentByBudgetItem.get(item.id) ?? 0;
                const diff = item.planned_amount - spent;
                return (
                  <tr key={item.id} className="border-b border-border last:border-0">
                    <td className="py-2 text-ink">
                      {item.category ? `[${item.category}] ` : ""}
                      {item.item_name}
                    </td>
                    <td className="py-2 text-ink-muted">
                      {formatWon(item.planned_amount)}
                    </td>
                    <td className="py-2 text-ink-muted">{formatWon(spent)}</td>
                    <td className={diff < 0 ? "py-2 text-danger" : "py-2 text-ink-muted"}>
                      {formatWon(diff)}
                    </td>
                  </tr>
                );
              })}
              {unassignedSpent > 0 && (
                <tr>
                  <td className="py-2 text-ink-muted">항목 미지정</td>
                  <td className="py-2 text-ink-muted">-</td>
                  <td className="py-2 text-ink-muted">
                    {formatWon(unassignedSpent)}
                  </td>
                  <td className="py-2 text-ink-muted">-</td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr className="border-t border-border font-medium">
                <td className="pt-2 text-ink">합계</td>
                <td className="pt-2 text-ink">{formatWon(totalPlanned)}</td>
                <td className="pt-2 text-ink">{formatWon(totalSpent)}</td>
                <td className="pt-2 text-ink">
                  {formatWon(totalPlanned - totalSpent)}
                </td>
              </tr>
            </tfoot>
          </table>
        </Card>
      )}

      {vendorRows.length > 0 && (
        <Card className="overflow-x-auto p-4">
          <h3 className="mb-3 text-sm font-semibold text-ink">
            협력업체별 집행 현황
          </h3>
          <table className="w-full min-w-[320px] text-sm">
            <tbody>
              {vendorRows.map(([vendor, amount]) => (
                <tr key={vendor} className="border-b border-border last:border-0">
                  <td className="py-2 text-ink">{vendor}</td>
                  <td className="py-2 text-right text-ink-muted">
                    {formatWon(amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}

function SummaryTile({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "danger";
}) {
  return (
    <Card className="flex flex-col gap-1 p-4">
      <span className="text-xs text-ink-muted">{label}</span>
      <span
        className={
          tone === "danger"
            ? "text-lg font-semibold text-danger"
            : "text-lg font-semibold text-ink"
        }
      >
        {value}
      </span>
    </Card>
  );
}
