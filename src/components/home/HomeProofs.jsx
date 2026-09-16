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
        <ul className="grid grid-cols-2 gap-x-6 gap-y-14 text-center lg:grid-cols-4">
          {homeCopy.proofs.map((proof, index) => (
            <li key={proof.title.ko} className="lg:py-20">
              <div
                className="bw-reveal"
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  className="mx-auto text-accent"
                  aria-hidden="true"
                >
                  {PROOF_ICONS[index]}
                </svg>
                <p className="mt-8 text-[15px] text-muted lg:text-[16px]">
                  {proof.label[language]}
                </p>
                <h3 className="mt-3 text-[22px] font-semibold text-ink-strong [overflow-wrap:anywhere] lg:text-[24px]">
                  {proof.title[language]}
                </h3>
                <p className="mt-4 text-[15px] leading-[1.6] lg:text-[17px]">
                  {proof.desc[language]}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
