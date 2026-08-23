import { markdownToHtml } from "@/lib/markdown";

export function renderMarkdownPreview(markdown: string) {
  return markdownToHtml(markdown || "");
}
