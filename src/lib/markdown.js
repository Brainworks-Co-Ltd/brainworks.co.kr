import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import remarkRehype from "remark-rehype";
import rehypeSanitize from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkBreaks)
  .use(remarkRehype, { allowDangerousHtml: false })
  .use(rehypeSanitize)
  .use(rehypeStringify);

// ponytail: 상한 200개 단순 FIFO. 본문이 그보다 많아지면 LRU로 올릴 것.
const cache = new Map();
const MAX = 200;

export function markdownToHtml(markdown) {
  if (!markdown) {
    return "";
  }

  const hit = cache.get(markdown);
  if (hit !== undefined) {
    return hit;
  }

  const trimmed =
    markdown.charCodeAt(0) === 0xfeff ? markdown.slice(1) : markdown;
  const result = processor.processSync(trimmed);
  const html = result.toString().trim();

  if (cache.size >= MAX) {
    cache.delete(cache.keys().next().value);
  }
  cache.set(markdown, html);

  return html;
}

export function __markdownCacheSize() {
  return cache.size;
}
