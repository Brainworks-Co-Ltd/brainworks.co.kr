type DismissalRecord = { revision: number; day?: string };

function sessionKey(id: string, revision: number) {
  return `brainworks:popup:session:${id}:${revision}`;
}

function dayKey(id: string) {
  return `brainworks:popup:day:${id}`;
}

function today() {
  return new Intl.DateTimeFormat("sv-SE").format(new Date());
}

export function isDismissed(id: string, revision: number) {
  if (typeof window === "undefined") return false;
  if (window.sessionStorage.getItem(sessionKey(id, revision)) === "1") return true;
  try {
    const value = JSON.parse(window.localStorage.getItem(dayKey(id)) || "null") as DismissalRecord | null;
    return value?.revision === revision && value.day === today();
  } catch {
    return false;
  }
}

export function dismissForSession(id: string, revision: number) {
  if (typeof window !== "undefined") window.sessionStorage.setItem(sessionKey(id, revision), "1");
}

export function dismissForDay(id: string, revision: number) {
  if (typeof window !== "undefined") window.localStorage.setItem(dayKey(id), JSON.stringify({ revision, day: today() } satisfies DismissalRecord));
}
