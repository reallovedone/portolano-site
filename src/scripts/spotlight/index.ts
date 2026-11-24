// Spotlight scenes. Each [data-spotlight] section ships a plain ordered list of steps; here it becomes
// a tablist (vertical from 1024px, a row of number-only tabs below), and the section gets `data-step`
// (0..n-1) on every change, which is all the diagrams' CSS reacts to. When the diagram comes into
// view it builds up in one flowing pass and stays complete; the tabs are then there to read
// the steps one at a time. Reduced motion: nothing runs, the list and the complete diagram stay.
import { startAutotabs } from "../motion/autotabs";
import { whenStylesReady } from "../css";

const WIDE = window.matchMedia("(min-width: 1024px)");
// `data-step` before the diagram has built up (or after it left the screen): nothing reached yet.
const WAITING = "-1";
// Share of the diagram that must be on screen before it builds up.
const VISIBLE_RATIO = 0.4;

function el<K extends keyof HTMLElementTagNameMap>(tag: K, className: string): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  node.className = className;
  return node;
}

function enhance(root: HTMLElement): void {
  const ol = root.querySelector<HTMLElement>(".steps");
  const panels = Array.from(root.querySelectorAll<HTMLElement>(".step"));
  const labelledBy = root.getAttribute("aria-labelledby");
  if (!ol || panels.length === 0 || !labelledBy) return;

  const name = root.id;
  const list = el("div", "tabs");
  list.setAttribute("role", "tablist");
  list.setAttribute("aria-labelledby", labelledBy);
  ol.setAttribute("role", "presentation");

  const tabs = panels.map((panel, i) => {
    const tab = el("button", "tab");
    tab.type = "button";
    tab.id = `${name}-tab-${i}`;
    tab.setAttribute("role", "tab");
    tab.setAttribute("aria-controls", `${name}-panel-${i}`);
    const num = el("span", "num");
    num.textContent = String(i + 1).padStart(2, "0");
    const label = el("span", "name");
    label.textContent = panel.querySelector("h3")?.textContent ?? "";
    const bar = el("span", "bar");
    bar.setAttribute("aria-hidden", "true");
    tab.append(num, label, bar);
    list.append(tab);
    panel.id = `${name}-panel-${i}`;
    panel.setAttribute("role", "tabpanel");
    panel.setAttribute("aria-labelledby", tab.id);
    return tab;
  });
  ol.before(list);

  const orient = (): void => list.setAttribute("aria-orientation", WIDE.matches ? "vertical" : "horizontal");
  orient();
  WIDE.addEventListener("change", orient);

  const select = (index: number): void => {
    tabs.forEach((tab, i) => {
      const active = i === index;
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
      panels[i].hidden = !active;
      if (active) panels[i].setAttribute("tabindex", "0");
      else panels[i].removeAttribute("tabindex");
    });
    root.dataset.step = String(index);
  };

  const stage = root.querySelector(".spotlight-stage") ?? root;
  let touched = false;
  let parked = true;
  // Waiting state: everything dimmed until the diagram is well in view.
  const park = (): void => {
    parked = true;
    delete root.dataset.entry;
    root.dataset.step = WAITING;
  };
  // Entry: straight to the last step; with `data-entry` the CSS starts each step's parts a beat
  // after the previous step's, so the diagram builds up in one flowing pass. The attribute stays
  // until the reader picks a step (or the scene leaves), so running one-shots are never retimed.
  const build = (): void => {
    parked = false;
    root.dataset.entry = "";
    select(panels.length - 1);
  };
  select(0);
  park();
  root.dataset.spotlightMode = "tabs";

  startAutotabs({ list, tabs, select, axis: "both" });

  // The reader's choice wins: after a click, key or focus in the tabs, the scene is left alone.
  // Capture phase: the entry delays are gone before the tab's own handler changes the step.
  const settle = (): void => {
    touched = true;
    delete root.dataset.entry;
  };
  for (const type of ["click", "keydown", "focusin"]) list.addEventListener(type, settle, true);

  // It builds up again each time it comes back after leaving the screen completely.
  new IntersectionObserver(
    (entries) => {
      if (touched) return;
      const entry = entries[entries.length - 1];
      if (!entry.isIntersecting) {
        if (!parked) park();
      } else if (parked && entry.intersectionRatio >= VISIBLE_RATIO) {
        build();
      }
    },
    { threshold: [0, VISIBLE_RATIO] },
  ).observe(stage);
}

function run(): void {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  document.querySelectorAll<HTMLElement>("[data-spotlight]").forEach(enhance);
}

whenStylesReady(run);
