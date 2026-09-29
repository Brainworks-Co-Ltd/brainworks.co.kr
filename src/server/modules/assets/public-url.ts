export function resolvePublicAssetUrl(
  storageKey: string,
  base = process.env.ASSET_PUBLIC_BASE_URL,
) {
  if (storageKey.includes("..")) return null;
  const normalizedKey = storageKey.replace(/^\/+/, "");
  // 전송망 주소가 없으면 같은 출처에서 찾는다. 개발에서는 public 아래 파일이
  // 그대로 걸리고, next/image도 상대 경로는 별도 허용 목록 없이 최적화한다.
  // 예전에는 null을 돌려줘서 주소가 빈 문자열이 되고 이미지가 통째로 사라졌다.
  if (!base) return `/${normalizedKey}`;
  if (!/^https?:\/\//.test(base)) return null;
  const normalizedBase = base.endsWith("/") ? base : `${base}/`;
  return new URL(normalizedKey, normalizedBase).toString();
}
