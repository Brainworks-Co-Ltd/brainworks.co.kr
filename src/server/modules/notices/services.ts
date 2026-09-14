import type { NoticeCommandInput, NoticeLocale, NoticePublicationWindow } from "@/server/modules/notices/contracts";
import { archiveNotice, createNotice, publishNotice, restoreNotice, saveNotice, unpublishNotice } from "@/server/modules/notices/repository";

export { createNotice, saveNotice, publishNotice, unpublishNotice, archiveNotice, restoreNotice };

export function scheduleNotice(id: string, locale: NoticeLocale, expectedVersion: number, actorId: string, startsAt: Date, endsAt?: Date | null) {
  return publishNotice(id, locale, expectedVersion, actorId, { startsAt, endsAt } satisfies NoticePublicationWindow);
}

export type { NoticeCommandInput };
