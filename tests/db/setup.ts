import { eq, sql } from "drizzle-orm";
import { afterAll, beforeAll } from "vitest";

export const hasTestDatabase = Boolean(process.env.DATABASE_TEST_URL);

// getDb()는 DATABASE_URL만 읽는다. 테스트 프로세스 안에서만 테스트 DB로 덮어쓰고,
// 테스트 DB가 없으면 개발 DB에 붙는 사고를 막기 위해 아예 지운다.
if (hasTestDatabase) {
  process.env.DATABASE_URL = process.env.DATABASE_TEST_URL;
} else {
  delete process.env.DATABASE_URL;
}

// 시드가 남아야 하는 테이블(business_areas, business_area_locales, audit_actors,
// 인증 테이블)은 제외한 콘텐츠 테이블 목록.
const contentTables = [
  "notice_attachments",
  "notice_slugs",
  "notice_locales",
  "notices",
  "notice_category_locales",
  "notice_categories",
  "popup_notice_locales",
  "popup_notices",
  "news_body_asset_refs",
  "news_external_links",
  "news_locales",
  "news_slugs",
  "news",
  "honor_locales",
  "honors",
  "ai_solution_locales",
  "ai_solutions",
  "contact_submission_receipts",
];

async function truncateContentTables() {
  const { getDb } = await import("@/server/db/client");
  // assets는 business_areas가 참조하므로 CASCADE 대상에 넣으면 시드까지 날아간다.
  // 자식 테이블을 먼저 비운 뒤 DELETE로 지운다.
  await getDb().execute(
    sql.raw(
      `truncate table ${contentTables.map((table) => `"${table}"`).join(", ")} restart identity cascade`,
    ),
  );
  await getDb().execute(sql.raw(`delete from "assets"`));
}

const testAdminEmail = "db-test-admin@brainworks.local";

async function createTestActor() {
  const { getDb } = await import("@/server/db/client");
  const { adminAccounts } = await import("@/server/db/schema/auth");
  const { provisionAdminAccount } =
    await import("@/server/auth/provision-admin");
  const { ensureNoticeAdminActor } =
    await import("@/server/modules/notices/repository");

  const existing = await getDb()
    .select({ id: adminAccounts.id })
    .from(adminAccounts)
    .where(eq(adminAccounts.email, testAdminEmail))
    .limit(1);
  const adminAccountId =
    existing[0]?.id ??
    (
      await provisionAdminAccount({
        email: testAdminEmail,
        name: "DB 테스트 관리자",
        password: "db-test-password",
        passwordConfirmation: "db-test-password",
      })
    ).id;

  return ensureNoticeAdminActor(adminAccountId);
}

let actorId: Promise<string> | undefined;

/** 테스트용 관리자 액터 id. 파일마다 한 번만 만들고 재사용한다. */
export function getTestActorId() {
  actorId ??= createTestActor();
  return actorId;
}

beforeAll(async () => {
  if (!hasTestDatabase) return;
  await truncateContentTables();
});

afterAll(async () => {
  if (!hasTestDatabase) return;
  const { closeDb } = await import("@/server/db/client");
  await closeDb();
});
