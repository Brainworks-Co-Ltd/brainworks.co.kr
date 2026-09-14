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

export function markdownToHtml(markdown) {
  if (!markdown) {
    return "";
  }

  const trimmed =
    markdown.charCodeAt(0) === 0xfeff ? markdown.slice(1) : markdown;
  const result = processor.processSync(trimmed);
  return result.toString().trim();
}
