import { and, asc, eq, sql } from "drizzle-orm";
import { getDb } from "@/server/db/client";
import { assets } from "@/server/db/schema/assets";
import {
  aiSolutionLocales,
  aiSolutions,
  businessAreas,
} from "@/server/db/schema/catalog";
import {
  assertCompleteLocales,
  assertDraftLocales,
  assertExpectedVersion,
} from "@/server/db/integrity";
import { HttpError } from "@/server/http/errors";

import type { AiSolutionInput } from "@/server/modules/catalog/schema";

export type { AiSolutionInput };

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
    .update(aiSolutions)
    .set({
      version: sql`${aiSolutions.version} + 1`,
      updatedAt: new Date(),
      updatedByActorId: actorId,
    })
    .where(and(eq(aiSolutions.id, id), eq(aiSolutions.version, expectedVersion)))
    .returning({ id: aiSolutions.id, version: aiSolutions.version });
  if (!updated) throw new HttpError("VERSION_CONFLICT");
  return updated;
}

function validateDraft(input: AiSolutionInput) {
  assertCompleteLocales(Object.keys(input.locales));
  assertDraftLocales({
    ko: { title: input.locales.ko.name },
    en: { title: input.locales.en.name },
  });
  if (
    !input.businessAreaId ||
    !Number.isInteger(input.displayOrder) ||
    input.displayOrder < 1
  ) {
    throw new HttpError("PUBLICATION_INVALID");
  }
}

export async function listAdminBusinessAreaOptions() {
  if (!process.env.DATABASE_URL) return [];
  return getDb()
    .select({
      id: businessAreas.id,
      publicKey: businessAreas.publicKey,
      displayOrder: businessAreas.displayOrder,
    })
    .from(businessAreas)
    .where(eq(businessAreas.itemStatus, "ACTIVE"))
    .orderBy(asc(businessAreas.displayOrder));
}

export async function listAdminAiSolutions() {
  if (!process.env.DATABASE_URL) return [];
  const rows = await getDb()
    .select({
      id: aiSolutions.id,
      version: aiSolutions.version,
      itemStatus: aiSolutions.itemStatus,
      businessAreaId: aiSolutions.businessAreaId,
      businessAreaKey: businessAreas.publicKey,
      displayOrder: aiSolutions.displayOrder,
      imageAssetId: aiSolutions.imageAssetId,
      locale: aiSolutionLocales.locale,
      name: aiSolutionLocales.name,
      publicationStatus: aiSolutionLocales.publicationStatus,
    })
    .from(aiSolutions)
    .innerJoin(businessAreas, eq(businessAreas.id, aiSolutions.businessAreaId))
    .innerJoin(
      aiSolutionLocales,
      eq(aiSolutionLocales.aiSolutionId, aiSolutions.id),
    )
    .orderBy(asc(businessAreas.displayOrder), asc(aiSolutions.displayOrder));
  const grouped = new Map<
    string,
    {
      id: string;
      version: number;
      itemStatus: (typeof rows)[number]["itemStatus"];
      businessAreaId: string;
      businessAreaKey: string;
      displayOrder: number;
      imageAssetId: string | null;
      locales: Record<
        string,
        {
          name: string;
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
      businessAreaId: row.businessAreaId,
      businessAreaKey: row.businessAreaKey,
      displayOrder: row.displayOrder,
      imageAssetId: row.imageAssetId,
      locales: {},
    };
    item.locales[row.locale] = {
      name: row.name,
      publicationStatus: row.publicationStatus,
    };
    grouped.set(row.id, item);
  }
  return Array.from(grouped.values());
}

export async function getAdminAiSolution(id: string) {
  const parent = await getDb()
    .select()
    .from(aiSolutions)
    .where(eq(aiSolutions.id, id))
    .limit(1);
  if (!parent[0]) throw new HttpError("NOT_FOUND");
  const locales = await getDb()
    .select()
    .from(aiSolutionLocales)
    .where(eq(aiSolutionLocales.aiSolutionId, id));
  return { ...parent[0], locales };
}

export async function createAiSolution(input: AiSolutionInput, actorId: string) {
  validateDraft(input);
  return getDb().transaction(async (tx) => {
    const [created] = await tx
      .insert(aiSolutions)
      .values({
        businessAreaId: input.businessAreaId,
        displayOrder: input.displayOrder,
        imageAssetId: input.imageAssetId ?? null,
        createdByActorId: actorId,
        updatedByActorId: actorId,
      })
      .returning({ id: aiSolutions.id, version: aiSolutions.version });
    await tx.insert(aiSolutionLocales).values(
      (Object.keys(input.locales) as ("ko" | "en")[]).map((locale) => ({
        aiSolutionId: created.id,
        locale,
        ...input.locales[locale],
        updatedByActorId: actorId,
      })),
    );
    return created;
  });
}

export async function saveAiSolution(
  id: string,
  input: AiSolutionInput,
  expectedVersion: number,
  actorId: string,
) {
  validateDraft(input);
  return getDb().transaction(async (tx) => {
    const current = await tx.query.aiSolutions.findFirst({
      where: eq(aiSolutions.id, id),
    });
    if (!current) throw new HttpError("NOT_FOUND");
    assertExpectedVersion(current.version, expectedVersion);
    await bump(tx, id, expectedVersion, actorId);
    await tx
      .update(aiSolutions)
      .set({
        businessAreaId: input.businessAreaId,
        displayOrder: input.displayOrder,
        imageAssetId: input.imageAssetId ?? null,
      })
      .where(eq(aiSolutions.id, id));
    for (const locale of ["ko", "en"] as const) {
      await tx
        .update(aiSolutionLocales)
        .set({
          ...input.locales[locale],
          updatedAt: new Date(),
          updatedByActorId: actorId,
        })
        .where(
          and(
            eq(aiSolutionLocales.aiSolutionId, id),
            eq(aiSolutionLocales.locale, locale),
          ),
        );
    }
    return { id, version: expectedVersion + 1 };
  });
}

export async function publishAiSolution(
  id: string,
  locale: "ko" | "en",
  expectedVersion: number,
  actorId: string,
) {
  return getDb().transaction(async (tx) => {
    const parent = await tx.query.aiSolutions.findFirst({
      where: eq(aiSolutions.id, id),
    });
    const current = await tx.query.aiSolutionLocales.findFirst({
      where: and(
        eq(aiSolutionLocales.aiSolutionId, id),
        eq(aiSolutionLocales.locale, locale),
      ),
    });
    if (
      !parent ||
      !current ||
      !current.name.trim() ||
      !current.summary.trim() ||
      !current.description.trim() ||
      !current.imageAlt?.trim() ||
      !parent.imageAssetId
    ) {
      throw new HttpError("PUBLICATION_INVALID");
    }
    const image = await tx
      .select({ id: assets.id })
      .from(assets)
      .where(and(eq(assets.id, parent.imageAssetId), eq(assets.status, "READY")))
      .limit(1);
    if (!image[0]) throw new HttpError("PUBLICATION_INVALID");
    await bump(tx, id, expectedVersion, actorId);
    const now = new Date();
    await tx
      .update(aiSolutionLocales)
      .set({
        publicationStatus: "PUBLISHED",
        firstPublishedAt: current.firstPublishedAt ?? now,
        lastPublishedAt: now,
        lastPublishedByActorId: actorId,
        updatedAt: now,
        updatedByActorId: actorId,
      })
      .where(
        and(
          eq(aiSolutionLocales.aiSolutionId, id),
          eq(aiSolutionLocales.locale, locale),
        ),
      );
    return { id, locale, version: expectedVersion + 1 };
  });
}

export async function hideAiSolution(
  id: string,
  locale: "ko" | "en",
  expectedVersion: number,
  actorId: string,
) {
  return getDb().transaction(async (tx) => {
    await bump(tx, id, expectedVersion, actorId);
    await tx
      .update(aiSolutionLocales)
      .set({
        publicationStatus: "HIDDEN",
        hiddenAt: new Date(),
        hiddenByActorId: actorId,
        updatedAt: new Date(),
        updatedByActorId: actorId,
      })
      .where(
        and(
          eq(aiSolutionLocales.aiSolutionId, id),
          eq(aiSolutionLocales.locale, locale),
        ),
      );
    return { id, locale, version: expectedVersion + 1 };
  });
}

export async function archiveAiSolution(
  id: string,
  expectedVersion: number,
  actorId: string,
) {
  return getDb().transaction(async (tx) => {
    await bump(tx, id, expectedVersion, actorId);
    await tx
      .update(aiSolutions)
      .set({
        itemStatus: "ARCHIVED",
        archivedAt: new Date(),
        archivedByActorId: actorId,
      })
      .where(eq(aiSolutions.id, id));
    return { id, version: expectedVersion + 1 };
  });
}

export async function restoreAiSolution(
  id: string,
  expectedVersion: number,
  actorId: string,
) {
  return getDb().transaction(async (tx) => {
    await bump(tx, id, expectedVersion, actorId);
    await tx
      .update(aiSolutions)
      .set({ itemStatus: "ACTIVE", archivedAt: null, archivedByActorId: null })
      .where(eq(aiSolutions.id, id));
    await tx
      .update(aiSolutionLocales)
      .set({
        publicationStatus: "DRAFT",
        updatedAt: new Date(),
        updatedByActorId: actorId,
      })
      .where(eq(aiSolutionLocales.aiSolutionId, id));
    return { id, version: expectedVersion + 1 };
  });
}
