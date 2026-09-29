-- Custom SQL migration file, put your code below! --

-- 고정 시스템 액터: 마이그레이션이 시드하는 행의 created_by/updated_by를 채운다.
INSERT INTO "audit_actors" ("id", "actor_type", "system_key", "display_name")
SELECT '00000000-0000-0000-0000-000000000001', 'SYSTEM', 'seed-migration', '시스템 시드'
WHERE NOT EXISTS (
  SELECT 1 FROM "audit_actors" WHERE "id" = '00000000-0000-0000-0000-000000000001'
);
--> statement-breakpoint

INSERT INTO "business_areas" ("id", "public_key", "display_order", "created_by_actor_id", "updated_by_actor_id")
SELECT gen_random_uuid(), 'manufacturing', 1, '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001'
WHERE NOT EXISTS (SELECT 1 FROM "business_areas" WHERE "public_key" = 'manufacturing');
--> statement-breakpoint

INSERT INTO "business_areas" ("id", "public_key", "display_order", "created_by_actor_id", "updated_by_actor_id")
SELECT gen_random_uuid(), 'agent', 2, '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001'
WHERE NOT EXISTS (SELECT 1 FROM "business_areas" WHERE "public_key" = 'agent');
--> statement-breakpoint

INSERT INTO "business_areas" ("id", "public_key", "display_order", "created_by_actor_id", "updated_by_actor_id")
SELECT gen_random_uuid(), 'healthcare', 3, '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001'
WHERE NOT EXISTS (SELECT 1 FROM "business_areas" WHERE "public_key" = 'healthcare');
--> statement-breakpoint

INSERT INTO "business_areas" ("id", "public_key", "display_order", "created_by_actor_id", "updated_by_actor_id")
SELECT gen_random_uuid(), 'smartcity', 4, '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001'
WHERE NOT EXISTS (SELECT 1 FROM "business_areas" WHERE "public_key" = 'smartcity');
--> statement-breakpoint

INSERT INTO "business_area_locales" ("id", "business_area_id", "locale", "publication_status", "updated_by_actor_id", "name", "subtitle", "description")
SELECT gen_random_uuid(), a."id", 'ko', 'PUBLISHED', '00000000-0000-0000-0000-000000000001',
  'Manufacturing AI',
  '공정 데이터 기반의 생산 혁신',
  '공정 진동 이상 탐지부터 불량품 판별, 수율 예측까지 제조 현장의 효율을 극대화하는 AI 솔루션을 제공합니다.'
FROM "business_areas" a
WHERE a."public_key" = 'manufacturing'
  AND NOT EXISTS (SELECT 1 FROM "business_area_locales" l WHERE l."business_area_id" = a."id" AND l."locale" = 'ko');
--> statement-breakpoint

INSERT INTO "business_area_locales" ("id", "business_area_id", "locale", "publication_status", "updated_by_actor_id", "name", "subtitle", "description")
SELECT gen_random_uuid(), a."id", 'en', 'PUBLISHED', '00000000-0000-0000-0000-000000000001',
  'Manufacturing AI',
  'Process data-driven manufacturing innovation',
  'From vibration anomaly detection to defect classification and yield prediction, our AI delivers peak efficiency on the production floor.'
FROM "business_areas" a
WHERE a."public_key" = 'manufacturing'
  AND NOT EXISTS (SELECT 1 FROM "business_area_locales" l WHERE l."business_area_id" = a."id" AND l."locale" = 'en');
--> statement-breakpoint

INSERT INTO "business_area_locales" ("id", "business_area_id", "locale", "publication_status", "updated_by_actor_id", "name", "subtitle", "description")
SELECT gen_random_uuid(), a."id", 'ko', 'PUBLISHED', '00000000-0000-0000-0000-000000000001',
  'sLLM base AI Agent',
  '대화형 AI로 업무 자동화와 고객 경험 강화',
  'sLLM 기반 음성·텍스트 지능 에이전트가 통역, 상담, 교육까지 폭넓게 지원합니다.'
FROM "business_areas" a
WHERE a."public_key" = 'agent'
  AND NOT EXISTS (SELECT 1 FROM "business_area_locales" l WHERE l."business_area_id" = a."id" AND l."locale" = 'ko');
--> statement-breakpoint

INSERT INTO "business_area_locales" ("id", "business_area_id", "locale", "publication_status", "updated_by_actor_id", "name", "subtitle", "description")
SELECT gen_random_uuid(), a."id", 'en', 'PUBLISHED', '00000000-0000-0000-0000-000000000001',
  'sLLM base AI Agent',
  'Conversational AI that automates work and elevates experiences',
  'Small LLM-powered voice and text agents cover translation, support, and learning scenarios.'
FROM "business_areas" a
WHERE a."public_key" = 'agent'
  AND NOT EXISTS (SELECT 1 FROM "business_area_locales" l WHERE l."business_area_id" = a."id" AND l."locale" = 'en');
--> statement-breakpoint

INSERT INTO "business_area_locales" ("id", "business_area_id", "locale", "publication_status", "updated_by_actor_id", "name", "subtitle", "description")
SELECT gen_random_uuid(), a."id", 'ko', 'PUBLISHED', '00000000-0000-0000-0000-000000000001',
  'Healthcare & Bio AI',
  '의료·치과 데이터 분석으로 정밀 진단 구현',
  '심전도 분석과 치아 자동 디자인 등 의료 현장의 정확성과 속도를 높이는 AI를 제공합니다.'
FROM "business_areas" a
WHERE a."public_key" = 'healthcare'
  AND NOT EXISTS (SELECT 1 FROM "business_area_locales" l WHERE l."business_area_id" = a."id" AND l."locale" = 'ko');
--> statement-breakpoint

INSERT INTO "business_area_locales" ("id", "business_area_id", "locale", "publication_status", "updated_by_actor_id", "name", "subtitle", "description")
SELECT gen_random_uuid(), a."id", 'en', 'PUBLISHED', '00000000-0000-0000-0000-000000000001',
  'Healthcare & Bio AI',
  'Precision diagnostics for medical and dental specialists',
  'ECG analytics and automated dental design speed up clinical decisions and improve accuracy.'
FROM "business_areas" a
WHERE a."public_key" = 'healthcare'
  AND NOT EXISTS (SELECT 1 FROM "business_area_locales" l WHERE l."business_area_id" = a."id" AND l."locale" = 'en');
--> statement-breakpoint

INSERT INTO "business_area_locales" ("id", "business_area_id", "locale", "publication_status", "updated_by_actor_id", "name", "subtitle", "description")
SELECT gen_random_uuid(), a."id", 'ko', 'PUBLISHED', '00000000-0000-0000-0000-000000000001',
  'SmartCity & Safety AI',
  '도시 안전과 운영을 위한 데이터 기반 관제',
  '위치 정보 기반 안전 관제와 드론 모니터링으로 스마트시티 구현을 가속화합니다.'
FROM "business_areas" a
WHERE a."public_key" = 'smartcity'
  AND NOT EXISTS (SELECT 1 FROM "business_area_locales" l WHERE l."business_area_id" = a."id" AND l."locale" = 'ko');
--> statement-breakpoint

INSERT INTO "business_area_locales" ("id", "business_area_id", "locale", "publication_status", "updated_by_actor_id", "name", "subtitle", "description")
SELECT gen_random_uuid(), a."id", 'en', 'PUBLISHED', '00000000-0000-0000-0000-000000000001',
  'SmartCity & Safety AI',
  'Data-driven control towers for safer cities',
  'Accelerates smart city deployment with geolocation safety control and drone monitoring.'
FROM "business_areas" a
WHERE a."public_key" = 'smartcity'
  AND NOT EXISTS (SELECT 1 FROM "business_area_locales" l WHERE l."business_area_id" = a."id" AND l."locale" = 'en');
