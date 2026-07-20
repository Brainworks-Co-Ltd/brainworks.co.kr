# brainworks.co.kr

## 파일 구조

```text
brainworks.co.kr/
├── docs/                     # 운영 및 콘텐츠 관리 문서
├── public/                   # 정적 파일
│   ├── files/                # 다운로드용 문서 파일
│   └── images/               # 사이트 이미지 및 SVG 자산
├── src/
│   ├── assets/               # 컴포넌트에서 직접 가져오는 이미지 자산
│   ├── components/           # 공통 UI 및 페이지 구성 컴포넌트
│   │   ├── admin/            # 관리자 화면 컴포넌트
│   │   └── ui/               # 재사용 UI 컴포넌트
│   ├── content/              # 마크다운/PDF 기반 콘텐츠
│   │   └── news/             # 뉴스 게시글 및 원문 자료
│   ├── contexts/             # React Context
│   ├── data/                 # 회사 소개, 사업 영역, 팝업 등 정적 데이터
│   ├── lib/                  # 메일, 마크다운, 뉴스 처리 유틸리티
│   ├── models/               # 데이터 모델
│   ├── pages/                # Next.js Pages Router 라우트
│   │   ├── about/            # 회사 소개 하위 페이지
│   │   ├── admin/            # 관리자 페이지
│   │   ├── api/              # API 라우트
│   │   ├── auth/             # 인증 페이지
│   │   ├── bid-notice/       # 입찰 공고 상세 페이지
│   │   ├── news/             # 뉴스 상세 페이지
│   │   └── services/         # 서비스 하위 페이지
│   ├── styles/               # 전역 스타일
│   └── utils/                # 데이터 가공 및 보조 함수
├── tests/                    # Node.js 테스트
├── jsconfig.json             # 경로 별칭 설정
├── next.config.js            # Next.js 설정
├── package.json              # 의존성 및 실행 스크립트
├── postcss.config.js         # PostCSS 설정
└── tailwind.config.js        # Tailwind CSS 설정
```
