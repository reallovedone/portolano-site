// Showcase tabs (plan 3.5). The markup is the static column of screenshots plus a tablist that is
// only shown with JavaScript; this script wires the ARIA tabs pattern (roving tabindex, arrow keys,
// Home/End), the sliding indicator and the auto-advance.
import { cssMs } from "../../scripts/motion/css";
import { tabForKey, wrapIndex } from "../../scripts/motion/pure";

export function initShowcase(reducedMotion: boolean): void {
  const root = document.querySelector<HTMLElement>("[data-showcase]");
  const list = root?.querySelector<HTMLElement>("[role='tablist']");
  const indicator = root?.querySelector<HTMLElement>("[data-indicator]");
  if (!root || !list || !indicator) return;

  const tabs = Array.from(list.querySelectorAll<HTMLButtonElement>("[role='tab']"));
  const panels = Array.from(root.querySelectorAll<HTMLElement>("[data-panel]"));
  if (tabs.length === 0 || tabs.length !== panels.length) {
    throw new Error("Showcase tabs and panels do not match");
  }

  tabs.forEach((tab, i) => {
    panels[i].setAttribute("role", "tabpanel");
    panels[i].setAttribute("aria-labelledby", tab.id);
  });

  let current = Math.max(
    0,
    tabs.findIndex((tab) => tab.getAttribute("aria-selected") === "true"),
  );

  const placeIndicator = (): void => {
    const tab = tabs[current];
    // The tabs may wrap onto two rows on narrow screens: the bar sits under the tab's own row.
    const y = tab.offsetTop + tab.offsetHeight - indicator.offsetHeight;
    indicator.style.transform = `translate(${tab.offsetLeft}px, ${y}px) scaleX(${tab.offsetWidth})`;
  };

  const select = (index: number): void => {
    current = index;
    tabs.forEach((tab, i) => {
      const active = i === index;
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
      panels[i].classList.toggle("is-active", active);
      if (active) panels[i].setAttribute("tabindex", "0");
      else panels[i].removeAttribute("tabindex");
    });
    placeIndicator();
  };

  // Auto-advance --------------------------------------------------------------------------
  const interval = cssMs("--showcase-advance");
  let stopped = reducedMotion;
  let onScreen = false;
  let timer: number | undefined;

  const clearTimer = (): void => {
    if (timer !== undefined) window.clearTimeout(timer);
    timer = undefined;
  };
  const schedule = (): void => {
    clearTimer();
    if (stopped || !onScreen || document.hidden) return;
    timer = window.setTimeout(() => {
      select(wrapIndex(current, 1, tabs.length));
      schedule();
    }, interval);
  };
  // Any click, key or focus inside the tablist ends the automatic tour for good.
  const stop = (): void => {
    stopped = true;
    clearTimer();
  };

  tabs.forEach((tab, i) => {
    tab.addEventListener("click", () => {
      select(i);
    });
  });
  list.addEventListener("click", stop);
  list.addEventListener("focusin", stop);
  list.addEventListener("keydown", (event) => {
    stop();
    const from = tabs.findIndex((tab) => tab === document.activeElement);
    if (from < 0) return;
    const next = tabForKey(event.key, from, tabs.length);
    if (next === null) return;
    event.preventDefault();
    tabs[next].focus();
    select(next);
  });

  const visibility = new IntersectionObserver((entries) => {
    onScreen = entries[entries.length - 1].isIntersecting;
    schedule();
  });
  visibility.observe(root);
  document.addEventListener("visibilitychange", schedule);
  window
    .matchMedia("(prefers-reduced-motion: reduce)")
    .addEventListener("change", (event) => {
      if (event.matches) stop();
    });

  // The indicator is placed without a transition the first time, and again when sizes change.
  select(current);
  window.requestAnimationFrame(() => list.classList.add("is-ready"));
  const resize = new ResizeObserver(placeIndicator);
  resize.observe(list);
  for (const tab of tabs) resize.observe(tab);
}
