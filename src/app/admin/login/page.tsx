import { LoginForm } from "@/components/admin/LoginForm";
import { Card } from "@/components/ui/Card";

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-surface px-4">
      <Card className="w-full max-w-sm p-8">
        <div className="mb-8 text-center">
          <p className="text-xs font-medium uppercase tracking-widest text-accent">
            OFFERHOUSE
          </p>
          <h1 className="mt-2 text-xl font-semibold text-ink">관리자 로그인</h1>
          <p className="mt-1 text-sm text-ink-muted">
            현장 관리 시스템에 접속합니다
          </p>
        </div>
        <LoginForm />
      </Card>
    </div>
  );
}
