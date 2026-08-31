---
wiki_type: index
status: approved
updated: 2026-08-25
sources:
  - superpowers/specs/2026-08-22-llm-wiki-graphify-design.md
---

# BrainWorks 문서 지식 인덱스

이 문서는 `docs/**/*.md` 전체를 주제별로 탐색하기 위한 LLM Wiki 진입점입니다. 문서의 확정 상태는 각 파일의 `status`와 본문을 기준으로 판단합니다.

## 운영 가이드

- [이미지 업데이트 가이드](image-update-guide.md): 웹사이트 이미지 교체 위치와 적용 절차를 설명합니다.
- [뉴스 외부 링크 처리](news-external-links.md): 뉴스 항목에서 외부 원문 링크를 연결하는 방법을 설명합니다.
- [뉴스 업데이트 가이드](news-updates.md): 뉴스 데이터와 화면 노출 내용을 갱신하는 절차를 설명합니다.

## 개발 계획 진입점

- [기획서 (plan.md)](plan.md): 문제 정의부터 5 Whys, 타겟 사용자, 경쟁사 분석, MVP 범위까지 흩어진 기획 문서를 하나의 이야기로 잇는 진입점입니다.

- [개발 문서 인덱스](planning/00-development-document-index.md): 홈페이지 재구축 계획 문서의 단계와 검토 순서를 안내합니다.
- [멘토님 미팅 기준 홈페이지 개편 범위](planning/00-mentor-meeting-scope.md): Clova Note 원문에서 확인한 관리자 대상과 제외 대상을 정리합니다.
- [홈페이지 개편 제품 기획](planning/07-homepage-product-strategy-as-is-to-be.md): 개편의 AS-IS와 TO-BE, 제품 가설, 성공 정의, 에픽과 사용자 스토리를 연결합니다.
- [브레인웍스 디자인 시스템](planning/08-design-system.md): 브랜드 포지셔닝과 Voice를 먼저 정의하고 그 위에 색·타이포·간격 토큰을 얹는 design.md입니다.
- [콘텐츠·자산 준비도 감사](planning/06-content-and-asset-readiness-audit.md): 실제 배포 콘텐츠, 이미지, 관계, 라이선스와 회사 승인 결손을 판정합니다.
- [멘토님 자료 요청 메시지](planning/06-01-mentor-content-request.md): 감사에서 확인된 결손을 회사 담당자에게 요청하는 전달문과 회신 양식입니다.

## 도메인과 현재 상태

- [도메인 언어](planning/00-domain-language.md): BrainWorks 사업·콘텐츠·시스템에서 사용하는 핵심 용어를 정리합니다.
- [현재 시스템 분석](planning/01-current-system-analysis.md): 기존 홈페이지의 구조, 기능, 데이터와 개선 대상을 분석합니다.
- [외부 사이트 벤치마킹](planning/02-external-benchmarking.md): 공식 사이트를 문제별로 비교하고 홈페이지 개편에 적용할 근거와 한계를 정리합니다.

## 홈페이지 재설계

- [사이트맵과 한·영 라우팅](planning/03-homepage-redesign/03-01-sitemap-and-ko-en-routing.md): 공개 사이트의 정보 구조와 언어별 경로를 설계합니다.
- [페이지 개선 방향](planning/03-homepage-redesign/03-02-page-improvement-direction.md): 기존 페이지별 문제와 개선 방향을 정리합니다.
- [공개 페이지 구성](planning/03-homepage-redesign/03-03-public-page-composition.md): 공개 페이지의 섹션과 콘텐츠 구성을 설계합니다.
- [공개 페이지 와이어프레임](planning/03-homepage-redesign/03-04-public-page-wireframes.md): 공개 화면의 텍스트 기반 배치안을 정리합니다.
- [홈페이지 개편 디자인 명세](superpowers/specs/2026-08-23-brainworks-website-redesign-design.md): 디자인 시스템, 전체 페이지, 상태, 접근성과 콘텐츠 승인 조건을 정의한 승인 명세입니다.
- [공개 내비게이션·페이지 Hero 계층 설계](superpowers/specs/2026-08-24-public-navigation-and-page-hero-design.md): 회사·사업·소식 중심 IA와 페이지 역할별 Hero 변형을 정의합니다.
- [홈페이지 개편 구현 계획](superpowers/plans/2026-08-23-brainworks-website-redesign-implementation.md): 승인 명세를 프로덕션 시스템으로 전환하는 작업 순서와 검증 관문입니다.
- [레퍼런스 기반 공개 레이아웃 개편 계획](superpowers/plans/2026-08-24-reference-led-public-layout-redesign.md): 승인된 외부 레퍼런스의 구조적 문법을 공개 페이지 레이아웃에 적용하는 순서를 정의합니다.
- [공개 내비게이션·페이지 Hero 구현 계획](superpowers/plans/2026-08-24-public-navigation-and-page-hero-implementation.md): 중앙 메뉴 모델, 계층형 Header·Footer와 자산 승인 관문을 포함한 Hero 변형의 구현 체크포인트를 정의합니다.
- [공개 사업 영역 메가메뉴 설계](superpowers/specs/2026-08-24-public-business-mega-menu-design.md): 기존 사업 영역 이미지와 MakinaRocks식 메뉴 트리 적용 기준을 정의합니다.
- [공개 사업 영역 메가메뉴 구현 계획](superpowers/plans/2026-08-24-public-business-mega-menu-implementation.md): 사업 영역 메가메뉴의 데이터·데스크톱·모바일 구현과 검증 순서를 정의합니다.
- [shadcn/ui·Lucide 통합 설계](superpowers/specs/2026-08-24-shadcn-lucide-integration-design.md): 기존 브레인웍스 토큰을 유지하면서 공통 UI 동작과 기능 아이콘을 점진적으로 표준화하는 설계입니다.
- [shadcn/ui·Lucide 통합 구현 계획](superpowers/plans/2026-08-24-shadcn-lucide-integration.md): 기반 설정, Button·Dialog 전환, Carousel 아이콘 표준화와 최소 검증·커밋 순서를 정의합니다.
- [공지사항·팝업 공지 기능 설계](superpowers/specs/2026-08-23-notices-and-popup-notices-design.md): 두 기능의 독립 목적, 공개·관리자 동작, 첨부 보안과 데이터 계약을 정의합니다.
- [공지사항·팝업 공지 구현 계획](superpowers/plans/2026-08-23-notices-and-popup-notices-implementation.md): 뉴스 기반 뒤에 실행할 공지·팝업 수직 슬라이스와 최소 검증 순서를 정의합니다.
- [공지사항·팝업 공지 운영 흐름 검증](superpowers/evidence/2026-08-25-task-9a-notices-popup.md): 공개 첨부파일, 관리자 상태 목록, 팝업 공개 판정과 검증 명령 결과를 기록합니다.

## 관리자와 데이터

- [관리자 범위와 사용자 흐름](planning/04-admin-and-data/04-01-admin-scope-and-user-flow.md): 관리자 기능 범위와 주요 작업 흐름을 설계합니다.
- [관리자 페이지 구성](planning/04-admin-and-data/04-02-admin-page-composition.md): 관리자 화면별 목적과 구성 요소를 정리합니다.
- [관리자 와이어프레임](planning/04-admin-and-data/04-03-admin-wireframes.md): 관리자 화면의 텍스트 기반 배치안을 정리합니다.
- [콘텐츠 데이터 구조](planning/04-admin-and-data/04-04-content-data-structure.md): 홈페이지 콘텐츠의 데이터 구조와 관리 단위를 설계합니다.
- [ERD와 데이터 관리](planning/04-admin-and-data/04-05-erd-and-data-management.md): 제안 데이터 모델과 관리 원칙을 정리합니다.
- [공지사항 숫자형 공개 번호 설계](superpowers/specs/2026-08-27-notice-public-number-design.md): 관리자 슬러그 입력을 제거하고 DB가 발급하는 숫자형 공지 주소와 기존 주소 호환 정책을 정의합니다.
- [공지사항 숫자형 공개 번호 구현 계획](superpowers/plans/2026-08-27-notice-public-number-implementation.md): DB identity, 관리자 입력 제거, 공개 조회와 과거 주소 호환을 테스트 우선으로 구현하는 순서입니다.
- [로컬 통합 관리자 계정 프로비저닝 설계](superpowers/specs/2026-08-24-local-admin-provisioning-design.md): 로컬에서 통합 관리자 계정을 안전하게 준비하는 절차를 정의합니다.
- [멘토 요구 기준 관리자 범위 정정 구현 계획](superpowers/plans/2026-08-25-admin-scope-correction.md): 사업 영역을 고정 공개 분류로 되돌리고 관리자 범위를 정정하는 작업 순서입니다.

## 기술 설계

- [기술 스택과 선정 근거](planning/05-technical-design/05-01-tech-stack-and-rationale.md): 목표 시스템의 기술 선택지와 선정 근거를 정리합니다.
- [목표 시스템 아키텍처](planning/05-technical-design/05-02-target-system-architecture.md): 재구축 대상 시스템의 구성과 계층을 설계합니다.
- [서버·데이터베이스·스토리지·배포](planning/05-technical-design/05-03-server-database-storage-deployment.md): 운영 인프라와 배포 구성을 설계합니다.
- [개발 순서와 산출물](planning/05-technical-design/05-04-development-sequence-and-deliverables.md): 구현 단계, 검증 지점과 산출물을 정리합니다.

## LLM Wiki 운영

- [변경 로그](log.md): Wiki의 결정과 변경을 시간순으로 기록합니다.
- [LLM Wiki·Graphify 통합 설계](superpowers/specs/2026-08-22-llm-wiki-graphify-design.md): Karpathy의 LLM Wiki 방법과 Graphify 역할을 BrainWorks에 적용하는 승인 설계입니다.
- [기반 구축 계획](superpowers/plans/2026-08-23-llm-wiki-graphify-foundation.md): Git 규칙, 공식·프로젝트 스킬, 검사기와 진입점 구축 절차입니다.
- [기존 문서 전환·최초 지도 계획](superpowers/plans/2026-08-23-llm-wiki-document-migration.md): 기존 문서를 한 파일씩 전환하고 최초 지도를 만드는 승인 절차입니다.
- [외부 레퍼런스 Wiki 편입 계획](superpowers/plans/2026-08-23-external-benchmarking-wiki-ingest.md): 이전 조사 답변을 공식 사이트로 재검증하고 Wiki 근거로 편입하는 절차입니다.
- [Wiki 스킬 행동 검증](superpowers/evidence/2026-08-23-brainworks-docs-wiki-skill-test.md): 프로젝트 스킬 적용 전후의 압력 시나리오와 판정 근거입니다.

## 구현 검증 증빙

- [구현 기준선](superpowers/evidence/2026-08-23-implementation-baseline.md): 개편 구현 시작 전 브랜치·도구·명령 기준선을 기록합니다.
- [런타임 기반 검증](superpowers/evidence/2026-08-24-task-2-runtime-foundation.md): Node·Next.js·TypeScript·Tailwind 기반 전환 결과입니다.
- [국·영문 라우팅 검증](superpowers/evidence/2026-08-24-task-3-routing.md): 서버 실행과 언어별 URL 계약 검증 결과입니다.
- [디자인 시스템 검증](superpowers/evidence/2026-08-24-task-4-design-system.md): 디자인 토큰과 공유 UI 기반 검증 결과입니다.
- [공개 셸 검증](superpowers/evidence/2026-08-24-task-5-public-shell.md): Header·Footer·PageHero와 정적 페이지 검증 결과입니다.
- [홈 UI 검증](superpowers/evidence/2026-08-24-task-6-home-ui.md): 홈 Hero와 사업 영역 탐색 검증 결과입니다.
- [데이터베이스·HTTP 검증](superpowers/evidence/2026-08-24-task-7-database-http.md): PostgreSQL·Drizzle·HTTP 경계 검증 결과입니다.
- [관리자 인증 검증](superpowers/evidence/2026-08-24-task-8-auth-admin.md): 관리자 인증·세션·공통 셸 검증 결과입니다.
- [뉴스 수직 슬라이스 검증](superpowers/evidence/2026-08-24-task-9-news.md): 공개·관리자 뉴스 흐름과 자산 경계 검증 결과입니다.
- [공개 내비게이션·페이지 Hero 구현 검증](superpowers/evidence/2026-08-24-navigation-page-hero.md): 중앙 IA, 계층형 셸, Hero 변형과 프로덕션 경로 검증 결과입니다.
- [공개 사업 영역 메가메뉴 구현 검증](superpowers/evidence/2026-08-24-public-business-mega-menu.md): 기존 사업 영역 이미지, 데스크톱 메가메뉴, 모바일 계층과 테스트 결과입니다.
