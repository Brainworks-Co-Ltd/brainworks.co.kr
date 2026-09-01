import Link from "next/link";
import { PageHeroMedia } from "@/components/public/PageHeroMedia";

/**
 * @typedef {{ kind: "image" | "gif" | "video", src: string, poster?: string, alt?: string, objectPosition?: string }} HeroMedia
 * @typedef {{ href: string, label: string }} HeroAction
 * @typedef {{ eyebrow?: string | null, title: string, description?: string | null, action?: HeroAction | null, secondaryAction?: HeroAction | null, dark?: boolean, children?: import("react").ReactNode, variant?: "plain" | "media" | "split", media?: HeroMedia | null, overlayClassName?: string, showcase?: { src: string, alt: string } | null }} PageHeroProps
 */

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
          className={`bw-page-hero__eyebrow text-sm font-semibold uppercase tracking-[0.22em] ${dark ? "text-[var(--bw-color-brand)]" : "text-[var(--bw-color-muted)]"}`}
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
              className="inline-flex min-h-11 items-center rounded-full bg-[var(--bw-color-brand)] px-6 py-3 text-sm font-semibold text-[var(--bw-color-surface)] transition hover:brightness-95"
            >
              {action.label}
            </Link>
          ) : null}
          {secondaryAction ? (
            <Link
              href={secondaryAction.href}
              className={`inline-flex min-h-11 items-center rounded-full border px-6 py-3 text-sm font-semibold transition ${dark ? "border-white/30 text-white hover:bg-white/10" : "border-[var(--bw-color-ink)] text-[var(--bw-color-ink)] hover:bg-white"}`}
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
  showcase = null,
}) {
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
        className="relative isolate min-h-[34rem] overflow-hidden pt-28 text-white"
      >
        <div className="absolute inset-0 -z-20">
          <PageHeroMedia media={media} />
        </div>
        {overlayClassName ? (
          <div className={`absolute inset-0 -z-10 ${overlayClassName}`} />
        ) : null}
        <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">{content}</div>
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
    ? "bg-[var(--bw-color-ink)] text-white"
    : "bw-page-hero";

  /* 제품 화면을 히어로 아래에 띄워 다음 구간으로 걸치게 한다.
   * classting.com/features/personalized-learning 실측(2026-09-01):
   * 히어로가 문구만으로 끝나지 않고 제품 화면이 바로 따라붙는다.
   * 그쪽은 목업을 이미지에 구워 내보냈고, 여기서는 CSS로 같은 자리에 놓는다. */
  if (showcase) {
    return (
      <section
        role="region"
        aria-label={title}
        data-variant="plain"
        className={`pt-28 ${surface}`}
      >
        <div className="mx-auto max-w-4xl px-6 pt-20 text-center md:pt-28">
          {content}
        </div>
        <div className="mx-auto max-w-6xl px-6 pb-20 pt-16 md:pb-28 md:pt-20">
          <div className="bw-hero-showcase overflow-hidden rounded-[var(--bw-radius-card)] bg-[var(--bw-color-surface)] shadow-[0_32px_80px_rgb(0_0_0/45%)]">
            <img
              src={showcase.src}
              alt={showcase.alt}
              className="block h-auto w-full"
            />
          </div>
        </div>
      </section>
    );
  }

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
