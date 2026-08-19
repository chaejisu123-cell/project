export const PHOTOS_BUCKET = "site-photos";
export const RECEIPTS_BUCKET = "receipt-images";

/** 공수관리 표에 처음부터 채워두는 기본 공종 목록. 현장을 새로 만들면 이 순서로
 * 시작하고, 관리자가 "+ 공정 추가"/삭제로 자유롭게 바꿀 수 있다. */
export const DEFAULT_LABOR_PROCESSES = [
  "가설.철거",
  "전기",
  "경량",
  "목공",
  "냉.난방",
  "설비",
  "타일",
  "필름",
  "도배",
  "도장",
  "바닥",
] as const;

export const PROCESS_TAGS = [
  "철거",
  "설비",
  "전기",
  "목공",
  "도장",
  "타일",
  "도배",
  "마루",
  "조명",
  "가구",
  "청소",
  "기타",
] as const;
