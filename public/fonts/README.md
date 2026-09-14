# Pretendard Variable (동적 서브셋)

- 배포본: Pretendard v1.3.9 (GitHub 최신 릴리스와 동일 버전)
- 파일: `pretendard/PretendardVariable.subset.0.woff2` ~ `PretendardVariable.subset.91.woff2` (92개)
- 원본: `web/variable/woff2-dynamic-subset/`와 `web/variable/pretendardvariable-dynamic-subset.css` — GitHub 릴리스 zip에는 variable 동적 서브셋이 포함되어 있지 않아, 동일 버전의 npm 패키지 tarball(`https://registry.npmjs.org/pretendard/-/pretendard-1.3.9.tgz`, `dist/web/variable/woff2-dynamic-subset`)에서 받았다.
- CSS: `src/styles/pretendard.css`는 공식 `pretendardvariable-dynamic-subset.css`를 그대로 옮기고 `url(./woff2-dynamic-subset/...)` 경로만 `url(/fonts/pretendard/...)`로 바꾼 것이다. `unicode-range`, `font-weight: 45 920`, `format('woff2-variations')`는 공식 값을 그대로 유지했다.
- 라이선스: SIL Open Font License 1.1 (`OFL-1.1.txt`)
- 라이선스 원문: https://github.com/orioncactus/pretendard/blob/main/LICENSE

글꼴 파일은 수정하지 않고 자체 호스팅합니다. Reserved Font Name인 `Pretendard`를 유지합니다.

동적 서브셋을 쓰는 이유는 첫 화면 다운로드를 줄이기 위해서다. 브라우저는 실제 페이지에 쓰인 글자의 유니코드 범위에 해당하는 서브셋 파일만 내려받는다(예전에는 2.0MB 파일 1개를 항상 통째로 받았다).
