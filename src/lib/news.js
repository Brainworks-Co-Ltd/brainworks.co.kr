import fs from 'fs';
import path from 'path';
import { markdownToHtml } from '@/lib/markdown';

const NEWS_DIRECTORY = path.join(process.cwd(), 'src', 'content', 'news');

function readNewsFiles() {
  if (!fs.existsSync(NEWS_DIRECTORY)) {
    return [];
  }

  return fs
    .readdirSync(NEWS_DIRECTORY)
    .filter((file) => file.endsWith('.md'))
    .map((file) => ({
      file,
      fullPath: path.join(NEWS_DIRECTORY, file),
    }));
}

function parseFrontMatter(fileContents, filePath) {
  const cleaned = fileContents.replace(/^\uFEFF/, '');
  const match = cleaned.match(/^---\r?\n([\s\S]+?)\r?\n---\r?\n([\s\S]*)$/);

  if (!match) {
    throw new Error(`Front matter not found in ${filePath}`);
  }

  const metadataRaw = match[1].trim();
  let metadata;

  try {
    metadata = JSON.parse(metadataRaw);
  } catch (error) {
    throw new Error(`Invalid JSON front matter in ${filePath}: ${error.message}`);
  }

  const body = match[2].replace(/\r\n/g, '\n').trim();
  return { metadata, body };
}

function extractLanguageContent(markdownBody) {
  const segments = markdownBody.split(/<!--\s*(ko|en)\s*-->/i);
  const content = { ko: '', en: '' };

  if (segments.length > 1) {
    for (let index = 1; index < segments.length; index += 2) {
      const lang = segments[index].trim().toLowerCase();
      const value = (segments[index + 1] || '').trim();
      if (lang === 'ko' || lang === 'en') {
        content[lang] = value;
      }
    }
  }

  const fallback = markdownBody.trim();
  if (!content.ko) {
    content.ko = fallback;
  }
  if (!content.en) {
    content.en = fallback;
  }

  return content;
}

function ensureLanguageValue(value, fallback) {
  const base = fallback || { ko: '', en: '' };

  if (value && typeof value === 'object') {
    return {
      ko: value.ko || base.ko,
      en: value.en || base.en,
    };
  }

  if (typeof value === 'string') {
    return {
      ko: value,
      en: value,
    };
  }

  return {
    ko: base.ko,
    en: base.en,
  };
}


function normaliseExternalLinks(raw) {
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw
    .map((item) => {
      if (!item || typeof item !== 'object') {
        return null;
      }

      const url = typeof item.url === 'string' && item.url.trim() ? item.url.trim() : typeof item.href === 'string' && item.href.trim() ? item.href.trim() : '';
      if (!url) {
        return null;
      }

      const label = ensureLanguageValue(item.label || item.title || '', { ko: '바로가기', en: 'Open link' });
      return { url, label };
    })
    .filter(Boolean);
}

function toPlainText(markdown) {
  if (!markdown) {
    return '';
  }

  return markdown
    .replace(/<!--[^>]*-->/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[#*_>`]/g, ' ')
    .replace(/\r?\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function createSummaryText(markdown) {
  const plain = toPlainText(markdown);
  if (!plain) {
    return '';
  }
  const maxLength = 140;
  if (plain.length <= maxLength) {
    return plain;
  }
  return plain.slice(0, maxLength).trim() + '...';
}

function buildNewsEntry(fileRecord) {
  const fileContents = fs.readFileSync(fileRecord.fullPath, 'utf-8');
  const { metadata, body } = parseFrontMatter(fileContents, fileRecord.fullPath);
  const slug = (metadata.slug || fileRecord.file.replace(/\.md$/, '')).toString();
  const content = extractLanguageContent(body);

  const title = ensureLanguageValue(metadata.title, { ko: slug, en: slug });
  const category = ensureLanguageValue(metadata.category, { ko: '뉴스', en: 'News' });
  const summaryFallback = {
    ko: createSummaryText(content.ko),
    en: createSummaryText(content.en),
  };
  const summary = ensureLanguageValue(metadata.summary, summaryFallback);

  const externalLinks = normaliseExternalLinks(metadata.externalLinks);

  return {
    slug,
    date: metadata.date || '',
    thumbnail: metadata.thumbnail || '',
    category,
    title,
    summary,
    content,
    externalLinks,
  };
}

function sortByDateDesc(items) {
  return items.sort((a, b) => {
    const dateA = a.date ? new Date(a.date).getTime() : 0;
    const dateB = b.date ? new Date(b.date).getTime() : 0;
    return dateB - dateA;
  });
}

export function getAllNewsMeta() {
  const entries = readNewsFiles().map(buildNewsEntry);
  const sorted = sortByDateDesc(entries);
  return sorted.map((entry) => ({
    slug: entry.slug,
    date: entry.date,
    thumbnail: entry.thumbnail,
    category: entry.category,
    title: entry.title,
    summary: entry.summary,
  }));
}

export function getLatestNews(limit = 3) {
  const meta = getAllNewsMeta();
  return meta.slice(0, limit);
}

export function getNewsSlugs() {
  return getAllNewsMeta().map((entry) => entry.slug);
}

export function getNewsDetail(slug) {
  const fileRecords = readNewsFiles();

  for (const record of fileRecords) {
    const entry = buildNewsEntry(record);
    if (entry.slug === slug) {
      return {
        slug: entry.slug,
        date: entry.date,
        thumbnail: entry.thumbnail,
        category: entry.category,
        title: entry.title,
        summary: entry.summary,
        content: {
          ko: markdownToHtml(entry.content.ko),
          en: markdownToHtml(entry.content.en),
        },
        externalLinks: entry.externalLinks.map((link) => ({
          url: link.url,
          label: ensureLanguageValue(link.label, { ko: '바로가기', en: 'Open link' }),
        })),
      };
    }
  }

  return null;
}
