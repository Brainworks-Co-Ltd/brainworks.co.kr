/*
 * 운영 현황 기준값. 화면과 서버가 같이 쓴다.
 * 서버 모듈(src/server/modules/admin/dashboard.ts)의 값을 화면에서 직접 가져오면
 * DB 클라이언트까지 브라우저 묶음에 딸려 들어가 빌드가 깨진다.
 */

/** 같은 언어로 동시에 노출할 수 있는 팝업 수. 서버의 POPUP_OVERLAP_LIMIT와 같다. */
export const POPUP_LIMIT = 3;
/** 이 기간 안에 시작하거나 끝나는 게시를 모은다. */
export const UPCOMING_DAYS = 7;
/** 이 기간 넘게 손대지 않은 초안에 표시를 붙인다. */
export const STALE_DRAFT_DAYS = 30;
/** 백업은 6시간마다 돈다. 두 번 연달아 빠지면 경고한다. */
export const BACKUP_MAX_AGE_HOURS = 12;
/** 서버 디스크 사용률 경고 기준 */
export const DISK_WARNING_RATIO = 0.8;
/** 최근 변경에 보여 줄 항목 수 */
export const RECENT_LIMIT = 8;
