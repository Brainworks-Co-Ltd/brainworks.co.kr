export function resolvePublicAssetUrl(
  storageKey: string,
  base = process.env.ASSET_PUBLIC_BASE_URL,
) {
  if (!base) return null;
  if (!/^https?:\/\//.test(base) || storageKey.includes("..")) return null;
  const normalizedBase = base.endsWith("/") ? base : `${base}/`;
  const normalizedKey = storageKey.replace(/^\/+/, "");
  return new URL(normalizedKey, normalizedBase).toString();
}
