// 변환 기준은 이 코드를 실행하는 프로세스의 시간대다.
// getServerSideProps에서 호출하면 서버 프로세스 시간대가 기준이 되므로,
// 관리자에게 보이는 벽시계 값이 맞으려면 서버가 관리자 시간대로 돌아야 한다.
// ops/pm2/ecosystem.config.cjs가 TZ=Asia/Seoul로 고정한다.
export function toDateTimeLocal(value: Date | string | null | undefined): string {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const shifted = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return shifted.toISOString().slice(0, 16);
}
