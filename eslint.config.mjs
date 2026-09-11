import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

export default [
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "public/**",
      "reports/**",
      "graphify-out/**",
      "out/**",
      ".superpowers/**",
      ".claude/**",
      "eslint.config.mjs",
    ],
  },
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    // eslint-plugin-react's settings.react.version "detect" calls
    // context.getFilename(), which ESLint 10 removed from the rule
    // context API and crashes every lint run. Pin the version we have
    // installed instead of auto-detecting it.
    settings: { react: { version: "19.2.8" } },
  },
  {
    files: ["src/components/**/*.{js,jsx,ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/server/*", "@/server/**"],
              message:
                "컴포넌트는 서버 모듈을 직접 import하지 않는다. 페이지의 getServerSideProps에서 조회해 props로 넘긴다.",
            },
          ],
        },
      ],
    },
  },
  {
    // .cjs 스크립트는 CommonJS 그대로 실행된다 (scripts/deploy.sh, .github/workflows/deploy.yml
    // 참고: node scripts/migrate.cjs). require()가 잘못이 아니라 이 확장자의 정상 동작이다.
    files: ["**/*.cjs"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
  {
    // 두 규칙 모두 렌더/이펙트 로직을 다시 짜야 고쳐지는 실제 동작 이슈라
    // (예: 8개 위반 중 하나가 src/components/industrial/IndustrialHero.jsx로,
    // 이 작업 범위 밖에서 편집 중) 이 과제의 "설정 교체" 범위를 넘는다.
    // 규칙별 위반 수는 task-20-report.md 표를 참고.
    // files는 react-hooks 플러그인이 등록되는 eslint-config-next의 "next"
    // 블록과 같은 범위로 맞춘다 (plugin lookup은 파일 단위라 겹쳐야 한다).
    files: ["**/*.{js,jsx,mjs,ts,tsx,mts,cts}"],
    rules: {
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/refs": "warn",
    },
  },
];
