import Image from "next/image";

/**
 * 이미지가 카드 위쪽을 꽉 채우는 카드.
 *
 * 기존 솔루션 목록은 MediaStory 지그재그였다. 이미지와 글이 좌우로 갈려
 * 한 항목이 화면 하나를 먹었고, 넷을 나란히 비교할 수가 없었다.
 * 상세 페이지가 하는 일이 "내 상황에 맞는 것을 고르게 한다"(detail-page-roles.md)
 * 이므로 고를 수 있게 격자로 세운다.
 */
export function SolutionCard({ index, total, title, description, image }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-[var(--bw-radius-card)] border border-[var(--bw-line-strong)] bg-[var(--bw-color-surface)]">
      <div className="relative aspect-[16/10] overflow-hidden bg-[var(--bw-color-surface-muted)]">
        <Image
          src={image}
          alt={title}
          fill
          sizes="(min-width: 1024px) 45vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </div>
      <div className="flex flex-1 flex-col p-[var(--bw-space-6)]">
        <p className="bw-label text-[var(--bw-accent-text)]">
          {String(index).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </p>
        <h4 className="bw-h2 mt-3 text-[var(--bw-color-ink)]">{title}</h4>
        {description ? (
          <p className="bw-body mt-3 text-[var(--bw-color-muted)]">
            {description}
          </p>
        ) : null}
      </div>
    </article>
  );
}
