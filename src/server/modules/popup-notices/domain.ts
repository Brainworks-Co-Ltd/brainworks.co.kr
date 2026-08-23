import { HttpError } from "@/server/http/errors";

type PopupInterval = { startsAt: string | Date; endsAt?: string | Date | null };

export function overlaps(a: PopupInterval, b: PopupInterval) {
  const aStart = new Date(a.startsAt).getTime();
  const aEnd = a.endsAt ? new Date(a.endsAt).getTime() : Number.POSITIVE_INFINITY;
  const bStart = new Date(b.startsAt).getTime();
  const bEnd = b.endsAt ? new Date(b.endsAt).getTime() : Number.POSITIVE_INFINITY;
  return aStart < bEnd && bStart < aEnd;
}

export function assertPopupOverlapLimit(intervals: PopupInterval[], limit = 3) {
  const points = intervals.flatMap((interval) => [
    { time: new Date(interval.startsAt).getTime(), delta: 1 },
    { time: interval.endsAt ? new Date(interval.endsAt).getTime() : Number.POSITIVE_INFINITY, delta: -1 },
  ]).sort((a, b) => a.time - b.time || a.delta - b.delta);
  let active = 0;
  for (const point of points) {
    active += point.delta;
    if (active > limit) throw new HttpError("POPUP_OVERLAP_LIMIT");
  }
}

export function getVisiblePopupLimit() {
  return 3;
}
