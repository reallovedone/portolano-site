// Pure helpers for the vault scene. No DOM access, so they can be unit tested.

export type PartState = "hidden" | "revealing" | "shown" | "hiding";

/** Parses a CSS `cubic-bezier(a, b, c, d)` token value. Null when it is anything else. */
export function parseBezier(value: string): [number, number, number, number] | null {
  const match = /^cubic-bezier\(\s*([^,]+),([^,]+),([^,]+),([^)]+)\)$/.exec(value.trim());
  if (!match) return null;
  const numbers = match.slice(1, 5).map((part) => Number.parseFloat(part));
  if (numbers.some((n) => !Number.isFinite(n))) return null;
  return [numbers[0], numbers[1], numbers[2], numbers[3]];
}

/** Converts moments in milliseconds into keyframe `times` (0..1) over `total`, kept ascending. */
export function timesOf(moments: number[], total: number): number[] {
  if (total <= 0) return moments.map(() => 0);
  let last = 0;
  return moments.map((moment) => {
    last = Math.max(last, Math.min(Math.max(moment / total, 0), 1));
    return last;
  });
}

/** Which parts to reveal and which to hide so that parts 0..target are shown and the rest is not. */
export function planParts(states: PartState[], target: number): { show: number[]; hide: number[] } {
  const show: number[] = [];
  const hide: number[] = [];
  states.forEach((state, part) => {
    if (part <= target) {
      if (state === "hidden" || state === "hiding") show.push(part);
    } else if (state === "revealing" || state === "shown") {
      hide.push(part);
    }
  });
  return { show, hide };
}
