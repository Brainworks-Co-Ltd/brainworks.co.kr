import { useState } from "react";
import { useRouter } from "next/router";
import { AdminFormFeedback } from "@/components/admin/AdminFormFeedback";
import {
  adminApiErrorMessage,
  requestAdminApi,
} from "@/lib/admin-api";

export type AdminNoticeCategory = {
  id: string;
  version: number;
  isActive: boolean;
  displayOrder: number;
  locales: Record<string, { name: string }>;
};

function CategoryRow({ category }: { category: AdminNoticeCategory }) {
  const router = useRouter();
  const [koName, setKoName] = useState(category.locales.ko?.name || "");
  const [enName, setEnName] = useState(category.locales.en?.name || "");
  const [displayOrder, setDisplayOrder] = useState(category.displayOrder);
  const [version, setVersion] = useState(category.version);
  const [active, setActive] = useState(category.isActive);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

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
            displayOrder,
            locales: { ko: { name: koName }, en: { name: enName } },
          }),
        },
      );
      setVersion(result.version);
      setMessage("카테고리를 저장했습니다.");
    } catch (caught) {
      setError(adminApiErrorMessage(caught));
    } finally {
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

  return (
    <section className="grid gap-4 border-t border-slate-200 py-5 first:border-t-0">
      <div className="grid gap-4 md:grid-cols-[1fr_1fr_8rem]">
        <label className="grid gap-2 text-sm font-medium">
          국문 이름
          <input
            value={koName}
            onChange={(event) => setKoName(event.target.value)}
            className="min-h-11 rounded-xl border border-slate-300 px-3"
          />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          영문 이름
          <input
            value={enName}
            onChange={(event) => setEnName(event.target.value)}
            className="min-h-11 rounded-xl border border-slate-300 px-3"
          />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          표시 순서
          <input
            type="number"
            min="0"
            value={displayOrder}
            onChange={(event) => setDisplayOrder(Number(event.target.value))}
            className="min-h-11 rounded-xl border border-slate-300 px-3"
          />
        </label>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-2 text-sm text-slate-500">
          {active ? "활성" : "비활성"}
        </span>
        <button
          type="button"
          disabled={busy}
          onClick={save}
          className="min-h-10 rounded-full bg-[var(--bw-color-ink)] px-4 text-sm font-semibold text-white disabled:opacity-60"
        >
          변경 저장
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={toggleActive}
          className="min-h-10 rounded-full border border-slate-300 px-4 text-sm font-semibold disabled:opacity-60"
        >
          {active ? "비활성화" : "활성화"}
        </button>
      </div>
      <AdminFormFeedback error={error} message={message} />
    </section>
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
  const [displayOrder, setDisplayOrder] = useState(categories.length + 1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function create() {
    setBusy(true);
    setError("");
    try {
      await requestAdminApi("/api/admin/notice-categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayOrder,
          locales: { ko: { name: koName }, en: { name: enName } },
        }),
      });
      await router.replace(router.asPath);
      setKoName("");
      setEnName("");
      setDisplayOrder(categories.length + 2);
    } catch (caught) {
      setError(adminApiErrorMessage(caught));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-8">
      <section className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold">새 카테고리</h2>
        <div className="grid gap-4 md:grid-cols-[1fr_1fr_8rem]">
          <label className="grid gap-2 text-sm font-medium">
            국문 이름
            <input
              value={koName}
              onChange={(event) => setKoName(event.target.value)}
              className="min-h-11 rounded-xl border border-slate-300 px-3"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium">
            영문 이름
            <input
              value={enName}
              onChange={(event) => setEnName(event.target.value)}
              className="min-h-11 rounded-xl border border-slate-300 px-3"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium">
            표시 순서
            <input
              type="number"
              min="0"
              value={displayOrder}
              onChange={(event) => setDisplayOrder(Number(event.target.value))}
              className="min-h-11 rounded-xl border border-slate-300 px-3"
            />
          </label>
        </div>
        <button
          type="button"
          disabled={busy || !koName.trim() || !enName.trim()}
          onClick={create}
          className="w-fit min-h-10 rounded-full bg-[var(--bw-color-ink)] px-4 text-sm font-semibold text-white disabled:opacity-60"
        >
          카테고리 등록
        </button>
        <AdminFormFeedback error={error} />
      </section>
      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="mb-3 text-lg font-semibold">등록된 카테고리</h2>
        {categories.length ? (
          categories.map((category) => (
            <CategoryRow key={category.id} category={category} />
          ))
        ) : (
          <p className="text-sm text-slate-500">등록된 카테고리가 없습니다.</p>
        )}
      </section>
    </div>
  );
}
