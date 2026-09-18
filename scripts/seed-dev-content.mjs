/**
 * 개발 DB에 공개 콘텐츠를 채운다.
 *
 * 관리자 화면으로 옮기기 전의 원본은 저장소 안에 있다. 사업 영역 솔루션은
 * src/data/businessAreas.js, 뉴스는 src/content/news/*.md, 수상과 인증은
 * src/utils/awardsData.js와 certificationsData.js(운영 중인 사이트의 내역)다. 개발 DB가 비어
 * 있으면 메인의 솔루션 레일과 뉴스 레일이 제목만 남아 화면을 볼 수 없어서,
 * 같은 값을 그대로 DB에 넣어 관리자 경로로도 같은 화면이 나오게 한다.
 *
 * 여러 번 돌려도 같은 결과가 되도록 storage_key와 slug, (영역, 순서)를 키로
 * 삼아 있으면 갱신한다.
 *
 * 사용법: npx tsx --env-file=.env scripts/seed-dev-content.mjs
 *        (또는 set -a; . ./.env; set +a; node scripts/seed-dev-content.mjs)
 */
import { createHash } from "node:crypto";
import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import postgres from "postgres";
import { businessAreas } from "../src/data/businessAreas.js";
import awardsModule from "../src/utils/awardsData.js";
import certificationsModule from "../src/utils/certificationsData.js";

// 두 파일은 package.json에 type이 없어 CommonJS로 읽히면 default가 한 겹 감싸져 온다.
const awardsData = awardsModule.default ?? awardsModule;
const certificationsData = certificationsModule.default ?? certificationsModule;

const ROOT = process.cwd();
const PUBLIC_DIR = path.join(ROOT, "public");
const NEWS_DIR = path.join(ROOT, "src", "content", "news");
const LOCALES = ["ko", "en"];

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL이 없습니다.");
  process.exit(1);
}

const sql = postgres(process.env.DATABASE_URL, { max: 1 });

function parseNewsFile(raw) {
  const text = raw.replace(/^﻿/, "").replace(/\r\n/g, "\n");
  const match = text.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return null;
  const meta = JSON.parse(match[1]);
  const body = match[2];
  const ko = body.split("<!--ko-->")[1]?.split("<!--en-->")[0]?.trim() ?? "";
  const en = body.split("<!--en-->")[1]?.trim() ?? "";
  return { meta, body: { ko, en } };
}

async function ensureAsset(publicPath, actorId) {
  const storageKey = publicPath.replace(/^\/+/, "");
  const filePath = path.join(PUBLIC_DIR, storageKey);
  const info = await stat(filePath);
  const checksum = createHash("sha256")
    .update(await readFile(filePath))
    .digest("hex");
  // 관리자 화면에서 같은 파일을 다른 이름으로 올렸으면 checksum이 겹친다. 그 자산을 쓴다.
  const [same] = await sql`
    select id from assets where checksum = ${checksum} and storage_key <> ${storageKey} limit 1`;
  if (same) return same.id;
  const [row] = await sql`
    insert into assets
      (asset_type, status, storage_key, original_filename, bytes, checksum, created_by_actor_id)
    values
      ('IMAGE', 'READY', ${storageKey}, ${path.basename(storageKey)}, ${info.size}, ${checksum}, ${actorId})
    on conflict (storage_key) do update set status = 'READY'
    returning id`;
  return row.id;
}

async function seedSolutions(actorId) {
  const areaRows = await sql`select id, public_key from business_areas`;
  const areaIdByKey = new Map(areaRows.map((r) => [r.public_key, r.id]));
  let count = 0;

  for (const area of businessAreas) {
    const areaId = areaIdByKey.get(area.id);
    if (!areaId) {
      console.warn(`사업 영역 ${area.id}가 DB에 없어 건너뜁니다.`);
      continue;
    }
    for (const [index, solution] of area.solutions.entries()) {
      const assetId = await ensureAsset(solution.image, actorId);
      const [saved] = await sql`
        insert into ai_solutions
          (business_area_id, display_order, image_asset_id, created_by_actor_id, updated_by_actor_id)
        values
          (${areaId}, ${index + 1}, ${assetId}, ${actorId}, ${actorId})
        on conflict (business_area_id, display_order)
          do update set image_asset_id = excluded.image_asset_id,
                        item_status = 'ACTIVE',
                        updated_at = now()
        returning id`;
      for (const locale of LOCALES) {
        await sql`
          insert into ai_solution_locales
            (ai_solution_id, locale, publication_status, name, summary, description,
             updated_by_actor_id, first_published_at, last_published_at, last_published_by_actor_id)
          values
            (${saved.id}, ${locale}, 'PUBLISHED', ${solution.name[locale]},
             ${solution.description[locale]}, ${solution.description[locale]},
             ${actorId}, now(), now(), ${actorId})
          on conflict (ai_solution_id, locale)
            do update set publication_status = 'PUBLISHED',
                          name = excluded.name,
                          summary = excluded.summary,
                          description = excluded.description,
                          last_published_at = now(),
                          updated_at = now()`;
      }
      count += 1;
    }
  }
  return count;
}

async function seedNews(actorId) {
  const files = (await readdir(NEWS_DIR)).filter((name) =>
    name.endsWith(".md"),
  );
  let count = 0;

  for (const name of files) {
    const parsed = parseNewsFile(
      await readFile(path.join(NEWS_DIR, name), "utf8"),
    );
    if (!parsed) {
      console.warn(`${name} 앞머리를 읽지 못해 건너뜁니다.`);
      continue;
    }
    const { meta, body } = parsed;
    const coverId = meta.thumbnail
      ? await ensureAsset(meta.thumbnail, actorId)
      : null;

    const [existing] = await sql`
      select news_id from news_slugs where slug = ${meta.slug} limit 1`;

    let newsId = existing?.news_id;
    if (newsId) {
      await sql`
        update news
           set category = ${meta.category.ko},
               display_date = ${meta.date},
               cover_asset_id = ${coverId},
               item_status = 'ACTIVE',
               updated_at = now(),
               updated_by_actor_id = ${actorId}
         where id = ${newsId}`;
    } else {
      const [created] = await sql`
        insert into news
          (category, display_date, cover_asset_id, created_by_actor_id, updated_by_actor_id)
        values
          (${meta.category.ko}, ${meta.date}, ${coverId}, ${actorId}, ${actorId})
        returning id`;
      newsId = created.id;
      await sql`
        insert into news_slugs (news_id, slug, is_current, created_by_actor_id)
        values (${newsId}, ${meta.slug}, true, ${actorId})`;
    }

    for (const locale of LOCALES) {
      const title = meta.title?.[locale] ?? meta.title?.ko ?? meta.slug;
      const summary = meta.summary?.[locale] ?? meta.summary?.ko ?? title;
      await sql`
        insert into news_locales
          (news_id, locale, publication_status, title, summary, body_markdown,
           updated_by_actor_id, first_published_at, last_published_at, last_published_by_actor_id)
        values
          (${newsId}, ${locale}, 'PUBLISHED', ${title}, ${summary}, ${body[locale] || body.ko},
           ${actorId}, now(), now(), ${actorId})
        on conflict (news_id, locale)
          do update set publication_status = 'PUBLISHED',
                        title = excluded.title,
                        summary = excluded.summary,
                        body_markdown = excluded.body_markdown,
                        last_published_at = now(),
                        updated_at = now()`;
    }
    count += 1;
  }
  return count;
}

/*
 * honors에는 slug가 없어 (종류, 순서)를 키로 삼는다. 원본 배열 순서가 곧 표시 순서다.
 * 같은 키에 있던 다른 행(관리자 QA 테스트 등)은 원본 값으로 덮어쓴다.
 */
async function seedHonors(actorId) {
  const groups = [
    ["AWARD", awardsData],
    ["CERTIFICATION", certificationsData],
  ];
  let count = 0;

  for (const [type, items] of groups) {
    for (const [index, item] of items.entries()) {
      const assetId = item.image
        ? await ensureAsset(item.image, actorId)
        : null;
      const [saved] = await sql`
        insert into honors
          (honor_type, occurred_year, occurred_on, display_order, image_asset_id,
           created_by_actor_id, updated_by_actor_id)
        values
          (${type}, ${item.year}, ${item.date ?? null}, ${index + 1}, ${assetId},
           ${actorId}, ${actorId})
        on conflict (honor_type, display_order)
          do update set occurred_year = excluded.occurred_year,
                        occurred_on = excluded.occurred_on,
                        image_asset_id = excluded.image_asset_id,
                        item_status = 'ACTIVE',
                        updated_at = now()
        returning id`;
      for (const locale of LOCALES) {
        const title = item.title[locale] ?? item.title.ko;
        await sql`
          insert into honor_locales
            (honor_id, locale, publication_status, title, organization, description, image_alt,
             updated_by_actor_id, first_published_at, last_published_at, last_published_by_actor_id)
          values
            (${saved.id}, ${locale}, 'PUBLISHED', ${title},
             ${item.org[locale] ?? item.org.ko},
             ${item.description?.[locale] ?? item.description?.ko ?? ""},
             ${title},
             ${actorId}, now(), now(), ${actorId})
          on conflict (honor_id, locale)
            do update set publication_status = 'PUBLISHED',
                          title = excluded.title,
                          organization = excluded.organization,
                          description = excluded.description,
                          image_alt = excluded.image_alt,
                          last_published_at = now(),
                          updated_at = now()`;
      }
      count += 1;
    }
    // 원본보다 뒤 순서에 남은 행은 보관 처리해 공개 화면에서 뺀다.
    await sql`
      update honors set item_status = 'ARCHIVED', archived_at = now(),
                        archived_by_actor_id = ${actorId}, updated_at = now()
       where honor_type = ${type} and display_order > ${items.length}
         and item_status = 'ACTIVE'`;
  }
  return count;
}

const [actor] =
  await sql`select id from audit_actors order by created_at limit 1`;
if (!actor) {
  console.error("audit_actors가 비어 있습니다. 관리자 계정을 먼저 만드세요.");
  await sql.end();
  process.exit(1);
}

const solutions = await seedSolutions(actor.id);
const news = await seedNews(actor.id);
const honorCount = await seedHonors(actor.id);
console.log(
  `솔루션 ${solutions}건, 뉴스 ${news}건, 수상과 인증 ${honorCount}건을 넣었습니다.`,
);
await sql.end();
