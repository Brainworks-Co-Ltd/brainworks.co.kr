import { useLocale } from "@/shared/routing/useLocale";
import SectionTitle from "@/components/public/SectionTitle";
import { homeCopy } from "@/data/homeCopy";

const PROOF_ICONS = [
  <circle
    key="0"
    cx="12"
    cy="12"
    r="7"
    stroke="currentColor"
    strokeWidth="5"
    fill="none"
  />,
  <path
    key="1"
    d="M3 20V8a4 4 0 0 1 8 0v12M13 20V8a4 4 0 0 1 8 0v12"
    stroke="currentColor"
    strokeWidth="4"
    strokeLinecap="round"
    fill="none"
  />,
  <path
    key="2"
    d="M12 2v20M2 12h20M4.9 4.9l14.2 14.2M19.1 4.9 4.9 19.1"
    stroke="currentColor"
    strokeWidth="3.5"
    strokeLinecap="round"
  />,
  <path key="3" d="M12 2 22 12 12 22 2 12Z" fill="currentColor" />,
];

export default function HomeProofs() {
  const { language } = useLocale();

  return (
    <section className="py-[120px] lg:py-[250px]">
      <div className="inner">
        <SectionTitle>{homeCopy.proofSection.title[language]}</SectionTitle>
        {/* 네 칸이 흰 바탕에 글자만 있어 구간이 비어 보였다. 면을 주고 첫 칸은
            강조색으로 채운다. 첫 칸은 회사가 스스로를 소개하는 문장이라
            나머지와 무게가 다르다. 링크가 아니므로 hover로 색을 바꾸지 않는다.
            누를 수 없는 것이 눌릴 것처럼 보이면 그게 더 큰 문제다. */}
        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {homeCopy.proofs.map((proof, index) => {
            const filled = index === 0;
            return (
              <li key={proof.title.ko} className="h-full">
                <div
                  className={`bw-reveal flex h-full flex-col rounded-[24px] p-8 text-center ${filled ? "bg-accent text-white" : "bg-tint"}`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    className={`mx-auto ${filled ? "text-white" : "text-accent"}`}
                    aria-hidden="true"
                  >
                    {PROOF_ICONS[index]}
                  </svg>
                  <p
                    className={`mt-8 text-[15px] lg:text-[16px] ${filled ? "text-white/75" : "text-muted"}`}
                  >
                    {proof.label[language]}
                  </p>
                  <h3
                    className={`mt-3 text-[22px] font-semibold [overflow-wrap:anywhere] lg:text-[24px] ${filled ? "text-white" : "text-ink-strong"}`}
                  >
                    {proof.title[language]}
                  </h3>
                  <p
                    className={`mt-4 text-[15px] leading-[1.6] lg:text-[17px] ${filled ? "text-white/85" : ""}`}
                  >
                    {proof.desc[language]}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
