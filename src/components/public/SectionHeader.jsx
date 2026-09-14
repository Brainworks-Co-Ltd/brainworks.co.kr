import Link from "next/link";

export function SectionHeader({
  eyebrow,
  title,
  description,
  href,
  linkLabel,
  align = "left",
  className = "",
}) {
  /*
   * max-w-3xl은 설명 문장의 줄길이를 잡기 위한 것이지 링크까지 가둘 이유가 없다.
   * 이전에는 링크가 그 768px 경계 오른쪽 끝에 붙어, 화면에 아무것도 없는 자리에
   * 정렬돼 있었다. 실측에서 링크는 936에서 끝나는데 아래 목록은 1272까지 갔다.
   * 글 묶음만 max-w-3xl로 두고 링크는 바깥 컨테이너 오른쪽 끝에 맞춘다.
   */
  return (
    <div
      className={`flex flex-wrap items-end justify-between gap-x-8 gap-y-4 ${className}`}
    >
      <div
        className={`max-w-3xl ${align === "center" ? "mx-auto text-center" : ""}`}
      >
        {eyebrow ? (
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--bw-color-muted)]">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="bw-h1 mt-3 text-[var(--bw-color-ink)]">{title}</h2>
        {description ? (
          <p className="bw-body mt-3 text-[var(--bw-color-muted)]">
            {description}
          </p>
        ) : null}
      </div>
      {href && linkLabel ? (
        <Link
          href={href}
          className="shrink-0 text-sm font-semibold text-[var(--bw-color-ink)] underline-offset-4 hover:underline"
        >
          {linkLabel}
        </Link>
      ) : null}
    </div>
  );
}
