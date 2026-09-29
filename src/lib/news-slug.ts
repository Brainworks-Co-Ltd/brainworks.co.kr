export function suggestSlug(title: string, displayDate: string) {
  const candidate = title
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
  if (candidate) return candidate;
  const suffix = Math.random().toString(36).slice(2, 6);
  return `news-${displayDate.replaceAll("-", "")}-${suffix}`;
}
