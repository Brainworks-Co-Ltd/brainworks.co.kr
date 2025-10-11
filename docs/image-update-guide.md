# Image Update Guide

이 문서는 메인 홈페이지와 서비스 관련 페이지의 이미지 교체 방법을 정리한 가이드입니다. 모든 이미지는 Next.js Image 컴포넌트를 통해 로드되므로, 교체 시 동일한 파일 경로와 적절한 해상도를 유지해 주세요.

## 1. 메인 페이지 > 서비스 섹션 (슬라이더)

### 이미지 위치
- 메인 비주얼: public/images/services/ai-{domain}-main.svg
- 솔루션 썸네일: public/images/services/ai-{domain}-{solution}.svg

### 연결 경로
- 데이터 소스: src/data/businessAreas.js
  - heroImage 속성이 메인 비주얼 경로를 가리킵니다.
  - solutions[].image 속성이 솔루션 썸네일 경로를 가리킵니다.
- 표시 컴포넌트: src/components/Services.jsx

### 교체 방법
1. 교체하려는 이미지를 public/images/services/ 폴더에 동일한 파일명으로 덮어쓰기 하거나, 새 파일을 추가한 뒤 businessAreas.js의 경로를 업데이트합니다.
2. 가로형(16:9) 비율로 최소 960×540px 이상의 해상도를 권장합니다.
3. SVG 또는 최적화된 PNG/JPG를 사용할 수 있으며, 파일 확장자를 변경한 경우 businessAreas.js에서 heroImage 또는 solutions[].image 값을 새 확장자로 맞춰주세요.

## 2. 서비스 페이지 > 사업 분야 히어로 & 솔루션 이미지

서비스 페이지에서도 동일한 데이터(businessAreas.js)를 재사용합니다.

- 상단 탭에서 선택되는 메인 이미지: heroImage
- 솔루션 카드 썸네일: solutions[].image
- 표시 컴포넌트: src/pages/services.jsx

> 메인 페이지와 공유되므로 한 곳에서 이미지를 교체하면 두 페이지에 함께 반영됩니다.

## 3. 메인 페이지 > 수상 및 인증 섹션

### 이미지 위치
- 수상: public/images/honors/award-*.svg
- 인증: public/images/honors/cert-*.svg

### 연결 경로
- 수상 데이터: src/utils/awardsData.js
  - 각 항목의 image 필드를 수정해 교체합니다.
- 인증 데이터: src/utils/certificationsData.js
  - 각 항목의 image 필드를 수정해 교체합니다.
- 표시 컴포넌트: src/components/Honors.jsx

### 교체 방법
1. 실제 시상/인증 사진을 동일한 경로의 파일로 덮어쓰거나, 새 파일을 추가한 뒤 데이터 파일의 image 값을 수정합니다.
2. 카드 비율은 약 16:10 (권장 최소 800×500px) 입니다. 주요 로고가 중앙에 보이도록 편집하세요.
3. 투명 배경 PNG 또는 고해상도 JPG를 사용할 경우, 용량을 500KB 이하로 유지하면 로딩에 유리합니다.

## 4. 기타 이미지 교체 시 유의 사항

- Next.js는 public/ 경로의 정적 파일을 그대로 제공하므로, 파일 교체 후 별도 빌드 설정 변경이 필요하지 않습니다.
- 동일 파일명을 사용하는 경우 브라우저 캐시가 남을 수 있습니다. 변경 직후 화면에 반영되지 않으면 강력 새로고침(Ctrl+Shift+R) 또는 캐시 무효화를 수행하세요.
- 다국어 환경을 고려해 alt 텍스트는 현재 컴포넌트에서 자동 생성되지만, 명시적으로 수정이 필요하면 해당 JSX에서 문자열을 조정할 수 있습니다.

## 5. 요약 체크리스트

- [ ] 새 이미지를 public/images/... 경로에 저장했는가?
- [ ] 데이터 파일(businessAreas.js, awardsData.js, certificationsData.js)의 경로를 업데이트했는가?
- [ ] 이미지 해상도와 비율이 권장 사양을 충족하는가?
- [ ] 브라우저 캐시를 비워 변경 사항을 확인했는가?

위 절차에 따라 이미지를 교체하면 메인 및 서비스 관련 페이지에 즉시 반영됩니다.
