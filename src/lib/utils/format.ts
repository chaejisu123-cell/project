const KRW = new Intl.NumberFormat("ko-KR");

/** 숫자를 "12,345,000원" 형태로 표기한다. */
export function formatWon(amount: number): string {
  return `${KRW.format(amount)}원`;
}

/** ISO 날짜 문자열을 "2026.08.18" 형태로 표기한다. */
export function formatDate(value: string | null | undefined): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}.${m}.${d}`;
}
