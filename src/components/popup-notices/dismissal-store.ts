type DismissalRecord = { revision: number; day?: string };

function sessionKey(id: string, revision: number) {
  return `brainworks:popup:session:${id}:${revision}`;
}

function dayKey(id: string) {
  return `brainworks:popup:day:${id}`;
}

const DAY_FORMATTER = new Intl.DateTimeFormat("sv-SE");

function today() {
  return DAY_FORMATTER.format(new Date());
}

export function isDismissed(id: string, revision: number) {
  if (typeof window === "undefined") return false;
  try {
    if (window.sessionStorage.getItem(sessionKey(id, revision)) === "1") return true;
    const value = JSON.parse(window.localStorage.getItem(dayKey(id)) || "null") as DismissalRecord | null;
    return value?.revision === revision && value.day === today();
  } catch {
    return false;
  }
}

export function dismissForSession(id: string, revision: number) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(sessionKey(id, revision), "1");
  } catch {
    // 스토리지 차단 환경(시크릿 모드 등)에서는 기록을 포기하고 닫기 동작은 계속한다
  }
}

export function dismissForDay(id: string, revision: number) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(dayKey(id), JSON.stringify({ revision, day: today() } satisfies DismissalRecord));
  } catch {
    // 스토리지 차단 환경(시크릿 모드 등)에서는 기록을 포기하고 닫기 동작은 계속한다
  }
}
