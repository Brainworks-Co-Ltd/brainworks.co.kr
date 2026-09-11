import { type FormEvent, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { AdminFormFeedback } from "@/components/admin/AdminFormFeedback";
import { LocalePublicationPanel } from "@/components/admin/LocalePublicationPanel";
import PopupNoticeRegion from "@/components/popup-notices/PopupNoticeRegion";
import { useUnsavedChanges } from "@/hooks/useUnsavedChanges";
import {
  adminApiErrorMessage,
  requestAdminApi,
} from "@/lib/admin-api";

type PopupLocaleValue = {
  title: string;
  bodyMarkdown: string;
  imageAssetId: string;
  imageAlt: string;
  imageUrl: string;
  displayOrder: number;
  publicationStatus: string;
  publishStartsAt: string;
  publishEndsAt: string;
};

export type PopupNoticeFormValue = {
  id?: string;
  version: number;
  itemStatus: "ACTIVE" | "ARCHIVED";
  noticeId: string;
  dismissalRevision: number;
  locales: Record<"ko" | "en", PopupLocaleValue>;
};

export type PopupNoticeLinkOption = {
  id: string;
  publicNumber: number;
  title: string;
};

const emptyLocale = (): PopupLocaleValue => ({
  title: "",
  bodyMarkdown: "",
  imageAssetId: "",
  imageAlt: "",
  imageUrl: "",
  displayOrder: 0,
  publicationStatus: "DRAFT",
  publishStartsAt: "",
  publishEndsAt: "",
});

export function createEmptyPopupNotice(): PopupNoticeFormValue {
  return {
    version: 1,
    itemStatus: "ACTIVE",
    noticeId: "",
    dismissalRevision: 1,
    locales: { ko: emptyLocale(), en: emptyLocale() },
  };
}

function toIso(value: string) {
  return value ? new Date(value).toISOString() : null;
}

export function PopupNoticeForm({
  initial,
  notices,
}: {
  initial: PopupNoticeFormValue;
  notices: PopupNoticeLinkOption[];
}) {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [version, setVersion] = useState(initial.version);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [preview, setPreview] = useState<{
    locale: "ko" | "en";
    revision: number;
  } | null>(null);
  const [baseline, setBaseline] = useState(() => JSON.stringify(initial));
  const dirty = JSON.stringify(form) !== baseline;
  const confirmNavigation = useUnsavedChanges(dirty);
  const inFlight = useRef(false);

  function updateLocale<K extends keyof PopupLocaleValue>(
    locale: "ko" | "en",
    key: K,
    value: PopupLocaleValue[K],
  ) {
    setForm((current) => ({
      ...current,
      locales: {
        ...current.locales,
        [locale]: { ...current.locales[locale], [key]: value },
      },
    }));
  }

  function commandPayload() {
    return {
      noticeId: form.noticeId || null,
      locales: {
        ko: {
          title: form.locales.ko.title,
          bodyMarkdown: form.locales.ko.bodyMarkdown || null,
          imageAssetId: form.locales.ko.imageAssetId || null,
          imageAlt: form.locales.ko.imageAlt || null,
          displayOrder: form.locales.ko.displayOrder,
        },
        en: {
          title: form.locales.en.title,
          bodyMarkdown: form.locales.en.bodyMarkdown || null,
          imageAssetId: form.locales.en.imageAssetId || null,
          imageAlt: form.locales.en.imageAlt || null,
          displayOrder: form.locales.en.displayOrder,
        },
      },
    };
  }

  async function save(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    if (inFlight.current) return;
    inFlight.current = true;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const payload = commandPayload();
      if (!form.id) {
        const created = await requestAdminApi<{ id: string }>(
          "/api/admin/popup-notices",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          },
        );
        await router.push(`/admin/popup-notices/${created.id}`);
        return;
      }
      const result = await requestAdminApi<{ version: number }>(
        `/api/admin/popup-notices/${form.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payload, expectedVersion: version }),
        },
      );
      setVersion(result.version);
      setBaseline(JSON.stringify(form));
      setMessage("팝업 내용을 저장했습니다.");
    } catch (caught) {
      setError(adminApiErrorMessage(caught));
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  }

  async function uploadImage(locale: "ko" | "en", file?: File) {
    if (!file) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const body = new FormData();
      body.append("file", file);
      const asset = await requestAdminApi<{ id: string }>(
        "/api/admin/assets",
        { method: "POST", body },
      );
      updateLocale(locale, "imageAssetId", asset.id);
      updateLocale(locale, "imageUrl", URL.createObjectURL(file));
      setMessage(
        `${locale === "ko" ? "국문" : "영문"} 팝업 이미지를 연결했습니다. 변경 저장을 눌러 완료해 주세요.`,
      );
    } catch (caught) {
      setError(adminApiErrorMessage(caught));
    } finally {
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
        `/api/admin/popup-notices/${form.id}/${action}`,
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
        ? "이 팝업을 보관하면 홈페이지에서 제외됩니다. 계속하시겠습니까?"
        : "팝업을 복원하면 두 언어 모두 초안 상태가 됩니다. 계속하시겠습니까?";
    if (!window.confirm(prompt)) return;
    if (inFlight.current) return;
    inFlight.current = true;
    setBusy(true);
    setError("");
    try {
      const result = await requestAdminApi<{ version: number }>(
        `/api/admin/popup-notices/${form.id}/${action}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ expectedVersion: version }),
        },
      );
      const next: PopupNoticeFormValue = {
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
      setMessage(action === "archive" ? "팝업을 보관했습니다." : "팝업을 복원했습니다.");
    } catch (caught) {
      setError(adminApiErrorMessage(caught));
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  }

  async function renotify() {
    if (!form.id || dirty) {
      if (dirty) setError("변경 내용을 먼저 저장해 주세요.");
      return;
    }
    if (
      !window.confirm(
        "이 팝업을 오늘 보지 않기로 한 방문자에게도 다시 표시합니다. 계속하시겠습니까?",
      )
    )
      return;
    if (inFlight.current) return;
    inFlight.current = true;
    setBusy(true);
    setError("");
    try {
      const result = await requestAdminApi<{
        version: number;
        dismissalRevision: number;
      }>(`/api/admin/popup-notices/${form.id}/renotify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expectedVersion: version }),
      });
      setVersion(result.version);
      const next = { ...form, dismissalRevision: result.dismissalRevision };
      setForm(next);
      setBaseline(JSON.stringify(next));
      setMessage("방문자에게 수정 내용을 다시 알리도록 설정했습니다.");
    } catch (caught) {
      setError(adminApiErrorMessage(caught));
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  }

  return (
    <form onSubmit={save} className="grid gap-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <label className="grid gap-2 text-sm font-medium">
          연결 공지사항
          <select
            value={form.noticeId}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                noticeId: event.target.value,
              }))
            }
            className="min-h-11 rounded-xl border border-slate-300 px-3"
          >
            <option value="">연결하지 않음</option>
            {notices.map((notice) => (
              <option key={notice.id} value={notice.id}>
                {notice.publicNumber}. {notice.title}
              </option>
            ))}
          </select>
          <span className="text-xs font-normal text-slate-500">
            선택한 공지가 같은 언어로 공개 중일 때만 자세히 보기 링크가
            표시됩니다.
          </span>
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
              본문
              <textarea
                rows={7}
                value={form.locales[locale].bodyMarkdown}
                onChange={(event) =>
                  updateLocale(locale, "bodyMarkdown", event.target.value)
                }
                className="rounded-xl border border-slate-300 px-3 py-2"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium">
              이미지
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                disabled={busy}
                onChange={(event) => uploadImage(locale, event.target.files?.[0])}
                className="block text-sm"
              />
              {form.locales[locale].imageAssetId ? (
                <span className="text-xs font-normal text-emerald-700">
                  이미지가 연결되어 있습니다.
                </span>
              ) : null}
            </label>
            <label className="grid gap-2 text-sm font-medium">
              이미지 대체 설명
              <input
                value={form.locales[locale].imageAlt}
                onChange={(event) =>
                  updateLocale(locale, "imageAlt", event.target.value)
                }
                className="min-h-11 rounded-xl border border-slate-300 px-3"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium">
              표시 순서
              <input
                type="number"
                min="0"
                value={form.locales[locale].displayOrder}
                onChange={(event) =>
                  updateLocale(locale, "displayOrder", Number(event.target.value))
                }
                className="min-h-11 rounded-xl border border-slate-300 px-3"
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
                    노출 시작
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
                    노출 종료
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

      <AdminFormFeedback error={error} message={message} />
      <div className="flex flex-wrap gap-3">
        <Link
          href="/admin/popup-notices"
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
            onClick={() =>
              setPreview((current) => ({
                locale,
                revision: (current?.revision || 0) + 1,
              }))
            }
            className="min-h-11 rounded-full border border-slate-300 px-5 text-sm font-semibold"
          >
            {locale === "ko" ? "국문" : "영문"} 미리보기
          </button>
        ))}
        {form.id ? (
          <>
            <button
              type="button"
              disabled={busy || dirty}
              onClick={renotify}
              className="min-h-11 rounded-full border border-slate-300 px-5 text-sm font-semibold disabled:opacity-60"
            >
              수정 내용을 다시 알림
            </button>
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
          </>
        ) : null}
      </div>
      {preview ? (
        <PopupNoticeRegion
          key={`${preview.locale}-${preview.revision}`}
          notices={[
            {
              id: `admin-preview-${preview.locale}-${preview.revision}`,
              title: form.locales[preview.locale].title || "제목 없음",
              bodyMarkdown: form.locales[preview.locale].bodyMarkdown || null,
              imageUrl: form.locales[preview.locale].imageUrl || null,
              imageAlt: form.locales[preview.locale].imageAlt || null,
              detailUrl: form.noticeId ? "#" : null,
              dismissalRevision: preview.revision,
              displayOrder: form.locales[preview.locale].displayOrder,
            },
          ]}
        />
      ) : null}
    </form>
  );
}
