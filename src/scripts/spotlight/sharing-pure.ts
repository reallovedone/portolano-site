// Pure helpers for the "Shared folders" scene (no DOM), unit-tested in sharing-pure.test.ts.

export type Bezier = [number, number, number, number];

/** Parses a `cubic-bezier(a, b, c, d)` token value. Returns null when it is not one. */
export function parseBezier(raw: string): Bezier | null {
  const match = /^cubic-bezier\(\s*([^,]+),\s*([^,]+),\s*([^,]+),\s*([^)]+)\)$/.exec(raw.trim());
  if (!match) return null;
  const values = match.slice(1, 5).map((part) => Number.parseFloat(part));
  if (values.some((v) => Number.isNaN(v))) return null;
  return [values[0], values[1], values[2], values[3]];
}

/** Opacity of a travelling dot at `progress` (0..1): fades in at the start and out at the end. */
export function dotOpacity(progress: number, edge = 0.12): number {
  if (progress <= 0 || progress >= 1) return 0;
  if (progress < edge) return progress / edge;
  if (progress > 1 - edge) return (1 - progress) / edge;
  return 1;
}
