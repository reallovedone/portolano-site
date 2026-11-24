// Pure helpers for the section motion package. No DOM access, so they can be unit tested.

/** Decelerating curve, 0..1 in and out. */
export function easeOutCubic(t: number): number {
  const x = Math.min(1, Math.max(0, t));
  return 1 - (1 - x) ** 3;
}

/** Value shown by a count-up `elapsed` ms after it started: an integer from 0 to `target`. */
export function countAt(target: number, elapsed: number, duration: number): number {
  if (duration <= 0 || elapsed >= duration) return target;
  return Math.floor(target * easeOutCubic(elapsed / duration));
}

/** Delay of the `index`-th item of a staggered group. */
export function staggerDelay(index: number, stepMs: number): number {
  return Math.max(0, index) * stepMs;
}

/**
 * Index of the active section: the last one whose dot is at or above the probe line.
 * `positions` are document offsets in ascending order. Before the first dot the first one is active.
 */
export function activeIndex(positions: readonly number[], probe: number): number {
  let active = 0;
  for (let i = 0; i < positions.length; i += 1) {
    if (positions[i] <= probe) active = i;
    else break;
  }
  return active;
}

/** Length of the travelled part of the line, from its first dot to the probe line, clamped. */
export function travelled(start: number, end: number, probe: number): number {
  return Math.min(Math.max(probe - start, 0), Math.max(end - start, 0));
}

/** `index + delta` wrapped into 0..length-1. */
export function wrapIndex(index: number, delta: number, length: number): number {
  if (length <= 0) return 0;
  return (((index + delta) % length) + length) % length;
}

/** Which arrow keys move between the tabs: left/right, up/down or all four. */
export type TabAxis = "horizontal" | "vertical" | "both";

/** Tab to select for a key press in a tablist, or null when the key is not handled. */
export function tabForKey(key: string, current: number, length: number, axis: TabAxis = "horizontal"): number | null {
  const across = axis !== "vertical";
  const down = axis !== "horizontal";
  if (key === "Home") return 0;
  if (key === "End") return Math.max(length - 1, 0);
  if ((across && key === "ArrowRight") || (down && key === "ArrowDown")) return wrapIndex(current, 1, length);
  if ((across && key === "ArrowLeft") || (down && key === "ArrowUp")) return wrapIndex(current, -1, length);
  return null;
}

/** How long autoplay stays on tab `index` before moving on; the last tab may hold longer. */
export function autoDelay(index: number, length: number, interval: number, lastInterval: number = interval): number {
  return index === length - 1 ? lastInterval : interval;
}
