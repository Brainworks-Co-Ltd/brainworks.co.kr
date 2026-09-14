import { type FormEvent, useCallback, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { AdminFormFeedback } from "@/components/admin/AdminFormFeedback";
import { LocalePublicationPanel } from "@/components/admin/LocalePublicationPanel";
import { useUnsavedChanges } from "@/hooks/useUnsavedChanges";
import {
  saveSnapshot,
  snapshotKey,
  useSessionSnapshot,
} from "@/hooks/useSessionSnapshot";
import { flushSync } from "react-dom";
import {
  adminApiErrorMessage,
  isUnauthorized,
  requestAdminApi,
} from "@/lib/admin-api";

type HonorLocaleValue = {
  title: string;
  organization: string;
  description: string;
  imageAlt: string;
  publicationStatus: string;
};

export type HonorFormValue = {
  id?: string;
  version: number;
  itemStatus: "ACTIVE" | "ARCHIVED";
  honorType: "AWARD" | "CERTIFICATION";
  occurredYear: number;
  occurredOn: string;
  displayOrder: number;
  imageAssetId: string;
  locales: Record<"ko" | "en", HonorLocaleValue>;
};

const emptyLocale = (): HonorLocaleValue => ({
  title: "",
  organization: "",
  description: "",
  imageAlt: "",
  publicationStatus: "DRAFT",
});

export function createEmptyHonor(displayOrder = 1): HonorFormValue {
  return {
    version: 1,
    itemStatus: "ACTIVE",
    honorType: "AWARD",
    occurredYear: new Date().getFullYear(),
    occurredOn: "",
    displayOrder,
    imageAssetId: "",
    locales: { ko: emptyLocale(), en: emptyLocale() },
  };
}

export function HonorForm({ initial }: { initial: HonorFormValue }) {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [version, setVersion] = useState(initial.version);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [baseline, setBaseline] = useState(() => JSON.stringify(initial));
  const dirty = JSON.stringify(form) !== baseline;
  const confirmNavigation = useUnsavedChanges(dirty);
  const inFlight = useRef(false);
  const restoreSnapshot = useCallback((value: HonorFormValue) => setForm(value), []);
  useSessionSnapshot<HonorFormValue>(
    snapshotKey("honor", initial.id),
    restoreSnapshot,
  );

  // 세션 만료(UNAUTHORIZED) 응답이면 현재 입력을 보존하고 로그인 화면으로 이동한다.
  function handleUnauthorized(caught: unknown): boolean {
    if (!isUnauthorized(caught)) return false;
    saveSnapshot(snapshotKey("honor", form.id), form);
    flushSync(() => setBaseline(JSON.stringify(form)));
    setError(`${adminApiErrorMessage(caught)} 입력 내용은 로그인 후 복원됩니다.`);
    router.push(`/admin/auth/sign-in?returnTo=${encodeURIComponent(router.asPath)}`);
    return true;
  }

  function updateLocale(
    locale: "ko" | "en",
    key: keyof HonorLocaleValue,
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

  function payload() {
    return {
      honorType: form.honorType,
      occurredYear: form.occurredYear,
      occurredOn: form.occurredOn || null,
      displayOrder: form.displayOrder,
      imageAssetId: form.imageAssetId || null,
      locales: {
        ko: {
          title: form.locales.ko.title,
          organization: form.locales.ko.organization,
          description: form.locales.ko.description,
          imageAlt: form.locales.ko.imageAlt || null,
        },
        en: {
          title: form.locales.en.title,
          organization: form.locales.en.organization,
          description: form.locales.en.description,
          imageAlt: form.locales.en.imageAlt || null,
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
      if (!form.id) {
        const created = await requestAdminApi<{ id: string }>("/api/admin/honors", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload()),
        });
        // flushSync: router.push가 routeChangeStart를 emit하기 전에 dirty=false를 반영한다.
        flushSync(() => setBaseline(JSON.stringify(form)));
        await router.push(`/admin/honors/${created.id}`);
        return;
      }
      const result = await requestAdminApi<{ version: number }>(
        `/api/admin/honors/${form.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payload(), expectedVersion: version }),
        },
      );
      setVersion(result.version);
      setBaseline(JSON.stringify(form));
      setMessage("수상 및 인증 내용을 저장했습니다.");
    } catch (caught) {
      if (handleUnauthorized(caught)) return;
      setError(adminApiErrorMessage(caught));
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  }

  async function uploadImage(file?: File) {
    if (!file) return;
    if (inFlight.current) return;
    inFlight.current = true;
    setBusy(true);
    setError("");
    try {
      const body = new FormData();
      body.append("file", file);
      const asset = await requestAdminApi<{ id: string }>("/api/admin/assets", {
        method: "POST",
        body,
      });
      setForm((current) => ({ ...current, imageAssetId: asset.id }));
      setMessage("이미지를 연결했습니다. 변경 저장을 눌러 완료해 주세요.");
    } catch (caught) {
      if (handleUnauthorized(caught)) return;
      setError(adminApiErrorMessage(caught));
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  }

  async function localeCommand(locale: "ko" | "en", action: "publish" | "hide") {
    if (!form.id || dirty) {
      if (dirty) setError("변경 내용을 먼저 저장해 주세요.");
      return;
    }
    if (inFlight.current) return;
    inFlight.current = true;
    setBusy(true);
    setError("");
    try {
      const result = await requestAdminApi<{ version: number }>(
        `/api/admin/honors/${form.id}/${action}`,
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
      setBaseline(JSON.stringify(next));
      setMessage(
        `${locale === "ko" ? "국문" : "영문"}을 ${action === "publish" ? "게시했습니다" : "숨겼습니다"}.`,
      );
    } catch (caught) {
      if (handleUnauthorized(caught)) return;
      setError(adminApiErrorMessage(caught));
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  }

  async function itemCommand(action: "archive" | "restore") {
    if (!form.id || !window.confirm(action === "archive" ? "이 항목을 보관하시겠습니까?" : "이 항목을 초안으로 복원하시겠습니까?")) return;
    if (inFlight.current) return;
    inFlight.current = true;
    setBusy(true);
    setError("");
    try {
      const result = await requestAdminApi<{ version: number }>(
        `/api/admin/honors/${form.id}/${action}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ expectedVersion: version }),
        },
      );
      const next: HonorFormValue = {
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
      setMessage(action === "archive" ? "항목을 보관했습니다." : "항목을 복원했습니다.");
    } catch (caught) {
      if (handleUnauthorized(caught)) return;
      setError(adminApiErrorMessage(caught));
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  }

  return (
    <form onSubmit={save} className="grid gap-6">
      <section className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 md:grid-cols-4">
        <label className="grid gap-2 text-sm font-medium">
          유형
          <select
            value={form.honorType}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                honorType: event.target.value as "AWARD" | "CERTIFICATION",
              }))
            }
            className="min-h-11 rounded-xl border border-slate-300 px-3"
          >
            <option value="AWARD">수상</option>
            <option value="CERTIFICATION">인증</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm font-medium">
          연도
          <input
            type="number"
            min="1"
            value={form.occurredYear}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                occurredYear: Number(event.target.value),
              }))
            }
            className="min-h-11 rounded-xl border border-slate-300 px-3"
          />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          날짜
          <input
            type="date"
            value={form.occurredOn}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                occurredOn: event.target.value,
              }))
            }
            className="min-h-11 rounded-xl border border-slate-300 px-3"
          />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          유형 내 순서
          <input
            type="number"
            min="1"
            value={form.displayOrder}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                displayOrder: Number(event.target.value),
              }))
            }
            className="min-h-11 rounded-xl border border-slate-300 px-3"
          />
        </label>
        <label className="grid gap-2 text-sm font-medium md:col-span-4">
          증빙 이미지(선택)
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={busy}
            onChange={(event) => uploadImage(event.target.files?.[0])}
          />
          {form.imageAssetId ? (
            <span className="text-xs font-normal text-emerald-700">
              이미지가 연결되어 있습니다.
            </span>
          ) : null}
        </label>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        {(["ko", "en"] as const).map((locale) => (
          <section key={locale} className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-semibold">{locale === "ko" ? "한국어" : "English"}</h2>
            {(["title", "organization", "description", "imageAlt"] as const).map((key) => (
              <label key={key} className="grid gap-2 text-sm font-medium">
                {key === "title" ? "제목" : key === "organization" ? "기관" : key === "description" ? "설명" : "이미지 대체 설명"}
                {key === "description" ? (
                  <textarea
                    rows={5}
                    value={form.locales[locale][key]}
                    onChange={(event) => updateLocale(locale, key, event.target.value)}
                    className="rounded-xl border border-slate-300 px-3 py-2"
                  />
                ) : (
                  <input
                    value={form.locales[locale][key]}
                    onChange={(event) => updateLocale(locale, key, event.target.value)}
                    className="min-h-11 rounded-xl border border-slate-300 px-3"
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

      <AdminFormFeedback error={error} message={message} />
      <div className="flex flex-wrap gap-3">
        <Link
          href="/admin/honors"
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
        {form.id ? (
          <button
            type="button"
            disabled={busy || dirty}
            onClick={() => itemCommand(form.itemStatus === "ARCHIVED" ? "restore" : "archive")}
            className="min-h-11 rounded-full border border-slate-300 px-5 text-sm font-semibold disabled:opacity-60"
          >
            {form.itemStatus === "ARCHIVED" ? "복원" : "보관"}
          </button>
        ) : null}
      </div>
    </form>
  );
}
