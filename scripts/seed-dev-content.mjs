/**
 * 개발 DB에 공개 콘텐츠를 채운다.
 *
 * 관리자 화면으로 옮기기 전의 원본은 저장소 안에 있다. 사업 영역 솔루션은
 * src/data/businessAreas.js, 뉴스는 src/content/news/*.md 다. 개발 DB가 비어
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

const [actor] =
  await sql`select id from audit_actors order by created_at limit 1`;
if (!actor) {
  console.error("audit_actors가 비어 있습니다. 관리자 계정을 먼저 만드세요.");
  await sql.end();
  process.exit(1);
}

const solutions = await seedSolutions(actor.id);
const news = await seedNews(actor.id);
console.log(`솔루션 ${solutions}건, 뉴스 ${news}건을 넣었습니다.`);
await sql.end();
