import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdminPage } from "@/server/auth/require-admin";

const initialForm = {
  slug: "",
  category: "회사 소식",
  displayDate: new Date().toISOString().slice(0, 10),
  koTitle: "",
  koSummary: "",
  koBody: "",
  enTitle: "",
  enSummary: "",
  enBody: "",
};

export default function NewNews() {
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const update =
    (key: keyof typeof initialForm) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((current) => ({ ...current, [key]: event.target.value }));

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/admin/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: form.slug,
          category: form.category,
          displayDate: form.displayDate,
          locales: {
            ko: {
              title: form.koTitle,
              summary: form.koSummary,
              bodyMarkdown: form.koBody,
            },
            en: {
              title: form.enTitle,
              summary: form.enSummary,
              bodyMarkdown: form.enBody,
            },
          },
        }),
      });
      if (!response.ok) {
        setError("저장하지 못했습니다. 입력값과 관리자 세션을 확인해 주세요.");
        return;
      }
      await router.push("/admin/news");
    } catch {
      setError("저장 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AdminShell activePath="/admin/news">
      <AdminPageHeader
        title="새 뉴스"
        description="국문과 영문 원문을 함께 작성합니다."
      />
      <form className="mt-8 grid gap-8" onSubmit={submit}>
        <section className="grid gap-5 rounded-2xl border border-slate-200 bg-white p-6 md:grid-cols-3">
          <label className="grid gap-2 text-sm font-medium">
            슬러그
            <input
              required
              value={form.slug}
              onChange={update("slug")}
              className="min-h-11 rounded-xl border border-slate-300 px-3"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium">
            분류
            <input
              required
              value={form.category}
              onChange={update("category")}
              className="min-h-11 rounded-xl border border-slate-300 px-3"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium">
            표시일
            <input
              type="date"
              required
              value={form.displayDate}
              onChange={update("displayDate")}
              className="min-h-11 rounded-xl border border-slate-300 px-3"
            />
          </label>
        </section>
        <section className="grid gap-6 lg:grid-cols-2">
          {["ko", "en"].map((locale) => (
            <section
              key={locale}
              aria-labelledby={`news-locale-${locale}`}
              className="grid gap-5 rounded-2xl border border-slate-200 bg-white p-6"
            >
              <h2
                id={`news-locale-${locale}`}
                className="text-lg font-semibold"
              >
                {locale === "ko" ? "한국어" : "English"}
              </h2>
              <label className="grid gap-2 text-sm font-medium">
                제목
                <input
                  required
                  value={form[`${locale}Title` as keyof typeof form]}
                  onChange={update(
                    `${locale}Title` as keyof typeof initialForm,
                  )}
                  className="min-h-11 rounded-xl border border-slate-300 px-3"
                />
              </label>
              <label className="grid gap-2 text-sm font-medium">
                요약
                <textarea
                  required
                  value={form[`${locale}Summary` as keyof typeof form]}
                  onChange={update(
                    `${locale}Summary` as keyof typeof initialForm,
                  )}
                  rows={3}
                  className="rounded-xl border border-slate-300 px-3 py-2"
                />
              </label>
              <label className="grid gap-2 text-sm font-medium">
                Markdown 본문
                <textarea
                  required
                  value={form[`${locale}Body` as keyof typeof form]}
                  onChange={update(`${locale}Body` as keyof typeof initialForm)}
                  rows={12}
                  className="rounded-xl border border-slate-300 px-3 py-2 font-mono text-sm"
                />
              </label>
            </section>
          ))}
        </section>
        {error ? (
          <p
            role="alert"
            className="rounded-xl bg-red-50 p-4 text-sm text-red-700"
          >
            {error}
          </p>
        ) : null}
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/news"
            className="inline-flex min-h-11 items-center rounded-full border border-slate-300 px-5 text-sm font-semibold"
          >
            취소
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex min-h-11 items-center rounded-full bg-[var(--bw-color-ink)] px-5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {isSubmitting ? "저장 중…" : "초안 저장"}
          </button>
        </div>
      </form>
    </AdminShell>
  );
}

export const getServerSideProps = requireAdminPage;
