import { FormEvent, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdminPage } from "@/server/auth/require-admin";

const initial = { koTitle: "", koBody: "", enTitle: "", enBody: "" };
export default function NewPopupNotice() {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [error, setError] = useState("");
  const update =
    (key: keyof typeof initial) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((current) => ({ ...current, [key]: event.target.value }));

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const response = await fetch("/api/admin/popup-notices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        locales: {
          ko: { title: form.koTitle, bodyMarkdown: form.koBody },
          en: { title: form.enTitle, bodyMarkdown: form.enBody },
        },
      }),
    });
    if (!response.ok) {
      setError("저장하지 못했습니다.");
      return;
    }
    await router.push("/admin/popup-notices");
  }

  return (
    <AdminShell activePath="/admin/popup-notices">
      <AdminPageHeader
        title="새 팝업 공지"
        description="제목은 모든 로케일에 필요합니다. 공지사항 연결 없이도 게시할 수 있습니다."
      />
      <form onSubmit={submit} className="mt-8 grid gap-6">
        {(["ko", "en"] as const).map((locale) => {
          const titleId = `popup-locale-${locale}`;
          return (
            <section
              key={locale}
              aria-labelledby={titleId}
              className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6"
            >
              <h2 id={titleId} className="font-semibold">
                {locale === "ko" ? "한국어" : "English"}
              </h2>
              <label className="grid gap-2 text-sm font-medium">
                식별 제목
                <input
                  required
                  value={form[`${locale}Title`]}
                  onChange={update(`${locale}Title`)}
                  className="min-h-11 rounded-xl border border-slate-300 px-3"
                />
              </label>
              <label className="grid gap-2 text-sm font-medium">
                본문
                <textarea
                  value={form[`${locale}Body`]}
                  onChange={update(`${locale}Body`)}
                  rows={6}
                  className="rounded-xl border border-slate-300 px-3 py-2"
                />
              </label>
            </section>
          );
        })}
        {error ? (
          <p
            role="alert"
            className="rounded-xl bg-red-50 p-4 text-sm text-red-700"
          >
            {error}
          </p>
        ) : null}
        <div className="flex gap-3">
          <Link
            href="/admin/popup-notices"
            className="rounded-full border border-slate-300 px-5 py-2 text-sm font-semibold"
          >
            취소
          </Link>
          <button className="rounded-full bg-[var(--bw-color-ink)] px-5 py-2 text-sm font-semibold text-white">
            초안 저장
          </button>
        </div>
      </form>
    </AdminShell>
  );
}
export const getServerSideProps = requireAdminPage;
