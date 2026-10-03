import { useState } from "react";
import { useRouter } from "next/router";
import { AdminFormFeedback } from "@/components/admin/AdminFormFeedback";
import {
  cardClass,
  cardTitleClass,
  Field,
  inputClass,
  primaryButtonClass,
  secondaryButtonClass,
  StatusBadge,
} from "@/components/admin/fields";
import { adminApiErrorMessage, requestAdminApi } from "@/lib/admin-api";

export type AdminNoticeCategory = {
  id: string;
  version: number;
  isActive: boolean;
  displayOrder: number;
  locales: Record<string, { name: string }>;
};

function categoryPayload(
  category: AdminNoticeCategory,
  override: Partial<{ displayOrder: number; ko: string; en: string }> = {},
) {
  return {
    displayOrder: override.displayOrder ?? category.displayOrder,
    locales: {
      ko: { name: override.ko ?? category.locales.ko?.name ?? "" },
      en: { name: override.en ?? category.locales.en?.name ?? "" },
    },
  };
}

function CategoryRow({
  category,
  neighbors,
}: {
  category: AdminNoticeCategory;
  neighbors: { up?: AdminNoticeCategory; down?: AdminNoticeCategory };
}) {
  const router = useRouter();
  const [koName, setKoName] = useState(category.locales.ko?.name || "");
  const [enName, setEnName] = useState(category.locales.en?.name || "");
  const [version, setVersion] = useState(category.version);
  const [active, setActive] = useState(category.isActive);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const dirty =
    koName !== (category.locales.ko?.name || "") ||
    enName !== (category.locales.en?.name || "");

  async function save() {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const result = await requestAdminApi<{ version: number }>(
        `/api/admin/notice-categories/${category.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            expectedVersion: version,
            ...categoryPayload(category, { ko: koName, en: enName }),
          }),
        },
      );
      setVersion(result.version);
      setMessage("카테고리 이름을 저장했습니다.");
      router.replace(router.asPath, undefined, { scroll: false });
    } catch (caught) {
      setError(adminApiErrorMessage(caught));
    } finally {
      setBusy(false);
    }
  }

  /** 이웃과 표시 순서를 맞바꾼다. 순서 열에 고유 제약이 없어 두 번의 저장으로 끝난다. */
  async function swapWith(neighbor: AdminNoticeCategory) {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await requestAdminApi(`/api/admin/notice-categories/${category.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          expectedVersion: version,
          ...categoryPayload(category, {
            displayOrder: neighbor.displayOrder,
            ko: koName,
            en: enName,
          }),
        }),
      });
      await requestAdminApi(`/api/admin/notice-categories/${neighbor.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          expectedVersion: neighbor.version,
          ...categoryPayload(neighbor, { displayOrder: category.displayOrder }),
        }),
      });
      await router.replace(router.asPath, undefined, { scroll: false });
    } catch (caught) {
      setError(adminApiErrorMessage(caught));
      setBusy(false);
    }
  }

  async function toggleActive() {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const result = await requestAdminApi<{
        version: number;
        isActive: boolean;
      }>(`/api/admin/notice-categories/${category.id}/active`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          expectedVersion: version,
          isActive: !active,
        }),
      });
      setVersion(result.version);
      setActive(result.isActive);
      setMessage(
        result.isActive
          ? "새 공지에서 선택할 수 있게 했습니다."
          : "새 공지의 선택 목록에서 제외했습니다.",
      );
      router.replace(router.asPath, undefined, { scroll: false });
    } catch (caught) {
      setError(adminApiErrorMessage(caught));
    } finally {
      setBusy(false);
    }
  }

  const moveButtonClass =
    "inline-flex h-9 w-9 items-center justify-center rounded-[var(--bw-radius-control)] border border-slate-300 bg-white text-base leading-none disabled:opacity-40";

  return (
    <li className="grid gap-4 border-t border-[var(--bw-color-line)] py-5 first:border-t-0 md:grid-cols-[auto_1fr_1fr_auto] md:items-end">
      <div className="flex items-center gap-1 md:pb-1">
        <button
          type="button"
          aria-label="위로"
          title="위로"
          disabled={busy || !neighbors.up}
          onClick={() => neighbors.up && swapWith(neighbors.up)}
          className={moveButtonClass}
        >
          ↑
        </button>
        <button
          type="button"
          aria-label="아래로"
          title="아래로"
          disabled={busy || !neighbors.down}
          onClick={() => neighbors.down && swapWith(neighbors.down)}
          className={moveButtonClass}
        >
          ↓
        </button>
      </div>
      <Field label="국문 이름">
        <input
          value={koName}
          onChange={(event) => setKoName(event.target.value)}
          className={inputClass}
        />
      </Field>
      <Field label="영문 이름">
        <input
          value={enName}
          onChange={(event) => setEnName(event.target.value)}
          className={inputClass}
        />
      </Field>
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge
          status={active ? "LIVE" : "HIDDEN"}
          label={active ? "사용 중" : "사용 안 함"}
        />
        <button
          type="button"
          disabled={busy || !dirty}
          onClick={save}
          className={primaryButtonClass}
        >
          이름 저장
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={toggleActive}
          className={secondaryButtonClass}
        >
          {active ? "사용 중지" : "다시 사용"}
        </button>
      </div>
      <div className="md:col-span-4">
        <AdminFormFeedback error={error} message={message} />
      </div>
    </li>
  );
}

export function NoticeCategoryForm({
  categories,
}: {
  categories: AdminNoticeCategory[];
}) {
  const router = useRouter();
  const [koName, setKoName] = useState("");
  const [enName, setEnName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const sorted = [...categories].sort(
    (a, b) => a.displayOrder - b.displayOrder,
  );

  async function create() {
    setBusy(true);
    setError("");
    try {
      await requestAdminApi("/api/admin/notice-categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // 새 카테고리는 맨 뒤에 붙는다. 순서는 목록의 화살표로 바꾼다.
          displayOrder:
            Math.max(0, ...sorted.map((item) => item.displayOrder)) + 1,
          locales: { ko: { name: koName }, en: { name: enName } },
        }),
      });
      await router.replace(router.asPath);
      setKoName("");
      setEnName("");
    } catch (caught) {
      setError(adminApiErrorMessage(caught));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-8">
      <section className={`${cardClass} grid gap-4`}>
        <h2 className={cardTitleClass}>새 카테고리</h2>
        <p className="text-sm text-slate-600">
          공지 작성 화면의 카테고리 선택지와 공개 공지 목록의 분류 필터에 쓰입니다.
          두 언어 이름을 모두 적어야 등록됩니다.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="국문 이름">
            <input
              value={koName}
              onChange={(event) => setKoName(event.target.value)}
              placeholder="예: 채용"
              className={inputClass}
            />
          </Field>
          <Field label="영문 이름">
            <input
              value={enName}
              onChange={(event) => setEnName(event.target.value)}
              placeholder="예: Careers"
              className={inputClass}
            />
          </Field>
        </div>
        <button
          type="button"
          disabled={busy || !koName.trim() || !enName.trim()}
          onClick={create}
          className={`${primaryButtonClass} w-fit`}
        >
          카테고리 등록
        </button>
        <AdminFormFeedback error={error} />
      </section>
      <section className={cardClass}>
        <h2 className={cardTitleClass}>등록된 카테고리</h2>
        <p className="mt-1 text-sm text-slate-600">
          화살표로 공개 목록의 필터 순서를 바꿉니다. 사용 중지한 카테고리는 새 공지에서 고를 수 없지만 기존 공지에는 그대로 남습니다.
        </p>
        {sorted.length ? (
          <ul className="mt-3">
            {sorted.map((category, index) => (
              <CategoryRow
                key={category.id}
                category={category}
                neighbors={{ up: sorted[index - 1], down: sorted[index + 1] }}
              />
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-slate-500">
            등록된 카테고리가 없습니다. 카테고리 없이도 공지를 게시할 수 있습니다.
          </p>
        )}
      </section>
    </div>
  );
}
