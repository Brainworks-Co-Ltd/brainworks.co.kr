-- 뉴스 분류를 표시 이름에서 코드값(COMPANY, BUSINESS, PARTNERSHIP, AWARD)으로 바꾼다.
-- 화면 표시 이름은 src/lib/news-categories.js가 맡는다.

UPDATE "news" SET "category" = 'COMPANY'
WHERE "category" IN ('회사 소식', '회사소식', 'Company', '뉴스', 'News');
--> statement-breakpoint
UPDATE "news" SET "category" = 'BUSINESS'
WHERE "category" IN ('사업', 'Business');
--> statement-breakpoint
UPDATE "news" SET "category" = 'PARTNERSHIP'
WHERE "category" IN ('업무협약', 'Partnership', 'Partnerships');
--> statement-breakpoint
UPDATE "news" SET "category" = 'AWARD'
WHERE "category" IN ('수상', '수상 및 인증', 'Award', 'Awards');
--> statement-breakpoint

-- 기존 기사 13건은 모두 '회사 소식'으로 들어가 있었다. 내용에 맞게 다시 나눈다.
-- 관리자가 이미 다른 분류로 바꾼 기사는 건드리지 않도록 COMPANY인 것만 고친다.
UPDATE "news" SET "category" = 'BUSINESS'
WHERE "category" = 'COMPANY' AND "id" IN (
  SELECT "news_id" FROM "news_slugs" WHERE "slug" IN (
    'legend50-generative-ai',
    'chungnam-research-ai-workshop',
    'dsc-bigdata-ai-hackathon-2024',
    'ris-ai-talent-program-2025',
    'jeonnam-technopark-ai-training-2025'
  )
);
--> statement-breakpoint
UPDATE "news" SET "category" = 'PARTNERSHIP'
WHERE "category" = 'COMPANY' AND "id" IN (
  SELECT "news_id" FROM "news_slugs" WHERE "slug" IN (
    'soonchunhyang-mou-2025',
    'gyeongbuk-meister-mou-2025',
    'kongju-future-mobility-mou-2025',
    'inje-university-mou-2025',
    'jakarta-digital-bridge-mou-2025',
    'global-partnership-2025-youstation-jinsystem'
  )
);
--> statement-breakpoint
UPDATE "news" SET "category" = 'AWARD'
WHERE "category" = 'COMPANY' AND "id" IN (
  SELECT "news_id" FROM "news_slugs" WHERE "slug" = 'ai-process-anomaly-award-2025'
);
