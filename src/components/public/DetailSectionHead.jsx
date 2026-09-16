import SectionTitle from "@/components/public/SectionTitle";

/**
 * @typedef {{ eyebrow?: string | null, title: import("react").ReactNode, description?: string | null }} DetailSectionHeadProps
 */

/** @param {DetailSectionHeadProps} props */
export default function DetailSectionHead({
  eyebrow = null,
  title,
  description = null,
}) {
  return (
    <div>
      {eyebrow && (
        <p className="text-center text-[16px] font-bold text-accent-text mb-4">
          {eyebrow}
        </p>
      )}
      <SectionTitle sub={description}>{title}</SectionTitle>
    </div>
  );
}
