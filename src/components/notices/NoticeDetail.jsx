import Link from "next/link";
import { useLocale } from "@/shared/routing/useLocale";

export default function NoticeDetail({ notice }) {
  const { language } = useLocale();
  return (
    <article className="mx-auto max-w-4xl px-6 py-16">
      <div className="border-b border-slate-200 pb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--bw-color-muted)]">{notice.date}</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-[-0.025em] text-[var(--bw-color-ink)] md:text-5xl">{notice.title}</h1>
      </div>
      <div className="prose prose-lg mt-10 max-w-none" dangerouslySetInnerHTML={{ __html: notice.contentHtml }} />
      {notice.attachments?.length ? (
        <section className="mt-12 rounded-3xl border border-slate-200 bg-slate-50 p-6" aria-labelledby="notice-attachments">
          <h2 id="notice-attachments" className="text-lg font-semibold">{language === "ko" ? "첨부파일" : "Attachments"}</h2>
          <ul className="mt-4 space-y-2">{notice.attachments.map((file) => <li key={file.id}><a className="text-sm font-medium text-sky-700 underline" href={file.downloadUrl}>{file.displayName}</a></li>)}</ul>
        </section>
      ) : null}
      <Link href={notice.backHref || "/notices"} className="mt-12 inline-flex text-sm font-semibold text-[var(--bw-color-ink)] underline-offset-4 hover:underline">← {language === "ko" ? "공지사항 목록으로" : "Back to notices"}</Link>
    </article>
  );
}
