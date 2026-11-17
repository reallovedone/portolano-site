// Route line (plan 4.2): a thin vertical line in the left margin with one dot ("port") per section.
// The travelled part is drawn by scaling a second line (transform only); the dot of the active
// section is filled with the accent. Only measured and updated from 1280 px up.
import { requestFrame, subscribe } from "./frame";
import { activeIndex, travelled } from "./pure";

const WIDE = "(min-width: 1280px)";
/** Where in the viewport, from the top, the "current position" probe sits. */
const PROBE = 0.5;

type State = "ahead" | "past" | "active";

/** Document offset of an element, immune to transforms (reveal and hero animations). */
function docTop(el: HTMLElement): number {
  let top = 0;
  let node: HTMLElement | null = el;
  while (node) {
    top += node.offsetTop;
    node = node.offsetParent instanceof HTMLElement ? node.offsetParent : null;
  }
  return top;
}

/** Vertical centre of the first line of the section's heading. */
function portY(section: HTMLElement): number {
  const heading = section.querySelector<HTMLElement>("h1, h2");
  if (!heading) return docTop(section);
  const lineHeight = Number.parseFloat(getComputedStyle(heading).lineHeight);
  const half = Number.isFinite(lineHeight) ? lineHeight / 2 : heading.offsetHeight / 2;
  return docTop(heading) + half;
}

export function initRouteLine(): void {
  const root = document.querySelector<HTMLElement>("[data-route-line]");
  const fill = root?.querySelector<HTMLElement>("[data-route-fill]");
  const sections = Array.from(document.querySelectorAll<HTMLElement>("main > section"));
  if (!root || !fill || sections.length === 0) return;

  const dots = sections.map(() => {
    const dot = document.createElement("span");
    dot.className = "route-line__port";
    dot.dataset.state = "ahead";
    root.append(dot);
    return dot;
  });

  const wide = window.matchMedia(WIDE);
  let positions: number[] = [];
  let states: State[] = dots.map(() => "ahead");

  const measure = (): void => {
    positions = sections.map(portY);
    const start = positions[0];
    const end = positions[positions.length - 1];
    root.style.setProperty("--route-start", `${start}px`);
    root.style.setProperty("--route-length", `${end - start}px`);
    positions.forEach((y, i) => dots[i].style.setProperty("--route-y", `${y}px`));
    states = dots.map(() => "ahead");
  };

  const update = (): void => {
    if (!wide.matches || positions.length === 0) return;
    const probe = window.scrollY + window.innerHeight * PROBE;
    const start = positions[0];
    const length = positions[positions.length - 1] - start;
    const done = travelled(start, positions[positions.length - 1], probe);
    fill.style.transform = `scaleY(${length > 0 ? done / length : 0})`;

    const active = activeIndex(positions, probe);
    dots.forEach((dot, i) => {
      const next: State = i === active ? "active" : i < active ? "past" : "ahead";
      if (states[i] === next) return;
      states[i] = next;
      dot.dataset.state = next;
    });
  };

  const refresh = (): void => {
    if (!wide.matches) return;
    measure();
    update();
  };

  // Page height changes (images, fonts, window resize) move the sections.
  const resizeObserver = new ResizeObserver(refresh);
  const main = document.querySelector("main");
  if (main) resizeObserver.observe(main);
  wide.addEventListener("change", refresh);
  subscribe(update);
  refresh();
  requestFrame();
}
