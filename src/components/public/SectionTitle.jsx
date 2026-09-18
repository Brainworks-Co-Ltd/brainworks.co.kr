export const Arrow = ({ className = "" }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    aria-hidden="true"
    className={className}
  >
    <path
      d="M2 8h11M8.5 3.5 13 8l-4.5 4.5"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/*
 * after는 제목 묶음에 속하는 보조 정보(과정 형식 칩 등)다. 제목 묶음 안에 두어야
 * 부제 바로 아래 붙고, 본문과는 표준 간격(mb-16/20) 하나만 벌어진다.
 */
export default function SectionTitle({ children, sub, after = null }) {
  return (
    <div className="bw-reveal mb-16 text-center lg:mb-20">
      <h2 className="text-[28px] font-semibold leading-[1.3] text-ink lg:text-[40px]">
        {children}
      </h2>
      {sub && (
        <p className="mt-6 whitespace-pre-line text-[17px] leading-[1.6] lg:text-[20px]">
          {sub}
        </p>
      )}
      {after ? <div className="mt-8">{after}</div> : null}
    </div>
  );
}
