import { getLocalizedBusinessAreas } from "@/data/businessAreas";

/**
 * 사업 영역은 멘토님 요구에 따라 관리자 운영 콘텐츠가 아닌 고정 공개 분류다.
 * AI 솔루션 관리 기능이 완성되기 전까지 홈과 솔루션 페이지는 같은 승인 데이터를 사용한다.
 */
export async function getPublishedBusinessAreas(locale: "ko" | "en") {
  return getLocalizedBusinessAreas(locale);
}
