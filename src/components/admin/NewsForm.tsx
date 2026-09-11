import { type FormEvent, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { AdminFormFeedback } from "@/components/admin/AdminFormFeedback";
import { LocalePublicationPanel } from "@/components/admin/LocalePublicationPanel";
import { useUnsavedChanges } from "@/hooks/useUnsavedChanges";
import {
  adminApiErrorMessage,
  requestAdminApi,
} from "@/lib/admin-api";
import { suggestSlug } from "@/lib/news-slug";

type NewsLocaleValue = {
  title: string;
  summary: string;
  bodyMarkdown: string;
  coverAlt: string;
  publicationStatus: string;
};

export type NewsFormValue = {
  id?: string;
  version: number;
  itemStatus: "ACTIVE" | "ARCHIVED";
  slug: string;
  category: string;
  displayDate: string;
  locales: Record<"ko" | "en", NewsLocaleValue>;
};

const categoryOptions = [
  ["COMPANY", "회사 소식"],
  ["BUSINESS", "사업"],
  ["PARTNERSHIP", "업무협약"],
  ["AWARD", "수상 및 인증"],
] as const;

const emptyLocale = (): NewsLocaleValue => ({
  title: "",
  summary: "",
  bodyMarkdown: "",
  coverAlt: "",
  publicationStatus: "DRAFT",
});

export function createEmptyNews(): NewsFormValue {
  return {
    version: 1,
    itemStatus: "ACTIVE",
    slug: "",
    category: "COMPANY",
    displayDate: new Date().toISOString().slice(0, 10),
    locales: { ko: emptyLocale(), en: emptyLocale() },
  };
}

export function NewsForm({ initial }: { initial: NewsFormValue }) {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [version, setVersion] = useState(initial.version);
  const [slugDraft, setSlugDraft] = useState(initial.slug);
  const [slugTouched, setSlugTouched] = useState(Boolean(initial.id));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [preview, setPreview] = useState<{
    locale: "ko" | "en";
    html: string;
  } | null>(null);
  const baseline = useRef(JSON.stringify(initial));
  const dirty = useMemo(
    () => JSON.stringify(form) !== baseline.current,
    [form],
  );
  const confirmNavigation = useUnsavedChanges(dirty);

  function updateLocale(
    locale: "ko" | "en",
    key: keyof NewsLocaleValue,
    value: string,
  ) {
    setForm((current) => {
      const next = {
        ...current,
        locales: {
          ...current.locales,
          [locale]: { ...current.locales[locale], [key]: value },
        },
      };
      if (!current.id && key === "title" && !slugTouched) {
        next.slug = suggestSlug(value, current.displayDate);
        setSlugDraft(next.slug);
      }
      return next;
    });
  }

  function inputPayload() {
    return {
      slug: form.slug,
      category: form.category,
      displayDate: form.displayDate,
      locales: {
        ko: {
          title: form.locales.ko.title,
          summary: form.locales.ko.summary,
          bodyMarkdown: form.locales.ko.bodyMarkdown,
          coverAlt: form.locales.ko.coverAlt || null,
        },
        en: {
          title: form.locales.en.title,
          summary: form.locales.en.summary,
          bodyMarkdown: form.locales.en.bodyMarkdown,
          coverAlt: form.locales.en.coverAlt || null,
        },
      },
    };
  }

  async function save(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      if (!form.id) {
        const created = await requestAdminApi<{ id: string }>("/api/admin/news", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(inputPayload()),
        });
        await router.push(`/admin/news/${created.id}`);
        return;
      }
      const result = await requestAdminApi<{ version: number }>(
        `/api/admin/news/${form.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            expectedVersion: version,
            input: inputPayload(),
          }),
        },
      );
      setVersion(result.version);
      baseline.current = JSON.stringify(form);
      setMessage("뉴스 내용을 저장했습니다.");
    } catch (caught) {
      setError(adminApiErrorMessage(caught));
    } finally {
      setBusy(false);
    }
  }

  async function changeSlug() {
    if (!form.id || slugDraft === form.slug) return;
    if (
      !window.confirm(
        "공개 주소를 변경하면 기존 주소는 새 주소로 이동됩니다. 변경하시겠습니까?",
      )
    )
      return;
    setBusy(true);
    setError("");
    try {
      const result = await requestAdminApi<{
        version: number;
        slug: string;
      }>(`/api/admin/news/${form.id}/slug`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: slugDraft, expectedVersion: version }),
      });
      const next = { ...form, slug: result.slug };
      setVersion(result.version);
      setForm(next);
      baseline.current = JSON.stringify(next);
      setMessage("뉴스 공개 주소를 변경했습니다.");
    } catch (caught) {
      setError(adminApiErrorMessage(caught));
    } finally {
      setBusy(false);
    }
  }

  async function localeCommand(locale: "ko" | "en", action: "publish" | "hide") {
    if (!form.id) return;
    if (dirty) {
      setError("변경 내용을 먼저 저장한 뒤 게시 상태를 변경해 주세요.");
      return;
    }
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const result = await requestAdminApi<{ version: number }>(
        `/api/admin/news/${form.id}/${action}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ locale, expectedVersion: version }),
        },
      );
      const next = {
        ...form,
        locales: {
          ...form.locales,
          [locale]: {
            ...form.locales[locale],
            publicationStatus: action === "publish" ? "PUBLISHED" : "HIDDEN",
          },
        },
      };
      setVersion(result.version);
      setForm(next);
      baseline.current = JSON.stringify(next);
      setMessage(
        `${locale === "ko" ? "국문" : "영문"}을 ${action === "publish" ? "게시했습니다" : "숨겼습니다"}.`,
      );
    } catch (caught) {
      setError(adminApiErrorMessage(caught));
    } finally {
      setBusy(false);
    }
  }

  async function itemCommand(action: "archive" | "restore") {
    if (!form.id) return;
    const prompt =
      action === "archive"
        ? "이 뉴스를 보관하면 공개 목록에서 제외됩니다. 계속하시겠습니까?"
        : "뉴스를 복원하면 두 언어 모두 초안 상태가 됩니다. 계속하시겠습니까?";
    if (!window.confirm(prompt)) return;
    setBusy(true);
    setError("");
    try {
      const result = await requestAdminApi<{ version: number }>(
        `/api/admin/news/${form.id}/${action}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ expectedVersion: version }),
        },
      );
      const next: NewsFormValue = {
        ...form,
        itemStatus: action === "archive" ? "ARCHIVED" : "ACTIVE",
        locales:
          action === "restore"
            ? {
                ko: { ...form.locales.ko, publicationStatus: "DRAFT" },
                en: { ...form.locales.en, publicationStatus: "DRAFT" },
              }
            : form.locales,
      };
      setVersion(result.version);
      setForm(next);
      baseline.current = JSON.stringify(next);
      setMessage(action === "archive" ? "뉴스를 보관했습니다." : "뉴스를 복원했습니다.");
    } catch (caught) {
      setError(adminApiErrorMessage(caught));
    } finally {
      setBusy(false);
    }
  }

  async function showPreview(locale: "ko" | "en") {
    setBusy(true);
    setError("");
    try {
      const result = await requestAdminApi<{ html: string }>(
        "/api/admin/previews/news",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ markdown: form.locales[locale].bodyMarkdown }),
        },
      );
      setPreview({ locale, html: result.html });
    } catch (caught) {
      setError(adminApiErrorMessage(caught));
    } finally {
      setBusy(false);
    }
  }

  const hasUnknownCategory = !categoryOptions.some(
    ([value]) => value === form.category,
  );

  return (
    <form onSubmit={save} className="grid gap-6">
      <section className="grid gap-5 rounded-2xl border border-slate-200 bg-white p-6 md:grid-cols-3">
        <div className="grid gap-2">
          <label htmlFor="news-slug" className="text-sm font-medium">
            공개 주소 이름
          </label>
          <div className="flex gap-2">
            <input
              id="news-slug"
              required
              value={form.id ? slugDraft : form.slug}
              onChange={(event) => {
                setSlugTouched(true);
                setSlugDraft(event.target.value);
                if (!form.id)
                  setForm((current) => ({
                    ...current,
                    slug: event.target.value,
                  }));
              }}
              pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
              className="min-h-11 min-w-0 flex-1 rounded-xl border border-slate-300 px-3"
            />
            {form.id ? (
              <button
                type="button"
                disabled={busy || slugDraft === form.slug}
                onClick={changeSlug}
                className="rounded-xl border border-slate-300 px-3 text-sm font-semibold disabled:opacity-60"
              >
                주소 변경
              </button>
            ) : null}
          </div>
          <span className="text-xs text-slate-500">
            영문 소문자, 숫자와 하이픈만 사용합니다. 제목을 입력하면 초안을
            제안합니다.
          </span>
        </div>
        <label className="grid gap-2 text-sm font-medium">
          분류
          <select
            value={form.category}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                category: event.target.value,
              }))
            }
            className="min-h-11 rounded-xl border border-slate-300 px-3"
          >
            {hasUnknownCategory ? (
              <option value={form.category}>{form.category}</option>
            ) : null}
            {categoryOptions.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-medium">
          표시일
          <input
            type="date"
            required
            value={form.displayDate}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                displayDate: event.target.value,
              }))
            }
            className="min-h-11 rounded-xl border border-slate-300 px-3"
          />
        </label>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        {(["ko", "en"] as const).map((locale) => (
          <section
            key={locale}
            className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6"
          >
            <h2 className="text-lg font-semibold">
              {locale === "ko" ? "한국어" : "English"}
            </h2>
            {(["title", "summary", "bodyMarkdown"] as const).map((key) => (
              <label key={key} className="grid gap-2 text-sm font-medium">
                {key === "title" ? "제목" : key === "summary" ? "요약" : "Markdown 본문"}
                {key === "title" ? (
                  <input
                    value={form.locales[locale][key]}
                    onChange={(event) =>
                      updateLocale(locale, key, event.target.value)
                    }
                    className="min-h-11 rounded-xl border border-slate-300 px-3"
                  />
                ) : (
                  <textarea
                    rows={key === "summary" ? 3 : 12}
                    value={form.locales[locale][key]}
                    onChange={(event) =>
                      updateLocale(locale, key, event.target.value)
                    }
                    className={`rounded-xl border border-slate-300 px-3 py-2 ${key === "bodyMarkdown" ? "font-mono text-sm" : ""}`}
                  />
                )}
              </label>
            ))}
            {form.id ? (
              <LocalePublicationPanel
                locale={locale}
                status={form.locales[locale].publicationStatus}
                busy={busy || dirty || form.itemStatus === "ARCHIVED"}
                onPublish={() => localeCommand(locale, "publish")}
                onUnpublish={() => localeCommand(locale, "hide")}
                unpublishLabel="숨김"
              />
            ) : null}
          </section>
        ))}
      </section>

      {preview ? (
        <section className="rounded-2xl border border-slate-300 bg-white p-6">
          <p className="text-xs font-semibold text-slate-500">
            {preview.locale === "ko" ? "국문" : "영문"} 미리보기 · 공개 상태는
            변경되지 않습니다
          </p>
          <h2 className="mt-4 text-2xl font-semibold">
            {form.locales[preview.locale].title || "제목 없음"}
          </h2>
          <p className="mt-2 text-slate-600">
            {form.locales[preview.locale].summary}
          </p>
          <article
            className="prose mt-6 max-w-none"
            dangerouslySetInnerHTML={{ __html: preview.html }}
          />
        </section>
      ) : null}

      <AdminFormFeedback error={error} message={message} />
      <div className="flex flex-wrap gap-3">
        <Link
          href="/admin/news"
          onClick={(event) => {
            if (!confirmNavigation()) event.preventDefault();
          }}
          className="inline-flex min-h-11 items-center rounded-full border border-slate-300 px-5 text-sm font-semibold"
        >
          목록으로
        </Link>
        <button
          type="submit"
          disabled={busy}
          className="min-h-11 rounded-full bg-[var(--bw-color-ink)] px-5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {busy ? "처리 중…" : form.id ? "변경 저장" : "초안 저장"}
        </button>
        {(["ko", "en"] as const).map((locale) => (
          <button
            key={locale}
            type="button"
            disabled={busy}
            onClick={() => showPreview(locale)}
            className="min-h-11 rounded-full border border-slate-300 px-5 text-sm font-semibold disabled:opacity-60"
          >
            {locale === "ko" ? "국문" : "영문"} 미리보기
          </button>
        ))}
        {form.id ? (
          <button
            type="button"
            disabled={busy || dirty}
            onClick={() =>
              itemCommand(
                form.itemStatus === "ARCHIVED" ? "restore" : "archive",
              )
            }
            className="min-h-11 rounded-full border border-slate-300 px-5 text-sm font-semibold disabled:opacity-60"
          >
            {form.itemStatus === "ARCHIVED" ? "복원" : "보관"}
          </button>
        ) : null}
        {form.id ? (
          <Link
            href={`/news/${form.slug}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-11 items-center rounded-full border border-slate-300 px-5 text-sm font-semibold"
          >
            공개 페이지 열기
          </Link>
        ) : null}
      </div>
    </form>
  );
}
