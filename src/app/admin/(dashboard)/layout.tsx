import type { ReactNode } from "react";
import { requireUser } from "@/lib/dal";
import { logout } from "@/app/actions/auth";
import { Button } from "@/components/ui/Button";

export default async function AdminDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await requireUser();

  return (
    <div className="min-h-dvh bg-surface">
      <header className="border-b border-border bg-canvas">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-accent">
              OFFERHOUSE
            </p>
            <p className="text-sm text-ink-muted">{user.email}</p>
          </div>
          <form action={logout}>
            <Button type="submit" variant="ghost" size="sm">
              로그아웃
            </Button>
          </form>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}
