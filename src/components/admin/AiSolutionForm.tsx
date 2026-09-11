import { type FormEvent, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { AdminFormFeedback } from "@/components/admin/AdminFormFeedback";
import { LocalePublicationPanel } from "@/components/admin/LocalePublicationPanel";
import { useUnsavedChanges } from "@/hooks/useUnsavedChanges";
import {
  adminApiErrorMessage,
  requestAdminApi,
} from "@/lib/admin-api";

type AiSolutionLocaleValue = {
  name: string;
  summary: string;
  description: string;
  imageAlt: string;
  publicationStatus: string;
};

export type BusinessAreaOption = {
  id: string;
  publicKey: string;
  label: string;
};

export type AiSolutionFormValue = {
  id?: string;
  version: number;
  itemStatus: "ACTIVE" | "ARCHIVED";
  businessAreaId: string;
  displayOrder: number;
  imageAssetId: string;
  locales: Record<"ko" | "en", AiSolutionLocaleValue>;
};

const emptyLocale = (): AiSolutionLocaleValue => ({
  name: "",
  summary: "",
  description: "",
  imageAlt: "",
  publicationStatus: "DRAFT",
});

export function createEmptyAiSolution(
  businessAreaId: string,
  displayOrder = 1,
): AiSolutionFormValue {
  return {
    version: 1,
    itemStatus: "ACTIVE",
    businessAreaId,
    displayOrder,
    imageAssetId: "",
    locales: { ko: emptyLocale(), en: emptyLocale() },
  };
}

export function AiSolutionForm({
  initial,
  areas,
}: {
  initial: AiSolutionFormValue;
  areas: BusinessAreaOption[];
}) {
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

  function updateLocale(
    locale: "ko" | "en",
    key: keyof AiSolutionLocaleValue,
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
      businessAreaId: form.businessAreaId,
      displayOrder: form.displayOrder,
      imageAssetId: form.imageAssetId || null,
      locales: {
        ko: {
          name: form.locales.ko.name,
          summary: form.locales.ko.summary,
          description: form.locales.ko.description,
          imageAlt: form.locales.ko.imageAlt || null,
        },
        en: {
          name: form.locales.en.name,
          summary: form.locales.en.summary,
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
        const created = await requestAdminApi<{ id: string }>(
          "/api/admin/ai-solutions",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload()),
          },
        );
        await router.push(`/admin/ai-solutions/${created.id}`);
        return;
      }
      const result = await requestAdminApi<{ version: number }>(
        `/api/admin/ai-solutions/${form.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payload(), expectedVersion: version }),
        },
      );
      setVersion(result.version);
      setBaseline(JSON.stringify(form));
      setMessage("AI 솔루션 내용을 저장했습니다.");
    } catch (caught) {
      setError(adminApiErrorMessage(caught));
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  }

  async function uploadImage(file?: File) {
    if (!file) return;
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
      setMessage("대표 이미지를 연결했습니다. 변경 저장을 눌러 완료해 주세요.");
    } catch (caught) {
      setError(adminApiErrorMessage(caught));
    } finally {
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
        `/api/admin/ai-solutions/${form.id}/${action}`,
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
      setError(adminApiErrorMessage(caught));
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  }

  async function itemCommand(action: "archive" | "restore") {
    if (!form.id || !window.confirm(action === "archive" ? "이 솔루션을 보관하시겠습니까?" : "이 솔루션을 초안으로 복원하시겠습니까?")) return;
    if (inFlight.current) return;
    inFlight.current = true;
    setBusy(true);
    setError("");
    try {
      const result = await requestAdminApi<{ version: number }>(
        `/api/admin/ai-solutions/${form.id}/${action}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ expectedVersion: version }),
        },
      );
      const next: AiSolutionFormValue = {
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
      setMessage(action === "archive" ? "솔루션을 보관했습니다." : "솔루션을 복원했습니다.");
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
          사업 영역
          <select
            required
            value={form.businessAreaId}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                businessAreaId: event.target.value,
              }))
            }
            className="min-h-11 rounded-xl border border-slate-300 px-3"
          >
            {areas.map((area) => (
              <option key={area.id} value={area.id}>
                {area.label}
              </option>
            ))}
          </select>
          <span className="text-xs font-normal text-slate-500">
            사업 영역은 고정 분류이며 이 화면에서는 솔루션만 관리합니다.
          </span>
        </label>
        <label className="grid gap-2 text-sm font-medium">
          영역 내 순서
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
        <label className="grid gap-2 text-sm font-medium md:col-span-2">
          대표 이미지
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={busy}
            onChange={(event) => uploadImage(event.target.files?.[0])}
          />
          <span className="text-xs font-normal text-slate-500">
            게시하려면 검사를 마친 대표 이미지와 해당 언어의 대체 설명이
            필요합니다.
          </span>
          {form.imageAssetId ? (
            <span className="text-xs font-normal text-emerald-700">
              대표 이미지가 연결되어 있습니다.
            </span>
          ) : null}
        </label>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        {(["ko", "en"] as const).map((locale) => (
          <section key={locale} className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-semibold">{locale === "ko" ? "한국어" : "English"}</h2>
            {(["name", "summary", "description", "imageAlt"] as const).map((key) => (
              <label key={key} className="grid gap-2 text-sm font-medium">
                {key === "name" ? "솔루션 이름" : key === "summary" ? "요약" : key === "description" ? "상세 설명" : "이미지 대체 설명"}
                {key === "summary" || key === "description" ? (
                  <textarea
                    rows={key === "summary" ? 3 : 7}
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
          href="/admin/ai-solutions"
          onClick={(event) => {
            if (!confirmNavigation()) event.preventDefault();
          }}
          className="inline-flex min-h-11 items-center rounded-full border border-slate-300 px-5 text-sm font-semibold"
        >
          목록으로
        </Link>
        <button
          type="submit"
          disabled={busy || areas.length === 0}
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
