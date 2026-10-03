import { useRouter } from "next/router";
import { useState } from "react";
import { adminApiErrorMessage, requestAdminApi } from "@/lib/admin-api";

/** 목록 안에서 한 칸 위나 아래로 옮긴다. 서버가 이웃 항목과 순서를 맞바꾸고 목록을 다시 읽는다. */
export function ReorderButtons({
  endpoint,
  version,
  first,
  last,
}: {
  endpoint: string;
  version: number;
  first: boolean;
  last: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function move(direction: "up" | "down") {
    setBusy(true);
    setError("");
    try {
      await requestAdminApi(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ direction, expectedVersion: version }),
      });
      await router.replace(router.asPath, undefined, { scroll: false });
    } catch (caught) {
      setError(adminApiErrorMessage(caught));
    } finally {
      setBusy(false);
    }
  }

  const buttonClass =
    "inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 bg-white text-base leading-none disabled:opacity-40";

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        aria-label="위로"
        title="위로"
        disabled={busy || first}
        onClick={() => move("up")}
        className={buttonClass}
      >
        ↑
      </button>
      <button
        type="button"
        aria-label="아래로"
        title="아래로"
        disabled={busy || last}
        onClick={() => move("down")}
        className={buttonClass}
      >
        ↓
      </button>
      {error ? (
        <span role="alert" className="ml-2 text-xs text-red-700">
          {error}
        </span>
      ) : null}
    </div>
  );
}
