# 뉴스 외부 링크 등록 가이드

생성형 AI 교육 페이지 업데이트와 함께 뉴스 상세 페이지에서 여러 개의 외부 링크를 노출할 수 있도록 기능이 추가되었습니다. 아래 절차에 따라 기사별로 링크를 등록해주세요.

## 1. front matter에 `externalLinks` 추가
각 뉴스 파일의 최상단에는 JSON 형태의 front matter가 포함되어 있습니다. 외부 링크는 `externalLinks` 배열에 객체로 정의합니다.

```json
"externalLinks": [
  {
    "label": {
      "ko": "머니투데이 단독 보도",
      "en": "MoneyToday Coverage"
    },
    "url": "https://example.com/article-kr"
  },
  {
    "label": "Yonhap News",
    "url": "https://example.com/article-en"
  }
]
```

- `label`은 문자열 또는 `ko`/`en` 키를 가진 객체 모두 허용됩니다. 객체를 사용하면 언어별 텍스트를 지정할 수 있습니다.
- `url`은 http/https로 시작하는 전체 주소를 입력합니다.
- `href` 속성을 사용해도 되지만, 가독성을 위해 `url`을 권장합니다.

## 2. 번역 값 처리 규칙
라이브러리는 `ensureLanguageValue` 함수를 통해 label 값을 변환합니다.

- 객체일 경우 현재 언어(`ko`/`en`) → `ko` → `en` 순서로 폴백합니다.
- 문자열만 제공되면 양 언어에서 동일하게 표시됩니다.
- label을 생략하면 기본값 `바로가기 / Open link`가 사용됩니다.

## 3. 마크다운 본문에는 링크를 추가하지 않아도 됩니다
Markdown 본문에 직접 링크를 추가해도 되지만, `externalLinks` 배열에 등록된 링크는 상세 페이지 하단 “관련 외부 기사 / External Coverage” 섹션에서 리스트로 자동 노출됩니다. 링크 클릭 시 새 탭(`target="_blank"`)으로 열립니다.

## 4. 예시: 2025-08-07-jeonnam-ai-training.md
```json
---
{
  "title": {
    "ko": "전남 AI 공무원 교육 착수",
    "en": "Jeonnam Launches AI Training for Civil Servants"
  },
  "date": "2025-08-07",
  "thumbnail": "/images/news/jeonnam-ai-training.jpg",
  "externalLinks": [
    {
      "label": {
        "ko": "전남일보 기사",
        "en": "Jeonnam Daily Article"
      },
      "url": "https://news.jeonnamdaily.co.kr/article"
    },
    {
      "label": "Press Release",
      "url": "https://press.example.com/jeonnam-ai-training"
    }
  ]
}
---
```

## 5. 검증 체크리스트
- [ ] 링크가 2개 이상일 때 JSON 배열 구문 오류가 없는지 확인합니다.
- [ ] URL 끝에 불필요한 공백이 없는지 확인합니다.
- [ ] 언어별 label이 모두 존재하는지, 또는 공통 label이 의도한 내용인지 검토합니다.
- [ ] `npm run dev` 혹은 `npm run build` 실행 후 상세 페이지 하단에 링크가 정상 노출되는지 확인합니다.

## 6. 문제 해결
- **빌드 에러 (JSON 파싱 오류)**: 쉼표 누락/추가, 큰따옴표 누락 여부를 확인합니다.
- **링크가 표시되지 않음**: `externalLinks`가 배열인지, 각 요소에 `url`이 있는지 확인합니다.
- **언어 표시가 이상함**: label이 문자열인지 객체인지 확인하고, 필요한 언어 키(`ko`, `en`)를 모두 입력합니다.

필요시 `src/lib/news.js`의 `normaliseExternalLinks` 함수를 참고하면 파싱 로직을 확인할 수 있습니다.
