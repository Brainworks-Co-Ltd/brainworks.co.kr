import { useId, useState } from "react";
import { adminApiErrorMessage, requestAdminApi } from "@/lib/admin-api";

export type AdminImageValue = { assetId: string | null; url: string | null };

type AdminImageFieldProps = {
  label: string;
  value: AdminImageValue;
  onChange: (next: AdminImageValue) => void;
  disabled?: boolean;
  onBusyChange?: (busy: boolean) => void;
  onError?: (message: string) => void;
  onUnauthorized?: (error: unknown) => boolean;
};

const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxImageBytes = 10 * 1024 * 1024;

/**
 * 관리자 폼 공용 이미지 입력칸. 값(assetId, url)과 변경 알림만 다루고 저장은 각 폼이 한다.
 * "이미지 빼기"도 폼 값만 비우므로 "변경 저장"을 눌러야 반영된다.
 */
export function AdminImageField({
  label,
  value,
  onChange,
  disabled = false,
  onBusyChange,
  onError,
  onUnauthorized,
}: AdminImageFieldProps) {
  const inputId = useId();
  const [uploading, setUploading] = useState(false);

  async function upload(input: HTMLInputElement) {
    const file = input.files?.[0];
    // 같은 파일을 다시 골라도 change가 일어나도록 비운다.
    input.value = "";
    if (!file) return;
    const rejected = !allowedImageTypes.has(file.type)
      ? "IMAGE_TYPE_NOT_ALLOWED"
      : file.size > maxImageBytes
        ? "IMAGE_TOO_LARGE"
        : null;
    if (rejected) {
      onError?.(adminApiErrorMessage(rejected));
      return;
    }
    setUploading(true);
    onBusyChange?.(true);
    onError?.("");
    try {
      const body = new FormData();
      body.append("file", file);
      const asset = await requestAdminApi<{ id: string; url: string | null }>(
        "/api/admin/assets",
        { method: "POST", body },
      );
      onChange({ assetId: asset.id, url: asset.url });
    } catch (caught) {
      if (!onUnauthorized?.(caught)) onError?.(adminApiErrorMessage(caught));
    } finally {
      setUploading(false);
      onBusyChange?.(false);
    }
  }

  const locked = disabled || uploading;

  return (
    <div className="grid gap-2 text-sm font-medium">
      <label htmlFor={inputId}>{label}</label>
      {value.url ? (
        // eslint-disable-next-line @next/next/no-img-element -- 관리자가 올린 이미지라 실제 크기를 미리 알 수 없다.
        <img
          src={value.url}
          alt=""
          className="h-32 w-auto max-w-full rounded-lg border border-slate-200 object-contain"
        />
      ) : null}
      <div className="flex flex-wrap items-center gap-3">
        <input
          id={inputId}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          disabled={locked}
          onChange={(event) => upload(event.currentTarget)}
          className="block text-sm"
        />
        {value.assetId ? (
          <button
            type="button"
            disabled={locked}
            onClick={() => onChange({ assetId: null, url: null })}
            className="min-h-9 rounded-full border border-slate-300 px-3 text-xs font-semibold disabled:opacity-60"
          >
            이미지 빼기
          </button>
        ) : null}
      </div>
      {uploading ? (
        <p aria-live="polite" className="text-xs font-normal text-slate-600">
          이미지를 올리는 중입니다.
        </p>
      ) : null}
    </div>
  );
}
