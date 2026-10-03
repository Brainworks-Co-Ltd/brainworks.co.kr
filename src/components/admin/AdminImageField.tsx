import { useId, useState } from "react";
import { adminApiErrorMessage, requestAdminApi } from "@/lib/admin-api";
import { secondaryButtonClass } from "@/components/admin/fields";

export type AdminImageValue = { assetId: string | null; url: string | null };

type AdminImageFieldProps = {
  label: string;
  value: AdminImageValue;
  onChange: (next: AdminImageValue) => void;
  disabled?: boolean;
  hint?: string;
  onBusyChange?: (busy: boolean) => void;
  onError?: (message: string) => void;
  onUnauthorized?: (error: unknown) => boolean;
};

const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxImageBytes = 10 * 1024 * 1024;

/**
 * 관리자 폼 공용 이미지 입력칸. 값(assetId, url)과 변경 알림만 다루고 저장은 각 폼이 한다.
 * "이미지 빼기"도 폼 값만 비우므로 "변경 저장"을 눌러야 반영된다.
 * 파일 입력은 숨기고 버튼처럼 보이는 라벨로 연다.
 */
export function AdminImageField({
  label,
  value,
  onChange,
  disabled = false,
  hint,
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
    <div className="grid content-start gap-2 text-sm font-medium">
      <label htmlFor={inputId}>{label}</label>
      <div className="flex flex-wrap items-center gap-4">
        {value.url ? (
          // eslint-disable-next-line @next/next/no-img-element -- 관리자가 올린 이미지라 실제 크기를 미리 알 수 없다.
          <img
            src={value.url}
            alt=""
            className="h-28 w-40 rounded-[var(--bw-radius-control)] border border-[var(--bw-color-line)] bg-white object-cover"
          />
        ) : (
          <div className="flex h-28 w-40 items-center justify-center rounded-[var(--bw-radius-control)] border border-dashed border-slate-300 text-xs font-normal text-slate-400">
            이미지 없음
          </div>
        )}
        <div className="grid gap-2">
          <input
            id={inputId}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={locked}
            onChange={(event) => upload(event.currentTarget)}
            className="sr-only"
          />
          <div className="flex flex-wrap gap-2">
            <label
              htmlFor={inputId}
              className={`${secondaryButtonClass} cursor-pointer ${locked ? "pointer-events-none opacity-60" : ""}`}
            >
              {value.assetId ? "이미지 바꾸기" : "이미지 올리기"}
            </label>
            {value.assetId ? (
              <button
                type="button"
                disabled={locked}
                onClick={() => onChange({ assetId: null, url: null })}
                className="min-h-10 rounded-[var(--bw-radius-control)] px-3 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60"
              >
                이미지 빼기
              </button>
            ) : null}
          </div>
          <p
            aria-live="polite"
            className="text-xs font-normal leading-5 text-slate-500"
          >
            {uploading
              ? "이미지를 올리는 중입니다."
              : hint || "JPEG, PNG, WebP 파일, 10MB 이하"}
          </p>
        </div>
      </div>
    </div>
  );
}
