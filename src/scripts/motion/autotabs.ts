// Shared behaviour of the autoplaying tablists (showcase, spotlight scenes): click and keyboard
// selection with roving tabindex, plus an automatic tour that runs only while the watched element is on
// screen and the page is visible, and ends for good at the first click, key or focus inside the tablist.
import { autoDelay, tabForKey, wrapIndex, type TabAxis } from "./pure";

export type AutoState = "running" | "paused" | "stopped";

export interface AutoTabsOptions {
  /** The element with role="tablist". */
  list: HTMLElement;
  tabs: HTMLElement[];
  /** Applies the selection (aria-selected, panels, ...). Called for clicks, keys and autoplay. */
  select: (index: number) => void;
  /** Time spent on each tab, ms (autoplay only). */
  interval?: number;
  /** Autoplay only runs while this element is on screen. Without it there is no autoplay at all. */
  watch?: Element;
  /** Index selected at start-up. */
  initial?: number;
  /** Time spent on the last tab before wrapping to the first, ms. Defaults to `interval`. */
  lastInterval?: number;
  /** Arrow keys that move the selection. Defaults to left/right. */
  axis?: TabAxis;
  /** True to never autoplay (reduced motion). */
  reducedMotion?: boolean;
  /** Called after each automatic move. */
  onTick?: (index: number) => void;
  /** Called when autoplay starts, pauses (off screen, hidden page) or stops for good. */
  onState?: (state: AutoState) => void;
}

export function startAutotabs(options: AutoTabsOptions): { stop: () => void } {
  const { list, tabs, select, interval, lastInterval, axis, onTick, onState } = options;
  let current = options.initial ?? 0;
  let stopped = options.reducedMotion === true || !options.watch;
  let onScreen = false;
  let timer: number | undefined;
  let state: AutoState | null = null;

  const go = (index: number): void => {
    current = index;
    select(index);
  };
  const clearTimer = (): void => {
    if (timer !== undefined) window.clearTimeout(timer);
    timer = undefined;
  };
  const schedule = (): void => {
    clearTimer();
    const next: AutoState = stopped ? "stopped" : onScreen && !document.hidden ? "running" : "paused";
    if (next !== state) {
      state = next;
      onState?.(next);
    }
    if (next !== "running") return;
    timer = window.setTimeout(() => {
      go(wrapIndex(current, 1, tabs.length));
      onTick?.(current);
      schedule();
    }, autoDelay(current, tabs.length, interval ?? 0, lastInterval));
  };
  const stop = (): void => {
    stopped = true;
    schedule();
  };

  tabs.forEach((tab, i) => {
    tab.addEventListener("click", () => {
      go(i);
    });
  });
  list.addEventListener("click", stop);
  list.addEventListener("focusin", stop);
  list.addEventListener("keydown", (event) => {
    stop();
    const from = tabs.findIndex((tab) => tab === document.activeElement);
    if (from < 0) return;
    const next = tabForKey(event.key, from, tabs.length, axis);
    if (next === null) return;
    event.preventDefault();
    tabs[next].focus();
    go(next);
  });

  if (options.watch) {
    new IntersectionObserver((entries) => {
      onScreen = entries[entries.length - 1].isIntersecting;
      schedule();
    }).observe(options.watch);
  }
  document.addEventListener("visibilitychange", schedule);
  window.matchMedia("(prefers-reduced-motion: reduce)").addEventListener("change", (event) => {
    if (event.matches) stop();
  });
  if (stopped) schedule();

  return { stop };
}
