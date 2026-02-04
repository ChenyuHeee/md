export function stripYamlFrontmatter(markdown: string): {
  markdown: string;
  offsetLines: number;
} {
  const src = markdown ?? '';
  // Allow BOM.
  const input = src.startsWith('\uFEFF') ? src.slice(1) : src;

  // YAML frontmatter must be at the very start.
  // Matches:
  // ---\n ... \n---\n
  // or
  // ---\n ... \n...\n
  const m = input.match(/^(---)\s*\r?\n([\s\S]*?)\r?\n(---|\.\.\.)\s*(\r?\n|$)/);
  if (!m) return { markdown: src, offsetLines: 0 };

  const removed = m[0];
  const offsetLines = (removed.match(/\r?\n/g) ?? []).length;

  // Slice from the original string (keeping BOM if present doesn't matter for render, but keep behavior stable).
  const startIndex = (src.startsWith('\uFEFF') ? 1 : 0) + removed.length;
  const rest = src.slice(startIndex);
  return { markdown: rest, offsetLines };
}
