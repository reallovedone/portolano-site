// Showcase tabs (plan 3.5). The markup is the static column of screenshots plus a tablist that is
// only shown with JavaScript; this script wires the ARIA tabs pattern (roving tabindex, arrow keys,
// Home/End, in autotabs.ts), the sliding indicator and the auto-advance.
import { startAutotabs } from "../../scripts/motion/autotabs";
import { cssMs } from "../../scripts/css";

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

  startAutotabs({
    list,
    tabs,
    select,
    interval: cssMs("--showcase-advance"),
    watch: root,
    initial: current,
    reducedMotion,
  });

  // The indicator is placed without a transition the first time, and again when sizes change.
  select(current);
  window.requestAnimationFrame(() => list.classList.add("is-ready"));
  const resize = new ResizeObserver(placeIndicator);
  resize.observe(list);
  for (const tab of tabs) resize.observe(tab);
}
