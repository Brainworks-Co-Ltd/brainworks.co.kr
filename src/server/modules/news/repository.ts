import { and, eq, sql } from "drizzle-orm";
import { getDb } from "@/server/db/client";
import { auditActors } from "@/server/db/schema/audit";
import { news, newsLocales, newsSlugs } from "@/server/db/schema/news";
import {
  assertCompleteLocales,
  assertDraftLocales,
  assertExpectedVersion,
} from "@/server/db/integrity";
import { assertValidNewsSlug } from "@/server/modules/news/publication-policy";
import { HttpError } from "@/server/http/errors";

export type NewsCommandInput = {
  slug: string;
  category: string;
  displayDate: string;
  locales: {
    ko: {
      title: string;
      summary: string;
      bodyMarkdown: string;
      coverAlt?: string;
    };
    en: {
      title: string;
      summary: string;
      bodyMarkdown: string;
      coverAlt?: string;
    };
  };
};

async function bumpNewsVersion(
  tx: Parameters<Parameters<ReturnType<typeof getDb>["transaction"]>[0]>[0],
  id: string,
  expectedVersion: number,
  actorId: string,
) {
  const [updated] = await tx
    .update(news)
    .set({
      version: sql`${news.version} + 1`,
      updatedAt: new Date(),
      updatedByActorId: actorId,
    })
    .where(and(eq(news.id, id), eq(news.version, expectedVersion)))
    .returning({ id: news.id, version: news.version });
  if (!updated) throw new HttpError("VERSION_CONFLICT");
  return updated;
}

export async function createNews(input: NewsCommandInput, actorId: string) {
  assertCompleteLocales(Object.keys(input.locales));
  assertDraftLocales(input.locales);
  assertValidNewsSlug(input.slug);
  const db = getDb();
  return db.transaction(async (tx) => {
    const [created] = await tx
      .insert(news)
      .values({
        category: input.category,
        displayDate: input.displayDate,
        bodyFormat: "MARKDOWN_V1",
        createdByActorId: actorId,
        updatedByActorId: actorId,
      })
      .returning({ id: news.id, version: news.version });
    await tx.insert(newsLocales).values(
      (Object.keys(input.locales) as ("ko" | "en")[]).map((locale) => ({
        newsId: created.id,
        locale,
        title: input.locales[locale].title,
        summary: input.locales[locale].summary,
        bodyMarkdown: input.locales[locale].bodyMarkdown,
        coverAlt: input.locales[locale].coverAlt,
        updatedByActorId: actorId,
      })),
    );
    await tx.insert(newsSlugs).values({
      newsId: created.id,
      slug: input.slug,
      createdByActorId: actorId,
    });
    return created;
  });
}

export async function getAdminNews(id: string) {
  const db = getDb();
  const parent = await db.select().from(news).where(eq(news.id, id)).limit(1);
  if (!parent[0]) throw new HttpError("NOT_FOUND");
  const locales = await db
    .select()
    .from(newsLocales)
    .where(eq(newsLocales.newsId, id));
  const slug = await db
    .select({ slug: newsSlugs.slug })
    .from(newsSlugs)
    .where(and(eq(newsSlugs.newsId, id), eq(newsSlugs.isCurrent, true)))
    .limit(1);
  return { ...parent[0], slug: slug[0]?.slug || "", locales };
}

export async function saveNews(
  id: string,
  input: NewsCommandInput,
  expectedVersion: number,
  actorId: string,
) {
  assertCompleteLocales(Object.keys(input.locales));
  assertDraftLocales(input.locales);
  assertValidNewsSlug(input.slug);
  const db = getDb();
  return db.transaction(async (tx) => {
    const current = await tx.query.news.findFirst({ where: eq(news.id, id) });
    if (!current) throw new HttpError("NOT_FOUND");
    assertExpectedVersion(current.version, expectedVersion);
    await bumpNewsVersion(tx, id, expectedVersion, actorId);
    await tx
      .update(news)
      .set({ category: input.category, displayDate: input.displayDate })
      .where(eq(news.id, id));
    for (const locale of ["ko", "en"] as const) {
      await tx
        .update(newsLocales)
        .set({
          ...input.locales[locale],
          updatedAt: new Date(),
          updatedByActorId: actorId,
        })
        .where(and(eq(newsLocales.newsId, id), eq(newsLocales.locale, locale)));
    }
    return { id, version: expectedVersion + 1 };
  });
}

export async function publishNewsLocale(
  id: string,
  locale: "ko" | "en",
  expectedVersion: number,
  actorId: string,
) {
  const db = getDb();
  return db.transaction(async (tx) => {
    const current = await tx.query.newsLocales.findFirst({
      where: and(eq(newsLocales.newsId, id), eq(newsLocales.locale, locale)),
    });
    if (!current || !current.title.trim() || !current.bodyMarkdown.trim())
      throw new HttpError("PUBLICATION_INVALID");
    await bumpNewsVersion(tx, id, expectedVersion, actorId);
    await tx
      .update(newsLocales)
      .set({
        publicationStatus: "PUBLISHED",
        firstPublishedAt: current.firstPublishedAt || new Date(),
        lastPublishedAt: new Date(),
        lastPublishedByActorId: actorId,
        updatedAt: new Date(),
        updatedByActorId: actorId,
      })
      .where(and(eq(newsLocales.newsId, id), eq(newsLocales.locale, locale)));
    return { id, locale, version: expectedVersion + 1 };
  });
}

export async function hideNewsLocale(
  id: string,
  locale: "ko" | "en",
  expectedVersion: number,
  actorId: string,
) {
  const db = getDb();
  return db.transaction(async (tx) => {
    await bumpNewsVersion(tx, id, expectedVersion, actorId);
    await tx
      .update(newsLocales)
      .set({
        publicationStatus: "HIDDEN",
        hiddenAt: new Date(),
        hiddenByActorId: actorId,
        updatedAt: new Date(),
        updatedByActorId: actorId,
      })
      .where(and(eq(newsLocales.newsId, id), eq(newsLocales.locale, locale)));
    return { id, locale, version: expectedVersion + 1 };
  });
}

export async function archiveNews(
  id: string,
  expectedVersion: number,
  actorId: string,
) {
  const db = getDb();
  return db.transaction(async (tx) => {
    await bumpNewsVersion(tx, id, expectedVersion, actorId);
    await tx
      .update(news)
      .set({
        itemStatus: "ARCHIVED",
        archivedAt: new Date(),
        archivedByActorId: actorId,
      })
      .where(eq(news.id, id));
    return { id, version: expectedVersion + 1 };
  });
}

export async function restoreNews(
  id: string,
  expectedVersion: number,
  actorId: string,
) {
  const db = getDb();
  return db.transaction(async (tx) => {
    await bumpNewsVersion(tx, id, expectedVersion, actorId);
    await tx
      .update(news)
      .set({ itemStatus: "ACTIVE", archivedAt: null, archivedByActorId: null })
      .where(eq(news.id, id));
    await tx
      .update(newsLocales)
      .set({
        publicationStatus: "DRAFT",
        updatedAt: new Date(),
        updatedByActorId: actorId,
      })
      .where(eq(newsLocales.newsId, id));
    return { id, version: expectedVersion + 1 };
  });
}

export async function changeNewsSlug(
  id: string,
  newSlug: string,
  expectedVersion: number,
  actorId: string,
) {
  const db = getDb();
  return db.transaction(async (tx) => {
    const current = await tx.query.newsSlugs.findFirst({
      where: and(eq(newsSlugs.newsId, id), eq(newsSlugs.isCurrent, true)),
    });
    if (!current) throw new HttpError("NOT_FOUND");
    await bumpNewsVersion(tx, id, expectedVersion, actorId);
    await tx
      .update(newsSlugs)
      .set({ isCurrent: false })
      .where(eq(newsSlugs.id, current.id));
    await tx
      .insert(newsSlugs)
      .values({ newsId: id, slug: newSlug, createdByActorId: actorId });
    return { id, slug: newSlug, version: expectedVersion + 1 };
  });
}

export async function ensureAdminActor(adminAccountId: string) {
  const db = getDb();
  const existing = await db.query.auditActors.findFirst({
    where: eq(auditActors.adminAccountId, adminAccountId),
  });
  if (existing) return existing.id;
  const [created] = await db
    .insert(auditActors)
    .values({ actorType: "ADMIN", adminAccountId, displayName: "관리자" })
    .returning({ id: auditActors.id });
  return created.id;
}
