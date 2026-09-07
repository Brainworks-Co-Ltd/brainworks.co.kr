import { and, asc, eq, sql } from "drizzle-orm";
import { getDb } from "@/server/db/client";
import { honorLocales, honors } from "@/server/db/schema/honors";
import {
  assertCompleteLocales,
  assertDraftLocales,
  assertExpectedVersion,
} from "@/server/db/integrity";
import { HttpError } from "@/server/http/errors";
import type { HonorType } from "@/server/modules/honors/types";

export type HonorInput = {
  honorType: HonorType;
  occurredYear: number;
  occurredOn?: string | null;
  displayOrder: number;
  imageAssetId?: string | null;
  locales: {
    ko: {
      title: string;
      organization: string;
      description: string;
      imageAlt?: string;
    };
    en: {
      title: string;
      organization: string;
      description: string;
      imageAlt?: string;
    };
  };
};

type Transaction = Parameters<
  Parameters<ReturnType<typeof getDb>["transaction"]>[0]
>[0];

async function bump(
  tx: Transaction,
  id: string,
  expectedVersion: number,
  actorId: string,
) {
  const [updated] = await tx
    .update(honors)
    .set({
      version: sql`${honors.version} + 1`,
      updatedAt: new Date(),
      updatedByActorId: actorId,
    })
    .where(and(eq(honors.id, id), eq(honors.version, expectedVersion)))
    .returning({ id: honors.id, version: honors.version });
  if (!updated) throw new HttpError("VERSION_CONFLICT");
  return updated;
}

function validateDraft(input: HonorInput) {
  assertCompleteLocales(Object.keys(input.locales));
  assertDraftLocales(input.locales);
  if (
    !Number.isInteger(input.occurredYear) ||
    input.occurredYear < 1 ||
    !Number.isInteger(input.displayOrder) ||
    input.displayOrder < 1
  ) {
    throw new HttpError("PUBLICATION_INVALID");
  }
}

export async function listAdminHonors() {
  if (!process.env.DATABASE_URL) return [];
  const rows = await getDb()
    .select({
      id: honors.id,
      version: honors.version,
      itemStatus: honors.itemStatus,
      honorType: honors.honorType,
      occurredYear: honors.occurredYear,
      occurredOn: honors.occurredOn,
      displayOrder: honors.displayOrder,
      imageAssetId: honors.imageAssetId,
      locale: honorLocales.locale,
      title: honorLocales.title,
      publicationStatus: honorLocales.publicationStatus,
    })
    .from(honors)
    .innerJoin(honorLocales, eq(honorLocales.honorId, honors.id))
    .orderBy(asc(honors.honorType), asc(honors.displayOrder));
  const grouped = new Map<
    string,
    {
      id: string;
      version: number;
      itemStatus: (typeof rows)[number]["itemStatus"];
      honorType: HonorType;
      occurredYear: number;
      occurredOn: string | null;
      displayOrder: number;
      imageAssetId: string | null;
      locales: Record<
        string,
        {
          title: string;
          publicationStatus: (typeof rows)[number]["publicationStatus"];
        }
      >;
    }
  >();
  for (const row of rows) {
    const item = grouped.get(row.id) ?? {
      id: row.id,
      version: row.version,
      itemStatus: row.itemStatus,
      honorType: row.honorType,
      occurredYear: row.occurredYear,
      occurredOn: row.occurredOn ? String(row.occurredOn) : null,
      displayOrder: row.displayOrder,
      imageAssetId: row.imageAssetId,
      locales: {},
    };
    item.locales[row.locale] = {
      title: row.title,
      publicationStatus: row.publicationStatus,
    };
    grouped.set(row.id, item);
  }
  return Array.from(grouped.values());
}

export async function getAdminHonor(id: string) {
  const parent = await getDb().select().from(honors).where(eq(honors.id, id)).limit(1);
  if (!parent[0]) throw new HttpError("NOT_FOUND");
  const locales = await getDb()
    .select()
    .from(honorLocales)
    .where(eq(honorLocales.honorId, id));
  return { ...parent[0], locales };
}

export async function createHonor(input: HonorInput, actorId: string) {
  validateDraft(input);
  return getDb().transaction(async (tx) => {
    const [created] = await tx
      .insert(honors)
      .values({
        honorType: input.honorType,
        occurredYear: input.occurredYear,
        occurredOn: input.occurredOn ?? null,
        displayOrder: input.displayOrder,
        imageAssetId: input.imageAssetId ?? null,
        createdByActorId: actorId,
        updatedByActorId: actorId,
      })
      .returning({ id: honors.id, version: honors.version });
    await tx.insert(honorLocales).values(
      (Object.keys(input.locales) as ("ko" | "en")[]).map((locale) => ({
        honorId: created.id,
        locale,
        ...input.locales[locale],
        updatedByActorId: actorId,
      })),
    );
    return created;
  });
}

export async function saveHonor(
  id: string,
  input: HonorInput,
  expectedVersion: number,
  actorId: string,
) {
  validateDraft(input);
  return getDb().transaction(async (tx) => {
    const current = await tx.query.honors.findFirst({ where: eq(honors.id, id) });
    if (!current) throw new HttpError("NOT_FOUND");
    assertExpectedVersion(current.version, expectedVersion);
    await bump(tx, id, expectedVersion, actorId);
    await tx
      .update(honors)
      .set({
        honorType: input.honorType,
        occurredYear: input.occurredYear,
        occurredOn: input.occurredOn ?? null,
        displayOrder: input.displayOrder,
        imageAssetId: input.imageAssetId ?? null,
      })
      .where(eq(honors.id, id));
    for (const locale of ["ko", "en"] as const) {
      await tx
        .update(honorLocales)
        .set({
          ...input.locales[locale],
          updatedAt: new Date(),
          updatedByActorId: actorId,
        })
        .where(
          and(eq(honorLocales.honorId, id), eq(honorLocales.locale, locale)),
        );
    }
    return { id, version: expectedVersion + 1 };
  });
}

export async function publishHonor(
  id: string,
  locale: "ko" | "en",
  expectedVersion: number,
  actorId: string,
) {
  return getDb().transaction(async (tx) => {
    const current = await tx.query.honorLocales.findFirst({
      where: and(eq(honorLocales.honorId, id), eq(honorLocales.locale, locale)),
    });
    if (
      !current ||
      !current.title.trim() ||
      !current.organization.trim() ||
      !current.description.trim()
    )
      throw new HttpError("PUBLICATION_INVALID");
    await bump(tx, id, expectedVersion, actorId);
    const now = new Date();
    await tx
      .update(honorLocales)
      .set({
        publicationStatus: "PUBLISHED",
        firstPublishedAt: current.firstPublishedAt ?? now,
        lastPublishedAt: now,
        lastPublishedByActorId: actorId,
        updatedAt: now,
        updatedByActorId: actorId,
      })
      .where(and(eq(honorLocales.honorId, id), eq(honorLocales.locale, locale)));
    return { id, locale, version: expectedVersion + 1 };
  });
}

export async function hideHonor(
  id: string,
  locale: "ko" | "en",
  expectedVersion: number,
  actorId: string,
) {
  return getDb().transaction(async (tx) => {
    await bump(tx, id, expectedVersion, actorId);
    await tx
      .update(honorLocales)
      .set({
        publicationStatus: "HIDDEN",
        hiddenAt: new Date(),
        hiddenByActorId: actorId,
        updatedAt: new Date(),
        updatedByActorId: actorId,
      })
      .where(and(eq(honorLocales.honorId, id), eq(honorLocales.locale, locale)));
    return { id, locale, version: expectedVersion + 1 };
  });
}

export async function archiveHonor(
  id: string,
  expectedVersion: number,
  actorId: string,
) {
  return getDb().transaction(async (tx) => {
    await bump(tx, id, expectedVersion, actorId);
    await tx
      .update(honors)
      .set({
        itemStatus: "ARCHIVED",
        archivedAt: new Date(),
        archivedByActorId: actorId,
      })
      .where(eq(honors.id, id));
    return { id, version: expectedVersion + 1 };
  });
}

export async function restoreHonor(
  id: string,
  expectedVersion: number,
  actorId: string,
) {
  return getDb().transaction(async (tx) => {
    await bump(tx, id, expectedVersion, actorId);
    await tx
      .update(honors)
      .set({ itemStatus: "ACTIVE", archivedAt: null, archivedByActorId: null })
      .where(eq(honors.id, id));
    await tx
      .update(honorLocales)
      .set({
        publicationStatus: "DRAFT",
        updatedAt: new Date(),
        updatedByActorId: actorId,
      })
      .where(eq(honorLocales.honorId, id));
    return { id, version: expectedVersion + 1 };
  });
}
