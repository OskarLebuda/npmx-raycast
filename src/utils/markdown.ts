const anchorTagRegex = /<a\s+[^>]*href=(["'])(.*?)\1[^>]*>([\s\S]*?)<\/a>/gi;
const imageTagRegex = /<img\s+[^>]*src=(["'])(.*?)\1[^>]*>/gi;
const htmlTagRegex = /<\/?([a-z][a-z0-9-]*)\b[^>]*>/gi;
const encodedEntityMap: Record<string, string> = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
};

/**
 * Decodes the most common HTML entities found in README content.
 */
const decodeEntities = (value: string): string => {
  return value.replace(/&(amp|lt|gt|quot|#39);/g, (entity) => encodedEntityMap[entity] ?? entity);
};

/**
 * Strips inline HTML tags from a string fragment.
 */
const stripInlineHtml = (value: string): string => value.replace(/<\/?[^>]+>/g, '').trim();

/**
 * Normalizes README markdown by converting common HTML snippets.
 */
export const normalizeReadmeMarkdown = (rawMarkdown: string): string => {
  let normalized = rawMarkdown;

  normalized = normalized.replace(anchorTagRegex, (_full, _quote, href: string, label: string) => {
    const cleanLabel = stripInlineHtml(decodeEntities(label)) || href;
    return `[${cleanLabel}](${href})`;
  });

  normalized = normalized.replace(imageTagRegex, (fullTag: string, _quote: string, src: string) => {
    const altMatch = fullTag.match(/alt=(["'])(.*?)\1/i);
    const alt = altMatch?.[2] ?? 'image';
    return `![${decodeEntities(alt)}](${src})`;
  });

  // Keep line breaks readable in Raycast markdown renderer.
  normalized = normalized.replace(/<br\s*\/?>/gi, '\n');
  normalized = normalized.replace(/<\/p>\s*<p[^>]*>/gi, '\n\n');

  // Remove wrappers that often appear in HTML-heavy READMEs.
  normalized = normalized.replace(/<\/?(p|div|span|section|article|main)[^>]*>/gi, '');

  // If HTML tags still dominate, strip unknown tags as a final fallback.
  const tagCount = (normalized.match(htmlTagRegex) ?? []).length;
  if (tagCount > 30) {
    normalized = normalized.replace(htmlTagRegex, '');
  }

  return decodeEntities(normalized).trim();
};
