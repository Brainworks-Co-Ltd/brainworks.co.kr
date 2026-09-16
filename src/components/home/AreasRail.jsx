import Image from "next/image";
import Link from "next/link";
import { useLocale } from "@/shared/routing/useLocale";
import { getLocalizedPath } from "@/shared/routing/routes";
import Rail from "@/components/public/Rail";
import SectionTitle, { Arrow } from "@/components/public/SectionTitle";
import { homeCopy } from "@/data/homeCopy";

export default function AreasRail({ areas = [] }) {
  const { language } = useLocale();
  const listPath = getLocalizedPath("solutions.list", language);

  return (
    <section className="py-[120px] lg:py-[250px]">
      <SectionTitle>{homeCopy.areasSection.title[language]}</SectionTitle>
      <div className="bw-reveal">
        <Rail>
          {areas.map((area) => (
            /* 그림을 앞세우는 카드라 옅은 면에 얹는다. 예전에는 사진을 카드
               전체에 깔고 흰 글자를 올렸는데, 사진마다 밝은 부분이 달라
               제목이 묻히는 자리가 생겼다. 그림은 안쪽에 두고 글은 면 위에서
               읽게 한다. */
            <li key={area.id} className="group w-[280px] lg:w-[409px]">
              <Link
                href={`${listPath}?area=${encodeURIComponent(area.id)}#business-areas`}
                className="flex h-full flex-col rounded-[24px] bg-tint p-6 text-center transition-colors duration-200 hover:bg-[color-mix(in_oklab,var(--bw-accent)_10%,var(--bw-surface-muted))] lg:p-8"
              >
                <span className="relative block aspect-[16/10] overflow-hidden rounded-2xl">
                  <Image
                    src={area.heroImage}
                    alt={area.title || area.name || ""}
                    fill
                    sizes="409px"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </span>
                {/* 제목은 heading으로 둔다. 의미도 맞고, 한글 줄바꿈 규칙
                    (keep-all, balance)이 heading에 걸려 있어 어절이 안 쪼개진다. */}
                <h3 className="mt-6 text-[22px] font-semibold text-ink-strong lg:text-[26px]">
                  {area.title || area.name}
                </h3>
                <p className="mt-3 text-[15px] leading-[1.6] text-muted lg:text-[16px]">
                  {area.subtitle}
                </p>
                <span className="mt-auto pt-7">
                  <span className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-line bg-white px-6 text-[15px] font-semibold text-ink-strong transition-colors duration-200 group-hover:border-accent group-hover:text-accent-text">
                    {language === "ko" ? "자세히 보기" : "Learn more"}
                    <Arrow className="transition-transform duration-200 group-hover:translate-x-1" />
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </Rail>
      </div>
    </section>
  );
}
