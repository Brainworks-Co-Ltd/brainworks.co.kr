/*
 * 항목 제목이 크고 설명이 작으면 텍스트를 가렸을 때 모든 항목이 같은 무게로
 * 보인다. 여기서는 제목을 번호와 함께 작은 강조색 라벨로 내리고, 설명 한 문장을
 * 크고 굵게 세우고, 세부 항목은 오른쪽에 옅게 둔다. 영역 세부 페이지의
 * 솔루션 행과 같은 위계다.
 *
 * @param {{ items: { id: string, title: string, description: string, points?: string[] }[] }} props
 */
export default function FeatureRows({ items }) {
  return (
    <div className="border-b border-line">
      {items.map((item, index) => (
        <article
          key={item.id}
          style={{ transitionDelay: `${Math.min(index, 6) * 80}ms` }}
          className="bw-reveal grid grid-cols-1 gap-6 border-t border-line py-10 lg:grid-cols-12 lg:gap-12 lg:py-14"
        >
          <div className="lg:col-span-7">
            <h3 className="flex items-baseline gap-3 text-[15px] font-bold text-accent-text lg:text-[16px]">
              <span className="tabular-nums">
                {String(index + 1).padStart(2, "0")}
              </span>
              {item.title}
            </h3>
            <p className="mt-4 text-[24px] font-bold leading-[1.4] break-keep text-pretty text-ink-strong lg:text-[32px]">
              {item.description}
            </p>
          </div>
          {item.points?.length ? (
            <ul className="space-y-3 lg:col-span-5 lg:pt-10">
              {item.points.map((point) => (
                <li
                  key={point}
                  className="flex items-start gap-2 text-[17px] leading-[1.7] break-keep text-muted-foreground"
                >
                  <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-accent" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </article>
      ))}
    </div>
  );
}
