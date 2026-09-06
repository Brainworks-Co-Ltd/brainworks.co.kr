import Link from "next/link";
import { PageHeroMedia } from "@/components/public/PageHeroMedia";
import {
  GraphicMotionControl,
  useGraphicMotion,
} from "@/components/public/GraphicMotionControl";

/**
 * @typedef {{ kind: "image" | "gif" | "video", src: string, poster?: string, alt?: string, objectPosition?: string }} HeroMedia
 * @typedef {{ href: string, label: string }} HeroAction
 * @typedef {{ eyebrow?: string | null, title: string, description?: string | null, action?: HeroAction | null, secondaryAction?: HeroAction | null, dark?: boolean, children?: import("react").ReactNode, variant?: "plain" | "media" | "split", media?: HeroMedia | null, overlayClassName?: string }} PageHeroProps
 */

/*
 * 눈썹 자간은 글자 체계에 따라 다르게 준다. 0.22em은 라틴 대문자 기준이고
 * 한글에 그대로 걸면 낱자가 흩어져 읽힌다. 상세 페이지가 눈썹에 서비스명을
 * 한글로 넣으면서 두 경우가 같이 생겼다.
 *
 * 어두운 히어로의 눈썹 색은 --bw-accent다. --bw-color-brand는 industrial
 * 스코프에서 잉크(#16181d)로 덮여 있어 어두운 면에서 읽히지 않는다. 그동안은
 * industrial.css의 [class*="uppercase"][class*="tracking"] 규칙이 색을 덮어써서
 * 가려져 있었다. 클래스 문자열에 기대는 그 경로 대신 토큰을 직접 지정한다.
 * 08 §2.3이 영역색의 적용처로 히어로 글자를 지목했고 대비도 5.79~9.38로 실측돼 있다.
 */
function hasHangul(value) {
  return /[ㄱ-ㆎ가-힣]/.test(String(value));
}

function HeroContent({
  eyebrow,
  title,
  description,
  action,
  secondaryAction,
  dark,
  children,
}) {
  return (
    <>
      {eyebrow ? (
        <p
          className={`bw-page-hero__eyebrow text-sm font-semibold ${hasHangul(eyebrow) ? "tracking-[0.02em]" : "uppercase tracking-[0.22em]"} ${dark ? "text-[var(--bw-accent)]" : "text-[var(--bw-color-muted)]"}`}
        >
          {eyebrow}
        </p>
      ) : null}
      <h1 className="bw-display mt-4 max-w-4xl [.text-center_&]:mx-auto">
        {title}
      </h1>
      {description ? (
        <p
          className={`bw-page-hero__description bw-title mt-6 max-w-3xl [.text-center_&]:mx-auto ${dark ? "text-white/75" : "text-[var(--bw-color-muted)]"}`}
        >
          {description}
        </p>
      ) : null}
      {action || secondaryAction ? (
        <div className="mt-8 flex flex-wrap gap-3 [.text-center_&]:justify-center">
          {action ? (
            <Link
              href={action.href}
              className="bw-hero-primary inline-flex min-h-11 items-center rounded-full bg-[var(--bw-color-brand)] px-6 py-3 text-sm font-semibold text-[var(--bw-color-surface)] transition hover:brightness-95"
            >
              {action.label}
            </Link>
          ) : null}
          {secondaryAction ? (
            <Link
              href={secondaryAction.href}
              className={`bw-hero-secondary inline-flex min-h-11 items-center rounded-full border px-6 py-3 text-sm font-semibold transition ${dark ? "border-white/30 text-white hover:bg-white/10" : "border-[var(--bw-color-ink)] text-[var(--bw-color-ink)] hover:bg-white"}`}
            >
              {secondaryAction.label}
            </Link>
          ) : null}
        </div>
      ) : null}
      {children ? <div className="mt-8">{children}</div> : null}
    </>
  );
}

/** @param {PageHeroProps} props */
export function PageHero({
  eyebrow,
  title,
  description,
  action = null,
  secondaryAction = null,
  dark = false,
  children = null,
  variant = "plain",
  media = null,
  overlayClassName = "",
}) {
  const motion = useGraphicMotion();
  const effectiveVariant = variant === "plain" || !media ? "plain" : variant;
  const content = (
    <HeroContent
      eyebrow={eyebrow}
      title={title}
      description={description}
      action={action}
      secondaryAction={secondaryAction}
      dark={dark || effectiveVariant === "media"}
      children={children}
    />
  );

  if (effectiveVariant === "media") {
    return (
      <section
        role="region"
        aria-label={title}
        data-variant="media"
        data-motion-paused={motion.paused}
        className="bw-service-hero relative isolate min-h-[34rem] overflow-hidden pt-28 text-white"
      >
        {/* 전면 그래픽. 스크림과 모션은 industrial.css의 .bw-hero-media가 맡는다. */}
        <div
          className="bw-hero-media absolute inset-0 -z-20"
          key={motion.run}
          onAnimationEnd={motion.finish}
        >
          <PageHeroMedia media={media} />
          <div className="bw-hero-media__tint" aria-hidden="true" />
        </div>
        {overlayClassName ? (
          <div className={`absolute inset-0 -z-10 ${overlayClassName}`} />
        ) : null}
        <div className="bw-service-hero__content mx-auto max-w-6xl px-6 py-20 md:py-28">
          {content}
        </div>
        <GraphicMotionControl motion={motion} />
      </section>
    );
  }

  if (effectiveVariant === "split") {
    return (
      <section
        role="region"
        aria-label={title}
        data-variant="split"
        className="border-b border-slate-200 bg-white pt-28 text-[var(--bw-color-ink)]"
      >
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-20 md:grid-cols-2 md:items-center md:py-28">
          <div>{content}</div>
          <div className="min-h-72 overflow-hidden rounded-[var(--bw-radius-feature)]">
            <PageHeroMedia media={media} />
          </div>
        </div>
      </section>
    );
  }

  const surface = dark
    ? "bw-hero-texture bg-[var(--bw-color-ink)] text-white"
    : "bw-page-hero";

  return (
    <section
      role="region"
      aria-label={title}
      data-variant="plain"
      className={`pt-28 ${surface}`}
    >
      <div className="mx-auto max-w-4xl px-6 py-20 text-center md:py-28">
        {content}
      </div>
    </section>
  );
}
