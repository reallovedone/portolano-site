// Scroll hand-off: the site rose shrinks and moves down until it coincides with the rose drawn in the
// welcome screenshot, then fades out. One scroll listener, one requestAnimationFrame per scroll burst.
// Below the desktop breakpoint, or when the alignment cannot be trusted, the rose simply fades.
import { cssNumber } from "../css";

// The rose in the 1280x800 welcome screenshot (app window at 2x): centre and size as fractions of the
// image, measured on welcome-{light,dark}.png. The app draws its rose 1000 CSS px wide.
const TARGET_X = 779.5 / 1280;
const TARGET_Y = 407.5 / 800;
const TARGET_SIZE = 1000 / 1280;
const VIEWBOX = 1000;
const DESKTOP = "(min-width: 1024px)";
const MIN_TRAVEL = 120;
const FALLBACK_SPAN = 0.6;

export interface Morph {
  /** Measure the layout again (after the load choreography, or when fonts change the page). */
  remeasure(): void;
  destroy(): void;
}

interface Hooks {
  /** Rotation to hold while the rose travels, or null to let it turn freely. */
  hold(degrees: number | null): void;
  angle(): number;
  /** Whether the rose is still visible at all. */
  shown(visible: boolean): void;
}

const clamp01 = (value: number): number => Math.min(1, Math.max(0, value));

export function createMorph(hero: HTMLElement, box: HTMLElement, svg: SVGElement, hooks: Hooks, signal: AbortSignal): Morph {
  const fade = cssNumber("--hero-morph-fade");
  const desktop = window.matchMedia(DESKTOP);

  let clean = false;
  let heroTop = 0;
  let travel = 1;
  let dx = 0;
  let endScale = 1;
  let baseSize = 1;
  let ticking = false;
  let lastP = -1;
  let lastOpacity = -1;
  let lastU = -1;
  let from = 0;

  const setUnit = (scale: number): void => {
    const u = VIEWBOX / (baseSize * scale);
    if (Math.abs(u - lastU) < 0.03) return;
    lastU = u;
    svg.style.setProperty("--hero-u", `${u.toFixed(3)}px`);
  };

  const measure = (): void => {
    const screen = hero.querySelector<HTMLElement>("[data-hero-window] .screen");
    const heroRect = hero.getBoundingClientRect();
    heroTop = heroRect.top + window.scrollY;
    baseSize = box.offsetWidth;
    lastU = -1;
    clean = false;
    if (screen && desktop.matches && baseSize > 0) {
      const rect = screen.getBoundingClientRect();
      const targetX = rect.left - heroRect.left + TARGET_X * rect.width;
      const targetY = rect.top - heroRect.top + TARGET_Y * rect.height;
      travel = targetY - box.offsetTop;
      dx = targetX - box.offsetLeft;
      endScale = (TARGET_SIZE * rect.width) / baseSize;
      clean = rect.width > 0 && travel >= MIN_TRAVEL;
    }
    lastP = -1;
    lastOpacity = -1;
    frame();
  };

  const frame = (): void => {
    ticking = false;
    const y = window.scrollY - heroTop;
    const p = clean ? clamp01(y / travel) : 0;
    const opacity = clean ? clamp01((1 - p) / fade) : clamp01(1 - y / (window.innerHeight * FALLBACK_SPAN));
    if (p !== lastP) {
      if (p > 0 && lastP <= 0) from = hooks.angle() > 180 ? hooks.angle() - 360 : hooks.angle();
      const scale = 1 + (endScale - 1) * p;
      box.style.transform = p === 0 ? "" : `translate(${(dx * p).toFixed(2)}px, ${(travel * p).toFixed(2)}px) scale(${scale.toFixed(4)})`;
      if (p > 0) hooks.hold(from * (1 - p));
      else if (lastP > 0) hooks.hold(null);
      setUnit(p === 0 ? 1 : scale);
      // Discrete stacking switch: above the window as soon as the hand-off starts (clean desktop path only).
      if (p > 0) hero.setAttribute("data-handoff", "");
      else hero.removeAttribute("data-handoff");
      lastP = p;
    }
    if (opacity !== lastOpacity) {
      box.style.opacity = opacity === 1 ? "" : opacity.toFixed(3);
      box.style.visibility = opacity === 0 ? "hidden" : "";
      hooks.shown(opacity > 0);
      lastOpacity = opacity;
    }
  };

  const request = (): void => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(frame);
    }
  };

  window.addEventListener("scroll", request, { passive: true, signal });
  const observer = new ResizeObserver(() => measure());
  observer.observe(hero);
  desktop.addEventListener("change", measure, { signal });
  signal.addEventListener("abort", () => {
    observer.disconnect();
    box.style.transform = "";
    box.style.opacity = "";
    box.style.visibility = "";
    svg.style.removeProperty("--hero-u");
    hero.removeAttribute("data-handoff");
  });
  setUnit(1);
  measure();

  return {
    remeasure: measure,
    destroy() {
      observer.disconnect();
    },
  };
}
