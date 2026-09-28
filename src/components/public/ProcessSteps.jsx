const COLUMN_CLASS_BY_COUNT = {
  4: "lg:grid-cols-4",
  5: "lg:grid-cols-5",
  6: "lg:grid-cols-6",
};

export default function ProcessSteps({ steps }) {
  const columnClass = COLUMN_CLASS_BY_COUNT[steps.length] ?? "lg:grid-cols-5";

  return (
    <ol className={`grid grid-cols-1 gap-10 lg:gap-8 ${columnClass}`}>
      {steps.map((step, index) => (
        <li
          key={index}
          className="bw-reveal relative border-l-2 border-line pl-6 lg:border-l-0 lg:pl-0"
          style={{ transitionDelay: `${index * 80}ms` }}
        >
          <span className="absolute -left-[7px] top-0 size-3 rounded-full bg-accent lg:hidden" />
          <div className="hidden items-center lg:flex">
            <span className="size-3 shrink-0 rounded-full bg-accent" />
            <span className="h-[2px] w-full bg-line" />
          </div>
          <p className="mt-4 text-[16px] font-bold text-accent-text lg:mt-6">
            {`STEP ${String(index + 1).padStart(2, "0")}`}
          </p>
          <h3 className="mt-2 text-[22px] font-semibold text-ink-strong lg:text-[28px]">
            {step.title}
          </h3>
          <p className="mt-2 text-[18px] leading-[1.75]">{step.desc}</p>
        </li>
      ))}
    </ol>
  );
}
