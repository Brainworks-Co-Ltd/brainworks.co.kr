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
        {/* 채워진 칸이 마우스를 따라 옮겨 다닌다. 처음에는 첫 칸이 채워져 있고
            다른 칸에 마우스가 올라가면 그쪽으로 넘어간다. 색 규칙은 칸 사이를
            오가야 해서 industrial.css의 .bw-proofs가 들고 있다. */}
        <ul className="bw-proofs grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {homeCopy.proofs.map((proof, index) => (
            <li key={proof.title.ko}>
              <div
                className="bw-proof bw-reveal"
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  className="bw-proof__icon"
                  aria-hidden="true"
                >
                  {PROOF_ICONS[index]}
                </svg>
                <p className="bw-proof__label">{proof.label[language]}</p>
                <h3 className="bw-proof__title">{proof.title[language]}</h3>
                <p className="bw-proof__desc">{proof.desc[language]}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
