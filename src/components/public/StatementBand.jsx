import { useLocale } from "@/shared/routing/useLocale";

/*
 * 선언 구간. 문장 전체를 옅게 깔고 핵심 구절만 흰색으로 세운다.
 *
 * 포인터를 따라 어절을 밝히던 방식은 어디에 눈을 둬야 하는지 말해 주지
 * 못했고, 켜진 곳과 꺼진 곳의 차이도 작아 효과가 있는 이유가 읽히지 않았다.
 * 강조 구절은 카피와 함께 정해 emphasis로 넘긴다. 강조가 없으면 문장
 * 전체를 흰색으로 둔다.
 */
function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function splitByEmphasis(text, emphasis) {
  if (!emphasis.length) return [{ text, lit: true }];
  const pattern = new RegExp(`(${emphasis.map(escapeRegExp).join("|")})`);
  return text
    .split(pattern)
    .filter(Boolean)
    .map((part) => ({ text: part, lit: emphasis.includes(part) }));
}

/** @param {{ eyebrow?: string | null, text: string, emphasis?: string[] }} props */
export function StatementBand({ eyebrow, text, emphasis = [] }) {
  const { language } = useLocale();
  const parts = splitByEmphasis(text, emphasis);

  return (
    <section
      className="bw-statement"
      aria-label={eyebrow || (language === "ko" ? "선언" : "Statement")}
    >
      <div className="bw-statement__inner">
        {eyebrow ? <p className="bw-statement__eyebrow">{eyebrow}</p> : null}
        <p className="bw-statement__text">
          {parts.map((part, index) => (
            <span
              key={`${part.text}-${index}`}
              className={part.lit ? "bw-statement__lit" : "bw-statement__dim"}
            >
              {part.text}
            </span>
          ))}
        </p>
      </div>
    </section>
  );
}

export default StatementBand;
