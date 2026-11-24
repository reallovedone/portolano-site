// Continuous state of the rose: slow rotation with upright labels, routes, pointer highlight.
import { cssMs, cssNumber, cssValue } from "../css";

const POINTS = 16;
const RADIUS = 420;
const VIEWBOX = 1000;

export interface Rose {
  /** Whether the continuous animations should be running (tab visible, hero on screen, rose shown). */
  setActive(active: boolean): void;
  /** Current rotation in degrees, 0-360. */
  angle(): number;
  /** Hold the rotation at a given angle (used by the scroll hand-off) or release it with null. */
  hold(degrees: number | null): void;
  destroy(): void;
}

export function createRose(hero: HTMLElement, box: HTMLElement, signal: AbortSignal): Rose | null {
  const spinEl = box.querySelector<HTMLElement>("[data-spin]");
  const dot = box.querySelector<SVGCircleElement>("[data-dot]");
  const labels = Array.from(box.querySelectorAll<SVGTextElement>("[data-bearing]"));
  const routes = Array.from(box.querySelectorAll<SVGPathElement>("[data-route]"));
  const nodes = Array.from(box.querySelectorAll<SVGCircleElement>("[data-node]"));
  const spokes = Array.from(box.querySelectorAll<SVGPathElement>("[data-spoke]"));
  if (!spinEl || !dot || nodes.length !== POINTS || spokes.length !== POINTS) return null;

  const period = cssMs("--hero-spin-period");
  const travel = cssMs("--hero-route-travel");
  const lit = cssMs("--hero-route-lit");
  const routeMin = cssMs("--hero-route-min");
  const routeMax = cssMs("--hero-route-max");
  const maxActive = cssNumber("--hero-route-max-active");
  const intro = cssMs("--web-duration-intro");
  const easing = cssValue("--ease-out");

  // Rotation: the rose turns, every label turns the opposite way around its own centre.
  const turn = (el: Element, sign: 1 | -1): Animation =>
    el.animate({ transform: ["rotate(0deg)", `rotate(${360 * sign}deg)`] }, { duration: period, iterations: Infinity });
  const spinners = [turn(spinEl, 1), ...labels.map((label) => turn(label, -1))];
  spinners.forEach((a) => a.pause());

  let active = false;
  let held = false;
  const angle = (): number => (((Number(spinners[0].currentTime) % period) + period) % period) / period * 360;

  // Routes: a dot travels from the centre to a port, the line lights up, the label takes its colour.
  const live = new Set<Animation>();
  const timers = new Set<number>();

  const later = (fn: () => void, ms: number): void => {
    const id = window.setTimeout(() => {
      timers.delete(id);
      fn();
    }, ms);
    timers.add(id);
  };

  const fire = (): void => {
    if (live.size >= maxActive) return;
    const k = Math.floor(Math.random() * routes.length);
    const route = routes[k];
    const label = labels.find((l) => l.dataset.bearing === route.dataset.route);
    const node = nodes[Number(route.dataset.route)];
    const port = route.dataset.port ?? "";
    dot.dataset.port = port;
    const x = node.cx.baseVal.value;
    const y = node.cy.baseVal.value;
    const line = route.animate(
      [
        { strokeDashoffset: 1, opacity: 1, easing },
        { strokeDashoffset: 0, opacity: 1, easing: "linear", offset: travel / lit },
        { strokeDashoffset: 0, opacity: 0 },
      ],
      { duration: lit },
    );
    const mover = dot.animate(
      [{ transform: "translate(0px, 0px)", opacity: 1 }, { transform: `translate(${x}px, ${y}px)`, opacity: 1 }],
      { duration: travel, easing },
    );
    live.add(line);
    live.add(mover);
    if (label) {
      later(() => label.classList.add("lit"), travel);
      later(() => label.classList.remove("lit"), travel + lit);
    }
    const done = (a: Animation): void => {
      live.delete(a);
    };
    line.finished.then(() => done(line), () => done(line));
    mover.finished.then(() => done(mover), () => done(mover));
  };

  const schedule = (delay: number): void => {
    later(() => {
      fire();
      schedule(routeMin + Math.random() * (routeMax - routeMin));
    }, delay);
  };

  const stopRoutes = (): void => {
    timers.forEach((id) => window.clearTimeout(id));
    timers.clear();
    live.forEach((a) => a.cancel());
    live.clear();
    labels.forEach((l) => l.classList.remove("lit"));
  };

  // Pointer: the circle point nearest the cursor lights up with its lines.
  let litIndex = -1;
  const light = (index: number): void => {
    if (index === litIndex) return;
    if (litIndex >= 0) {
      nodes[litIndex].classList.remove("lit");
      spokes[litIndex].classList.remove("lit");
    }
    litIndex = index;
    if (index >= 0) {
      nodes[index].classList.add("lit");
      spokes[index].classList.add("lit");
    }
  };

  let pointer: { x: number; y: number } | null = null;
  let pointerFrame = 0;
  const track = (): void => {
    pointerFrame = 0;
    if (!pointer || !active) return light(-1);
    const rect = box.getBoundingClientRect();
    const k = rect.width / VIEWBOX;
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const theta = (angle() * Math.PI) / 180;
    const cos = Math.cos(theta);
    const sin = Math.sin(theta);
    let best = -1;
    let bestDistance = Infinity;
    for (let i = 0; i < POINTS; i += 1) {
      const a = (i / POINTS) * Math.PI * 2 - Math.PI / 2;
      const x = Math.cos(a) * RADIUS;
      const y = Math.sin(a) * RADIUS;
      const dx = cx + k * (x * cos - y * sin) - pointer.x;
      const dy = cy + k * (x * sin + y * cos) - pointer.y;
      const d = dx * dx + dy * dy;
      if (d < bestDistance) {
        bestDistance = d;
        best = i;
      }
    }
    light(best);
  };
  const requestTrack = (): void => {
    if (!pointerFrame) pointerFrame = requestAnimationFrame(track);
  };

  if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    hero.addEventListener(
      "pointermove",
      (event) => {
        pointer = { x: event.clientX, y: event.clientY };
        requestTrack();
      },
      { passive: true, signal },
    );
    hero.addEventListener(
      "pointerleave",
      () => {
        pointer = null;
        requestTrack();
      },
      { passive: true, signal },
    );
  }

  const sync = (): void => {
    if (active && !held) spinners.forEach((a) => a.play());
    else spinners.forEach((a) => a.pause());
    if (active) {
      if (timers.size === 0) {
        schedule(Math.max(0, intro - performance.now()) + routeMin);
      }
    } else {
      stopRoutes();
      light(-1);
    }
  };

  return {
    setActive(next) {
      if (next === active) return;
      active = next;
      sync();
    },
    angle,
    hold(degrees) {
      if (degrees === null) {
        held = false;
      } else {
        held = true;
        const t = ((((degrees % 360) + 360) % 360) / 360) * period;
        spinners.forEach((a) => {
          a.currentTime = t;
        });
      }
      sync();
    },
    destroy() {
      stopRoutes();
      light(-1);
      spinners.forEach((a) => a.cancel());
    },
  };
}
