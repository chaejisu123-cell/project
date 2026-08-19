import { deleteExpense } from "@/app/actions/expense";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate, formatWon } from "@/lib/utils/format";
import type { BudgetItem, ExpenseItem } from "@/lib/supabase/database.types";

export function ExpenseManageList({
  expenses,
  budgetItems,
  projectId,
}: {
  expenses: ExpenseItem[];
  budgetItems: BudgetItem[];
  projectId: string;
}) {
  if (expenses.length === 0) {
    return <EmptyState text="아직 등록된 지출 내역이 없습니다." />;
  }

  const budgetNameById = new Map(
    budgetItems.map((item) => [item.id, item.item_name]),
  );

  return (
    <ul className="flex flex-col gap-3">
      {expenses.map((expense) => {
        const boundDelete = deleteExpense.bind(null, expense.id, projectId);

        return (
          <li
            key={expense.id}
            className="rounded-lg border border-border bg-canvas p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-col gap-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium text-ink">
                    {formatWon(expense.amount)}
                  </span>
                  {expense.vendor_name && (
                    <span className="text-sm text-ink-muted">
                      {expense.vendor_name}
                    </span>
                  )}
                  {expense.budget_item_id &&
                    budgetNameById.has(expense.budget_item_id) && (
                      <span className="rounded-full bg-accent-soft px-2 py-0.5 text-xs font-medium text-accent-hover">
                        {budgetNameById.get(expense.budget_item_id)}
                      </span>
                    )}
                </div>
                <p className="text-xs text-ink-muted">
                  {formatDate(expense.expense_date)}
                </p>
                {expense.memo && (
                  <p className="whitespace-pre-line text-sm text-ink-muted">
                    {expense.memo}
                  </p>
                )}
                {expense.receipt_image_url && (
                  <a
                    href={expense.receipt_image_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-medium text-accent hover:text-accent-hover"
                  >
                    영수증 보기
                  </a>
                )}
              </div>
              <form action={boundDelete}>
                <DeleteButton />
              </form>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
