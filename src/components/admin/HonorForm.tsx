import { type FormEvent, useCallback, useRef, useState } from "react";
import { primaryButtonClass, secondaryButtonClass, inputClass, textareaClass } from "@/components/admin/fields";
import Link from "next/link";
import { useRouter } from "next/router";
import { AdminFormFeedback } from "@/components/admin/AdminFormFeedback";
import { AdminImageField } from "@/components/admin/AdminImageField";
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
  imageUrl: string;
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
    imageUrl: "",
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

  /** 서버의 게시 조건(publishHonor)과 같은 항목을 화면에서 미리 알려 준다. */
  function missingForPublish(locale: "ko" | "en") {
    const value = form.locales[locale];
    const missing: string[] = [];
    if (!value.title.trim()) missing.push("제목");
    if (!value.organization.trim()) missing.push("기관");
    if (!value.description.trim()) missing.push("설명");
    return missing;
  }

  function payload() {
    return {
      honorType: form.honorType,
      occurredYear: form.occurredYear,
      occurredOn: form.occurredOn || null,
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
      <section className="grid gap-4 rounded-[var(--bw-radius-card)] border border-[var(--bw-color-line)] bg-white p-6 md:grid-cols-3">
        <label className="grid content-start gap-2 text-sm font-medium">
          유형
          <select
            value={form.honorType}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                honorType: event.target.value as "AWARD" | "CERTIFICATION",
              }))
            }
            className={inputClass}
          >
            <option value="AWARD">수상</option>
            <option value="CERTIFICATION">인증</option>
          </select>
        </label>
        <label className="grid content-start gap-2 text-sm font-medium">
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
            className={inputClass}
          />
        </label>
        <label className="grid content-start gap-2 text-sm font-medium">
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
            className={inputClass}
          />
        </label>
        <p className="text-xs font-normal leading-5 text-slate-500 md:col-span-3">
          새 항목은 고른 유형의 맨 뒤에 들어갑니다. 수상과 인증 각각의 순서는 목록의
          화살표로 바꿉니다.
        </p>
        <div className="md:col-span-3">
          <AdminImageField
            label="증빙 이미지(선택)"
            hint="두 언어가 함께 씁니다. 상장이나 인증서 사진을 올리면 공개 화면에 보입니다."
            value={{
              assetId: form.imageAssetId || null,
              url: form.imageUrl || null,
            }}
            disabled={busy}
            onBusyChange={setBusy}
            onError={setError}
            onUnauthorized={handleUnauthorized}
            onChange={(next) =>
              setForm((current) => ({
                ...current,
                imageAssetId: next.assetId ?? "",
                imageUrl: next.url ?? "",
              }))
            }
          />
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        {(["ko", "en"] as const).map((locale) => (
          <section key={locale} className="grid gap-4 rounded-[var(--bw-radius-card)] border border-[var(--bw-color-line)] bg-white p-6">
            <h2 className="text-lg font-semibold">{locale === "ko" ? "한국어" : "English"}</h2>
            {(["title", "organization", "description", "imageAlt"] as const).map((key) => (
              <label key={key} className="grid content-start gap-2 text-sm font-medium">
                {key === "title" ? "제목" : key === "organization" ? "기관" : key === "description" ? "설명" : "이미지 대체 설명"}
                {key === "description" ? (
                  <textarea
                    rows={5}
                    value={form.locales[locale][key]}
                    onChange={(event) => updateLocale(locale, key, event.target.value)}
                    className={textareaClass}
                  />
                ) : (
                  <input
                    value={form.locales[locale][key]}
                    onChange={(event) => updateLocale(locale, key, event.target.value)}
                    className={inputClass}
                  />
                )}
              </label>
            ))}
            {form.id ? (
              <LocalePublicationPanel
                locale={locale}
                status={form.locales[locale].publicationStatus}
                busy={busy || dirty || form.itemStatus === "ARCHIVED"}
                missing={missingForPublish(locale)}
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
          className={secondaryButtonClass}
        >
          목록으로
        </Link>
        <button
          type="submit"
          disabled={busy}
          className={primaryButtonClass}
        >
          {busy ? "처리 중…" : form.id ? "변경 저장" : "초안 저장"}
        </button>
        {form.id ? (
          <button
            type="button"
            disabled={busy || dirty}
            onClick={() => itemCommand(form.itemStatus === "ARCHIVED" ? "restore" : "archive")}
            className={secondaryButtonClass}
          >
            {form.itemStatus === "ARCHIVED" ? "복원" : "보관"}
          </button>
        ) : null}
      </div>
    </form>
  );
}
