import Link from "next/link";
import { businessAreas } from "@/data/businessAreas";
import { useLocale } from "@/shared/routing/useLocale";

/*
 * 사업 영역을 캐러셀에서 4단 그리드로 바꾼다.
 *
 * 캐러셀은 한 번에 하나만 보여준다. 방문자가 자기 분야를 찾으려면
 * 돌려봐야 한다. 실측한 다섯 곳 모두 분야별 진입 경로를 한 화면에
 * 펼쳐 두었다. 네 영역이 동시에 보이는 편이 목적에 맞다.
 *
 * 영역색은 카드마다 하나씩만 쓴다. 고채도 색을 하나로 제한하는 것이
 * 여섯 곳의 공통 문법이었다.
 */

const ACCENT = {
  manufacturing: "var(--ind-manufacturing)",
  agent: "var(--ind-agent)",
  healthcare: "var(--ind-healthcare)",
  smartcity: "var(--ind-smartcity)",
};

export default function DomainGrid() {
  const { language } = useLocale();

  return (
    <section className="ind-domains" aria-labelledby="ind-domains-title">
      <header className="ind-domains__head">
        <p className="ind-eyebrow">Business Domains</p>
        <h2 id="ind-domains-title" className="ind-section-title">
          {language === "ko"
            ? "네 영역에서 실제로 돌고 있습니다"
            : "Running in four domains"}
        </h2>
      </header>

      <div className="ind-domains__grid">
        {businessAreas.map((area) => (
          <Link
            key={area.id}
            href={`/services?area=${area.id}`}
            className="ind-domain"
            style={{ "--domain-accent": ACCENT[area.id] }}
          >
            <span className="ind-domain__bar" aria-hidden="true" />

            <span className="ind-domain__count">
              {area.solutions.length}
              <span className="ind-domain__count-unit">
                {language === "ko" ? "개 솔루션" : " solutions"}
              </span>
            </span>

            <span className="ind-domain__name">{area.name[language]}</span>
            <span className="ind-domain__subtitle">
              {area.subtitle[language]}
            </span>

            <span className="ind-domain__list">
              {area.solutions.map((s) => (
                <span key={s.id} className="ind-domain__item">
                  {s.name[language]}
                </span>
              ))}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
