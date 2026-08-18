export default async function CustomerSitePage(
  props: PageProps<"/site/[token]">,
) {
  // 2단계에서 토큰으로 현장을 조회해 사진/공정표/공지사항을 보여줄 예정.
  await props.params;

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-2 bg-surface px-4 text-center">
      <p className="text-xs font-medium uppercase tracking-widest text-accent">
        OFFERHOUSE
      </p>
      <h1 className="text-lg font-semibold text-ink">
        현장 페이지 준비 중입니다
      </h1>
      <p className="max-w-sm text-sm text-ink-muted">
        사진, 공정표, 공지사항을 확인하실 수 있는 화면은 다음 단계에서
        만들어질 예정입니다.
      </p>
    </div>
  );
}
