import Link from "next/link";
import { businessAreas } from "@/data/businessAreas";
import { useLocale } from "@/shared/routing/useLocale";

/*
 * 사업 영역을 캐러셀에서 4단 그리드로 바꾼다.
 *
 * 캐러셀은 한 번에 하나만 보여준다. 방문자가 자기 분야를 찾으려면 돌려봐야
 * 한다. 실측한 다섯 곳 모두 분야별 진입 경로를 한 화면에 펼쳐 두었다.
 *
 * 영역마다 고유색을 주지 않는다 (design.md 2.3). 색으로 넷을 구분하면
 * 브랜드 색이 사라지고 화면이 무지개가 된다. 대신 각 영역의 제품 화면으로
 * 구분한다. 영역의 정체성은 스크린샷 그 자체다.
 */

const SHOT = {
  manufacturing: "/images/services/hero/manufacturing.webp",
  agent: "/images/services/hero/agent.webp",
  healthcare: "/images/services/hero/healthcare.webp",
  smartcity: "/images/services/hero/smartcity.webp",
};

export default function DomainGrid() {
  const { language } = useLocale();

  return (
    <section className="ind-domains" aria-labelledby="ind-domains-title">
      {/*
        문구를 새로 짓지 않는다. 기존 BusinessAreaCarousel이 쓰던 것을
        그대로 쓴다. 앞서 쓴 "네 영역에서 실제로 돌고 있습니다"는 도입
        실적 주장이라 06 감사의 회사 승인 대기 상태와도 어긋났다.
      */}
      <header className="ind-domains__head">
        <p className="ind-eyebrow">
          {language === "ko" ? "브레인웍스 사업 분야" : "Brainworks domains"}
        </p>
        <h2 id="ind-domains-title" className="ind-section-title">
          {language === "ko" ? "핵심 AI 사업 분야" : "Core AI business domains"}
        </h2>
      </header>

      <div className="ind-domains__grid">
        {businessAreas.map((area) => (
          <Link
            key={area.id}
            href={`/services?area=${area.id}#business-areas`}
            className="ind-domain"
          >
            {SHOT[area.id] ? (
              <img className="ind-domain__shot" src={SHOT[area.id]} alt="" />
            ) : null}

            {/* 솔루션 개수를 크게 쓰지 않는다. 아래 목록이 이미 이름을 다 보여주므로
                볼 수 있는 것을 세어 붙이는 셈이고, 4/3/2/2가 나란히 놓이면 영역 사이에
                없는 서열이 생긴다. 카드에서 가장 큰 글자는 분야 이름이다. */}
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
