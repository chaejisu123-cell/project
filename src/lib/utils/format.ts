const KRW = new Intl.NumberFormat("ko-KR");

/** 숫자를 "12,345,000원" 형태로 표기한다. */
export function formatWon(amount: number): string {
  return `${KRW.format(amount)}원`;
}

/**
 * 공수(인원수)·자재 수량처럼 소수점이 있을 수도 없을 수도 있는 숫자를 표기한다.
 * 정수는 소수점 없이, 0.5 같은 값은 그대로 표시한다.
 */
export function formatNumber(
  value: number,
  maximumFractionDigits = 1,
): string {
  return new Intl.NumberFormat("ko-KR", { maximumFractionDigits }).format(
    value,
  );
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

/**
 * "YYYY-MM-DD" 형태의 순수 날짜 문자열을 "2026년 8월 19일"로 표기한다.
 * Date 객체를 거치지 않고 문자열을 직접 분해해서, 시간대 차이로 날짜가
 * 하루 밀리는 문제를 원천적으로 피한다.
 */
export function formatDateHeading(value: string): string {
  const [year, month, day] = value.split("-").map(Number);
  return `${year}년 ${month}월 ${day}일`;
}
