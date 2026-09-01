import Link from "next/link";
import { ArrowRight } from "lucide-react";

/*
 * 진입 분기. 페이지 맨 위에서 대상과 비대상을 밝힌다.
 *
 * 설계 근거: docs/designs/detail-page-roles.md
 * 상세 페이지가 하는 일은 "내 상황에 맞는 것을 고르게 하는 것"이다.
 * 03-02 §274의 검증 기준("방문자가 교육·솔루션 판매 페이지와 컨설팅의 차이를
 * 설명할 수 있다")을 화면에서 직접 충족한다.
 *
 * 문구는 새로 짓지 않는다. 03-02 §142-144와 03-03의 페이지 목적에서 가져온다.
 */

export function PageAudience({ audience, scope, redirects = [] }) {
  return (
    <section className="bw-audience" aria-label="이 페이지의 대상">
      <div className="bw-audience__inner">
        <div className="bw-audience__main">
          <p className="bw-audience__label">이런 분을 위한 페이지입니다</p>
          <p className="bw-audience__audience">{audience}</p>
          {scope ? <p className="bw-audience__scope">{scope}</p> : null}
        </div>

        {redirects.length ? (
          <div className="bw-audience__aside">
            <p className="bw-audience__label">찾으시는 게 아니라면</p>
            <ul className="bw-audience__links">
              {redirects.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="bw-audience__link">
                    <span>{item.label}</span>
                    <ArrowRight aria-hidden="true" className="size-4 shrink-0" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </section>
  );
}

export default PageAudience;
