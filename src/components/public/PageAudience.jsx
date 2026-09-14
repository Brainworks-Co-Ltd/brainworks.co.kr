import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useLocale } from "@/shared/routing/useLocale";

/*
 * 진입 분기. 페이지 맨 위에서 대상과 비대상을 밝힌다.
 *
 * 설계 근거: docs/designs/detail-page-roles.md
 * 상세 페이지가 하는 일은 "내 상황에 맞는 것을 고르게 하는 것"이다.
 * 03-02 §274의 검증 기준("방문자가 교육·솔루션 판매 페이지와 컨설팅의 차이를
 * 설명할 수 있다")을 화면에서 직접 충족한다.
 *
 * 문구는 새로 짓지 않는다. 03-02 §142-144와 03-03의 페이지 목적에서 가져온다.
 *
 * 두 가지 모양을 갖는다.
 * - 기본: 대상과 범위를 왼쪽에, 분기를 오른쪽에 두는 2단.
 * - 레일(audience와 scope가 없을 때): 대상과 범위가 히어로로 올라간 페이지용.
 *   분기만 남으므로 접힘선 바로 아래 가로 띠로 깔린다.
 *
 * 레일을 쓰는 이유는 대상 문장이 접힘선 아래에 있으면 첫 화면이 "이 페이지가
 * 나를 위한 것인가"에 답하지 못하기 때문이다. 1440x768에서 실측했다(2026-09-06).
 */

function RedirectLinks({ redirects }) {
  return (
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
  );
}

export function PageAudience({ audience = null, scope = null, redirects = [] }) {
  const { language } = useLocale();
  const ko = language === "ko";

  const notForYou = ko ? "찾으시는 게 아니라면" : "Not what you need?";
  const forYou = ko ? "이런 분을 위한 페이지입니다" : "This page is for";
  // 라벨 자간과 대문자 변환은 라틴 기준이라 한글에는 걸지 않는다.
  const labelClass = `bw-audience__label${ko ? " bw-audience__label--ko" : ""}`;

  if (!audience && !scope) {
    if (!redirects.length) return null;
    return (
      <section
        className="bw-audience bw-audience--rail"
        aria-label={ko ? "다른 페이지 안내" : "Other pages"}
      >
        <div className="bw-audience__inner">
          <p className={labelClass}>{notForYou}</p>
          <RedirectLinks redirects={redirects} />
        </div>
      </section>
    );
  }

  return (
    <section
      className="bw-audience"
      aria-label={ko ? "이 페이지의 대상" : "Who this page is for"}
    >
      <div className="bw-audience__inner">
        <div className="bw-audience__main">
          <p className={labelClass}>{forYou}</p>
          <p className="bw-audience__audience">{audience}</p>
          {scope ? <p className="bw-audience__scope">{scope}</p> : null}
        </div>

        {redirects.length ? (
          <div className="bw-audience__aside">
            <p className={labelClass}>{notForYou}</p>
            <RedirectLinks redirects={redirects} />
          </div>
        ) : null}
      </div>
    </section>
  );
}

export default PageAudience;
