import SectionTitle from "@/components/public/SectionTitle";

/**
 * @typedef {{ eyebrow?: string | null, title: import("react").ReactNode, description?: string | null, after?: import("react").ReactNode }} DetailSectionHeadProps
 */

/** @param {DetailSectionHeadProps} props */
export default function DetailSectionHead({
  eyebrow = null,
  title,
  description = null,
  after = null,
}) {
  return (
    <div>
      {eyebrow && (
        <p className="text-center text-[16px] font-bold text-accent-text mb-4">
          {eyebrow}
        </p>
      )}
      <SectionTitle sub={description} after={after}>
        {title}
      </SectionTitle>
    </div>
  );
}
