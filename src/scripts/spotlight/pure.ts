// Pure helpers for the spotlight scenes. No DOM access, so they can be unit tested.

/** Step shown at `progress` (0..1 across the steps column) for `count` steps, clamped to 0..count-1. */
export function stepAt(progress: number, count: number): number {
  if (count <= 0 || !Number.isFinite(progress)) return 0;
  const index = Math.floor(Math.min(Math.max(progress, 0), 1) * count);
  return Math.min(index, count - 1);
}
