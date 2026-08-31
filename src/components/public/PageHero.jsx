import Link from "next/link";
import { PageHeroMedia } from "@/components/public/PageHeroMedia";

/**
 * @typedef {{ kind: "image" | "gif" | "video", src: string, poster?: string, alt?: string, objectPosition?: string }} HeroMedia
 * @typedef {{ href: string, label: string }} HeroAction
 * @typedef {{ eyebrow?: string | null, title: string, description?: string | null, action?: HeroAction | null, secondaryAction?: HeroAction | null, dark?: boolean, children?: import("react").ReactNode, variant?: "plain" | "media" | "split", media?: HeroMedia | null, overlayClassName?: string, tone?: "consulting" | "education" | "global" | null }} PageHeroProps
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
      <h1 className="mt-4 max-w-4xl text-4xl font-semibold leading-tight tracking-[-0.025em] md:text-6xl">
        {title}
      </h1>
      {description ? (
        <p
          className={`bw-page-hero__description mt-6 max-w-3xl text-lg leading-8 md:text-xl ${dark ? "text-white/75" : "text-[var(--bw-color-muted)]"}`}
        >
          {description}
        </p>
      ) : null}
      {action || secondaryAction ? (
        <div className="mt-8 flex flex-wrap gap-3">
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
  tone = null,
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

  const toneClass = tone ? `bw-page-hero bw-page-hero--${tone}` : "";
  const surface = dark
    ? "bg-[var(--bw-color-ink)] text-white"
    : toneClass ||
      "border-b border-slate-200 bg-[var(--bw-color-surface-muted)] text-[var(--bw-color-ink)]";

  return (
    <section
      role="region"
      aria-label={title}
      data-variant="plain"
      className={`pt-28 ${surface}`}
    >
      <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">{content}</div>
    </section>
  );
}
