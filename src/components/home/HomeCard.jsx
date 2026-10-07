import Image from "next/image";
import Link from "next/link";
import { Arrow } from "@/components/public/SectionTitle";

/*
 * 홈의 사업 영역과 솔루션이 같이 쓰는 카드. 면 없이 그림, 제목, 설명을 세로로 둔다.
 * 사업 영역은 eyebrow와 more 없이 분류처럼, 솔루션은 영역 이름을 eyebrow로 달고
 * "자세히 보기"를 붙여 제품처럼 읽힌다. 차이는 정보량뿐이고 모양은 같다.
 */
export default function HomeCard({
  href,
  image,
  alt = "",
  eyebrow,
  title,
  description,
  more,
  className = "",
}) {
  return (
    <Link
      href={href}
      className={`group flex h-full items-center gap-4 md:flex-col md:items-stretch md:gap-0 ${className}`}
    >
      {/* 폰에서는 작은 정사각 그림 옆에 글을 두어 영역 머리를 한 줄로 줄인다. */}
      <span className="relative block aspect-square w-24 shrink-0 overflow-hidden rounded-xl md:aspect-[409/268] md:w-auto md:rounded-2xl">
        <Image
          src={image}
          alt={alt}
          fill
          sizes="(min-width: 768px) 409px, 96px"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </span>
      <span className="flex min-w-0 flex-col md:contents">
        {eyebrow ? (
          <span className="mt-5 text-[13px] font-semibold text-[var(--bw-color-brand-strong)]">
            {eyebrow}
          </span>
        ) : null}
        <h3
          className={`${eyebrow ? "mt-1.5" : "md:mt-6"} break-keep text-[20px] font-semibold leading-[1.3] text-ink-strong transition-colors group-hover:text-accent-text md:text-[18px] md:leading-[inherit] lg:text-[22px]`}
        >
          {title}
        </h3>
        {description ? (
          <p className="mt-2 break-keep text-[14px] leading-[1.5] text-muted md:mt-3 md:text-[15px] md:leading-[1.6] lg:text-[16px]">
            {description}
          </p>
        ) : null}
        {more ? (
          <span className="mt-auto inline-flex items-center gap-2 pt-4 text-[15px] font-semibold text-ink transition-colors group-hover:text-accent-text">
            {more}{" "}
            <Arrow className="transition-transform duration-200 group-hover:translate-x-1" />
          </span>
        ) : null}
      </span>
    </Link>
  );
}
