import { type FormEvent, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { AdminFormFeedback } from "@/components/admin/AdminFormFeedback";
import { LocalePublicationPanel } from "@/components/admin/LocalePublicationPanel";
import type { AdminNoticeCategory } from "@/components/admin/NoticeCategoryForm";
import { useUnsavedChanges } from "@/hooks/useUnsavedChanges";
import {
  adminApiErrorMessage,
  requestAdminApi,
} from "@/lib/admin-api";

type NoticeLocaleValue = {
  title: string;
  bodyMarkdown: string;
  publicationStatus: string;
  publishStartsAt: string;
  publishEndsAt: string;
};

export type NoticeFormValue = {
  id?: string;
  version: number;
  publicNumber?: number;
  itemStatus: "ACTIVE" | "ARCHIVED";
  categoryId: string;
  displayDate: string;
  isPinned: boolean;
  pinOrder: number;
  locales: Record<"ko" | "en", NoticeLocaleValue>;
};

const emptyLocale = (): NoticeLocaleValue => ({
  title: "",
  bodyMarkdown: "",
  publicationStatus: "DRAFT",
  publishStartsAt: "",
  publishEndsAt: "",
});

export function createEmptyNotice(): NoticeFormValue {
  return {
    version: 1,
    itemStatus: "ACTIVE",
    categoryId: "",
    displayDate: new Date().toISOString().slice(0, 10),
    isPinned: false,
    pinOrder: 1,
    locales: { ko: emptyLocale(), en: emptyLocale() },
  };
}

function toIso(value: string) {
  return value ? new Date(value).toISOString() : null;
}

export function NoticeForm({
  initial,
  categories,
}: {
  initial: NoticeFormValue;
  categories: AdminNoticeCategory[];
}) {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [version, setVersion] = useState(initial.version);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [previewLocale, setPreviewLocale] = useState<"ko" | "en" | null>(null);
  const [baseline, setBaseline] = useState(() => JSON.stringify(initial));
  const dirty = JSON.stringify(form) !== baseline;
  const confirmNavigation = useUnsavedChanges(dirty);
  const inFlight = useRef(false);

  function updateLocale(
    locale: "ko" | "en",
    key: keyof NoticeLocaleValue,
    value: string,
  ) {
    setForm((current) => ({
      ...current,
      locales: {
        ...current.locales,
        [locale]: { ...current.locales[locale], [key]: value },
      },
    }));
  }

  async function save(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    if (inFlight.current) return;
    inFlight.current = true;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const payload = {
        categoryId: form.categoryId || null,
        displayDate: form.displayDate,
        isPinned: form.isPinned,
        pinOrder: form.isPinned ? form.pinOrder : null,
        locales: {
          ko: {
            title: form.locales.ko.title,
            bodyMarkdown: form.locales.ko.bodyMarkdown,
          },
          en: {
            title: form.locales.en.title,
            bodyMarkdown: form.locales.en.bodyMarkdown,
          },
        },
      };
      if (!form.id) {
        const created = await requestAdminApi<{ id: string }>(
          "/api/admin/notices",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          },
        );
        await router.push(`/admin/notices/${created.id}`);
        return;
      }
      const saved = await requestAdminApi<{ version: number }>(
        `/api/admin/notices/${form.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payload, expectedVersion: version }),
        },
      );
      setVersion(saved.version);
      setBaseline(JSON.stringify(form));
      setMessage("공지 내용을 저장했습니다.");
    } catch (caught) {
      setError(adminApiErrorMessage(caught));
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  }

  async function localeCommand(
    locale: "ko" | "en",
    action: "publish" | "unpublish",
  ) {
    if (!form.id) return;
    if (dirty) {
      setError("변경 내용을 먼저 저장한 뒤 게시 상태를 변경해 주세요.");
      return;
    }
    if (inFlight.current) return;
    inFlight.current = true;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const result = await requestAdminApi<{ version: number }>(
        `/api/admin/notices/${form.id}/${action}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            locale,
            expectedVersion: version,
            startsAt:
              action === "publish"
                ? toIso(form.locales[locale].publishStartsAt)
                : undefined,
            endsAt:
              action === "publish"
                ? toIso(form.locales[locale].publishEndsAt)
                : undefined,
          }),
        },
      );
      const publicationStatus =
        action === "unpublish"
          ? "UNPUBLISHED"
          : form.locales[locale].publishStartsAt &&
              new Date(form.locales[locale].publishStartsAt) > new Date()
            ? "SCHEDULED"
            : "PUBLISHED";
      const next = {
        ...form,
        locales: {
          ...form.locales,
          [locale]: { ...form.locales[locale], publicationStatus },
        },
      };
      setVersion(result.version);
      setForm(next);
      setBaseline(JSON.stringify(next));
      setMessage(
        action === "publish"
          ? `${locale === "ko" ? "국문" : "영문"} 게시 상태를 반영했습니다.`
          : `${locale === "ko" ? "국문" : "영문"} 게시를 중단했습니다.`,
      );
    } catch (caught) {
      setError(adminApiErrorMessage(caught));
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  }

  async function itemCommand(action: "archive" | "restore") {
    if (!form.id) return;
    const prompt =
      action === "archive"
        ? "이 공지를 보관하면 공개 목록에서 제외됩니다. 계속하시겠습니까?"
        : "공지를 복원하면 두 언어 모두 초안 상태가 됩니다. 계속하시겠습니까?";
    if (!window.confirm(prompt)) return;
    if (inFlight.current) return;
    inFlight.current = true;
    setBusy(true);
    setError("");
    try {
      const result = await requestAdminApi<{ version: number }>(
        `/api/admin/notices/${form.id}/${action}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ expectedVersion: version }),
        },
      );
      const next: NoticeFormValue = {
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
      setBaseline(JSON.stringify(next));
      setMessage(action === "archive" ? "공지를 보관했습니다." : "공지를 복원했습니다.");
    } catch (caught) {
      setError(adminApiErrorMessage(caught));
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  }

  return (
    <form onSubmit={save} className="grid gap-6">
      <section className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium">
          카테고리
          <select
            value={form.categoryId}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                categoryId: event.target.value,
              }))
            }
            className="min-h-11 rounded-xl border border-slate-300 px-3"
          >
            <option value="">카테고리를 선택해 주세요</option>
            {categories
              .filter(
                (category) =>
                  category.isActive || category.id === form.categoryId,
              )
              .map((category) => (
                <option key={category.id} value={category.id}>
                  {category.locales.ko?.name || category.locales.en?.name}
                  {category.isActive ? "" : " (비활성)"}
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
        <label className="flex min-h-11 items-center gap-3 text-sm font-medium">
          <input
            type="checkbox"
            checked={form.isPinned}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                isPinned: event.target.checked,
              }))
            }
          />
          목록 상단에 고정
        </label>
        {form.isPinned ? (
          <label className="grid gap-2 text-sm font-medium">
            고정 순서
            <input
              type="number"
              min="1"
              value={form.pinOrder}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  pinOrder: Number(event.target.value),
                }))
              }
              className="min-h-11 rounded-xl border border-slate-300 px-3"
            />
          </label>
        ) : null}
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
            <label className="grid gap-2 text-sm font-medium">
              제목
              <input
                value={form.locales[locale].title}
                onChange={(event) =>
                  updateLocale(locale, "title", event.target.value)
                }
                className="min-h-11 rounded-xl border border-slate-300 px-3"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium">
              Markdown 본문
              <textarea
                rows={12}
                value={form.locales[locale].bodyMarkdown}
                onChange={(event) =>
                  updateLocale(locale, "bodyMarkdown", event.target.value)
                }
                className="rounded-xl border border-slate-300 px-3 py-2 font-mono text-sm"
              />
            </label>
            {form.id ? (
              <LocalePublicationPanel
                locale={locale}
                status={form.locales[locale].publicationStatus}
                busy={busy || dirty || form.itemStatus === "ARCHIVED"}
                onPublish={() => localeCommand(locale, "publish")}
                onUnpublish={() => localeCommand(locale, "unpublish")}
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="grid gap-1 text-xs font-medium">
                    게시 시작
                    <input
                      type="datetime-local"
                      value={form.locales[locale].publishStartsAt}
                      onChange={(event) =>
                        updateLocale(locale, "publishStartsAt", event.target.value)
                      }
                      className="min-h-10 rounded-lg border border-slate-300 px-2"
                    />
                  </label>
                  <label className="grid gap-1 text-xs font-medium">
                    게시 종료
                    <input
                      type="datetime-local"
                      value={form.locales[locale].publishEndsAt}
                      onChange={(event) =>
                        updateLocale(locale, "publishEndsAt", event.target.value)
                      }
                      className="min-h-10 rounded-lg border border-slate-300 px-2"
                    />
                  </label>
                </div>
              </LocalePublicationPanel>
            ) : null}
          </section>
        ))}
      </section>

      <section className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5">
        <h2 className="font-semibold">첨부파일</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          문서 악성코드 검사 제공자와 운영 정책이 확정되기 전까지 첨부파일
          업로드는 사용할 수 없습니다.
        </p>
      </section>

      {previewLocale ? (
        <section className="rounded-2xl border border-slate-300 bg-white p-6">
          <p className="text-xs font-semibold text-slate-500">
            {previewLocale === "ko" ? "국문" : "영문"} 미리보기 · 공개 상태는
            변경되지 않습니다
          </p>
          <h2 className="mt-4 text-2xl font-semibold">
            {form.locales[previewLocale].title || "제목 없음"}
          </h2>
          <div className="mt-4 whitespace-pre-wrap leading-7 text-slate-700">
            {form.locales[previewLocale].bodyMarkdown || "본문 없음"}
          </div>
        </section>
      ) : null}

      <AdminFormFeedback error={error} message={message} />
      <div className="flex flex-wrap gap-3">
        <Link
          href="/admin/notices"
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
        <button
          type="button"
          onClick={() => setPreviewLocale("ko")}
          className="min-h-11 rounded-full border border-slate-300 px-5 text-sm font-semibold"
        >
          국문 미리보기
        </button>
        <button
          type="button"
          onClick={() => setPreviewLocale("en")}
          className="min-h-11 rounded-full border border-slate-300 px-5 text-sm font-semibold"
        >
          영문 미리보기
        </button>
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
        {form.publicNumber ? (
          <Link
            href={`/notices/${form.publicNumber}`}
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
