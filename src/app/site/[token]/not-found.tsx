export default function SiteNotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-2 bg-surface px-4 text-center">
      <p className="text-xs font-medium uppercase tracking-widest text-accent">
        OFFERHOUSE
      </p>
      <h1 className="text-lg font-semibold text-ink">
        페이지를 찾을 수 없습니다
      </h1>
      <p className="max-w-sm text-sm text-ink-muted">
        링크 주소를 다시 확인해주세요. 문제가 계속되면 담당자에게 문의해주세요.
      </p>
    </div>
  );
}
