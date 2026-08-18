import { customAlphabet } from "nanoid";

// 숫자/소문자만 사용 (혼동되는 0/O, 1/l/I 제외) — 사람이 옮겨 적어도 안전하도록.
const ALPHABET = "23456789abcdefghjkmnpqrstuvwxyz";
const LENGTH = 24;

const generate = customAlphabet(ALPHABET, LENGTH);

/**
 * 고객 페이지(/site/[token]) 접근용 고유 링크 토큰을 생성한다.
 * 32자 알파벳 기준 24자 = 약 120비트 엔트로피로, 추측이 사실상 불가능하다.
 */
export function generateSiteToken(): string {
  return generate();
}
