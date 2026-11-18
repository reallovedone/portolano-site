// Splits plain text into text and link parts, so copy strings stay plain text and components
// decide how to render the links.

export interface LinkSpec {
  text: string;
  href: string;
}

export type LinkPart = string | { text: string; href: string };

/** Replaces the first occurrence of each link text with a link part; the rest stays as text. */
export function linkify(text: string, links: readonly LinkSpec[] = []): LinkPart[] {
  const found = links
    .map((link) => ({ link, index: text.indexOf(link.text) }))
    .filter((hit) => hit.index >= 0)
    .sort((a, b) => a.index - b.index);

  const parts: LinkPart[] = [];
  let cursor = 0;
  for (const { link, index } of found) {
    if (index < cursor) continue; // overlaps a previous link
    if (index > cursor) parts.push(text.slice(cursor, index));
    parts.push({ text: link.text, href: link.href });
    cursor = index + link.text.length;
  }
  if (cursor < text.length) parts.push(text.slice(cursor));
  return parts;
}
