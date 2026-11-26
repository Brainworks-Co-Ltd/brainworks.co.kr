import Image from "next/image";
import Link from "next/link";
import { useLocale } from "@/shared/routing/useLocale";
import { getLocalizedPath } from "@/shared/routing/routes";
import SectionTitle, { Arrow } from "@/components/public/SectionTitle";
import Rail from "@/components/public/Rail";
import { homeCopy } from "@/data/homeCopy";

/*
 * 홈 사업 영역 구간. PC는 분야 하나를 연한 색 둥근 칸 하나로 세우고, 칸 안에
 * 사진과 솔루션을 각각 도형으로 넣어 층마다 색으로 경계를 나눈다.
 * 1024px보다 좁으면 사진 타일을 옆으로 넘긴다. 타일 넷을 세로로 쌓으면 폰에서
 * 2,600px가 넘는다.
 * 누를 곳은 분야마다 알약 버튼 하나다. 제목, 사진, 솔루션 칸은 링크가 아니다.
 */

// 주력 제품 둘(제조, 스마트시티)을 앞에 둔다.
const AREA_ORDER = ["manufacturing", "smartcity", "agent", "healthcare"];

export default function AreasRail({ areas = [] }) {
  const { language } = useLocale();
  const ordered = [...areas].sort(
    (a, b) => AREA_ORDER.indexOf(a.id) - AREA_ORDER.indexOf(b.id),
  );
  const href = (area) =>
    getLocalizedPath("solutions.detail", language, { area: area.id });
  const more = language === "ko" ? "자세히 보기" : "Learn more";

  return (
    <section className="py-[120px] lg:py-[200px]">
      <div className="inner">
        <SectionTitle sub={homeCopy.solutionsSection.title[language]}>
          {homeCopy.areasSection.title[language]}
        </SectionTitle>
        <ol className="hidden gap-6 lg:grid">
          {ordered.map((area, index) => (
            <AreaPanel
              key={area.id}
              area={area}
              flip={index % 2 === 1}
              delay={index * 100}
              href={href(area)}
              more={more}
            />
          ))}
        </ol>
      </div>
      <div className="lg:hidden">
        <Rail>
          {ordered.map((area) => (
            <li key={area.id} className="w-[76vw] max-w-[340px]">
              <AreaTile area={area} href={href(area)} more={more} />
            </li>
          ))}
        </Rail>
      </div>
    </section>
  );
}

function AreaPanel({ area, flip, delay, href, more }) {
  return (
    <li
      className="bw-reveal grid grid-cols-12 gap-8 rounded-[20px] bg-surface-muted p-8"
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div
        className={`relative col-span-5 min-h-[280px] overflow-hidden rounded-[14px] ${
          flip ? "order-2" : ""
        }`}
      >
        <Image
          src={area.heroImage}
          alt=""
          fill
          sizes="600px"
          className="object-cover"
        />
      </div>
      <div className={`col-span-7 flex flex-col py-3 ${flip ? "order-1" : ""}`}>
        <h3 className="text-[30px] font-semibold leading-[1.3] text-ink">
          {area.title}
        </h3>
        <p className="mt-2 break-keep text-[17px] leading-[1.6] text-muted">
          {area.subtitle}
        </p>
        <ul className="mt-6 grid grid-cols-2 gap-3">
          {(area.solutions || []).map((solution) => (
            <li key={solution.id} className="rounded-[14px] bg-white p-5">
              <p className="break-keep text-[16.5px] font-semibold text-ink">
                {solution.title}
              </p>
              {solution.description ? (
                <p className="mt-1 break-keep text-[14px] leading-[1.55] text-muted">
                  {solution.description}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
        <Link href={href} className="pill pill-accent mt-6 self-start">
          {more} <Arrow />
        </Link>
      </div>
    </li>
  );
}

/* 분야 이름은 위, 솔루션 목록과 버튼은 아래에 얹어 솔루션 수가 달라도 타일 크기와
   제목 높이가 같다. 흰 글자 대비는 글자 자리 밝기 95백분위로 재서 4.5 이상이다. */
function AreaTile({ area, href, more }) {
  return (
    <div className="relative flex h-[540px] flex-col overflow-hidden rounded-[24px] bg-surface-dark-deep">
      {/* 가로 사진을 세로 타일에 채우므로 높이 기준으로 받는다(540px 높이면 폭 960px). */}
      <Image
        src={area.heroImage}
        alt=""
        fill
        sizes="960px"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.78)_0%,rgba(0,0,0,0.4)_22%,rgba(0,0,0,0.05)_38%,rgba(0,0,0,0.6)_55%,rgba(0,0,0,0.92)_100%)]" />
      <div className="relative p-6">
        {/* 네 제목이 모두 한 줄에 들어가는 크기로 둬서 부제 높이를 맞춘다. */}
        <h3 className="whitespace-nowrap text-[20px] font-semibold leading-[1.3] text-white">
          {area.title}
        </h3>
        <p className="mt-2 break-keep text-[15px] leading-[1.55] text-white/85">
          {area.subtitle}
        </p>
      </div>
      <div className="relative mt-auto px-6 pb-6">
        <ul>
          {(area.solutions || []).map((solution) => (
            <li
              key={solution.id}
              className="break-keep border-t border-white/25 py-3 text-[15.5px] font-semibold leading-[1.4] text-white/90"
            >
              {solution.title}
            </li>
          ))}
        </ul>
        <Link href={href} className="pill pill-accent mt-4">
          {more} <Arrow />
        </Link>
      </div>
    </div>
  );
}
