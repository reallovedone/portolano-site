// "Shared folders" scene. The SVG (SharingDiagram.astro) is complete in the HTML; this module hides
// its four parts when it starts and `go(i)` brings parts 0..i in, or takes the later ones out.
//   0 publish    folder fades in, a line traces to the file card (seal, fingerprint)
//   1 places     four lines fan out from the file to the place nodes
//   2 subscribe  routes trace to the three people, then dots travel them on a loop
//   3 filter     a dashed boundary appears, three packets travel to it, stop and fade (struck)
// Only opacity, transform and stroke-dashoffset are animated. Durations, easing and distances come from
// CSS tokens (web.css and the :root block of SharingDiagram.astro).
import type { SceneFactory } from "./types";
import { cssMs } from "../motion/css";
import { dotOpacity, parseBezier, type Bezier } from "./sharing-pure";

type Live = { stop(): void; finished: Promise<unknown> };
type PartState = "hidden" | "partial" | "shown";

interface Part {
  /** Fade in with a small rise. */
  rise: SVGElement[];
  /** Fade in without moving. */
  flat: SVGElement[];
  /** Dash-traced paths (`pathLength="1"`). */
  trace: SVGElement[];
}

const PART_NAMES = ["publish", "places", "subscribe", "filter"] as const;
const STYLE_PROPS = ["opacity", "transform", "stroke-dasharray", "stroke-dashoffset", "vector-effect", "stroke-width"];

function token(name: string): string {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  if (raw === "") throw new Error(`Missing CSS token ${name}`);
  return raw;
}

function tokenNumber(name: string): number {
  const value = Number.parseFloat(token(name));
  if (Number.isNaN(value)) throw new Error(`Invalid CSS token ${name}`);
  return value;
}

function tokenBezier(name: string): Bezier {
  const bezier = parseBezier(token(name));
  if (!bezier) throw new Error(`Invalid easing token ${name}`);
  return bezier;
}

const factory: SceneFactory = ({ root, stage, motion }) => {
  const { animate, stagger } = motion;
  const seconds = (name: string): number => cssMs(name) / 1000;

  const ease = tokenBezier("--ease-out");
  const reveal = seconds("--web-duration-reveal");
  const trace = seconds("--web-duration-trace");
  const micro = seconds("--web-duration-fade");
  const gap = seconds("--sharing-stagger");
  const travel = seconds("--sharing-travel-dur");
  const pause = seconds("--sharing-loop-pause");
  const rise = tokenNumber("--sharing-rise");
  const restOpacity = tokenNumber("--sharing-blocked-opacity");
  const hiddenShift = `translateY(${rise}px)`;

  const all = (selector: string, scope: ParentNode = stage): SVGElement[] =>
    Array.from(scope.querySelectorAll<SVGElement>(selector));

  const partRoots = PART_NAMES.map((name) => {
    const el = stage.querySelector<SVGElement>(`[data-part="${name}"]`);
    if (!el) throw new Error(`Sharing diagram part missing: ${name}`);
    return el;
  });
  const parts: Part[] = partRoots.map((el) => ({
    rise: all("[data-fade]:not([data-fade='flat'])", el),
    flat: all("[data-fade='flat']", el),
    trace: all("[data-trace]", el),
  }));
  const filterRoot = partRoots[3];
  const boundary = all(".boundary", filterRoot);
  const marks = all(".mark", filterRoot);
  const chips = all("[data-chip]", filterRoot);
  const routes = all("[data-route]") as unknown as SVGPathElement[];
  const dots = all("[data-dot]");
  const dropOf = (chip: SVGElement): number => Number.parseFloat(chip.getAttribute("data-drop") ?? "0");

  // Initial hidden state: parts are out until `go` brings them in.
  parts.forEach((part) => {
    part.rise.forEach((el) => {
      el.style.opacity = "0";
      el.style.transform = hiddenShift;
    });
    part.flat.forEach((el) => {
      el.style.opacity = "0";
    });
    part.trace.forEach((el) => {
      el.style.vectorEffect = "none";
      el.style.strokeDasharray = "1 2";
      el.style.strokeDashoffset = "1";
    });
  });
  chips.forEach((chip) => {
    chip.style.opacity = "0";
    chip.style.transform = `translateY(${-dropOf(chip)}px)`;
  });

  // Chrome measures dashes of a non-scaling stroke in screen units, so `pathLength="1"` tracing would
  // not hide anything. Traced paths therefore use a plain stroke with a width compensated for the
  // SVG scale (1 screen pixel), refreshed whenever the stage is resized.
  const traced = parts.flatMap((part) => part.trace);
  const applyStrokeWidth = (): void => {
    const scale = stage.getScreenCTM()?.a ?? 1;
    const width = scale > 0 ? 1 / scale : 1;
    traced.forEach((el) => {
      el.style.strokeWidth = `${width}px`;
    });
  };
  applyStrokeWidth();
  const resizeObserver = new ResizeObserver(applyStrokeWidth);
  resizeObserver.observe(stage);

  const state: PartState[] = PART_NAMES.map(() => "hidden");
  let epoch = 0;
  let live: Live[] = [];
  let dotLoops: Live[] = [];
  let onScreen = false;
  let destroyed = false;

  const track = <T extends Live>(controls: T): T => {
    live.push(controls);
    return controls;
  };
  const settle = (...controls: Live[]): Promise<void> =>
    Promise.all(controls.map((c) => c.finished)).then(
      () => undefined,
      () => undefined,
    );
  const stopLive = (): void => {
    live.forEach((controls) => controls.stop());
    live = [];
  };

  const riseIn = (els: SVGElement[], delay = 0): Live =>
    track(
      animate(
        els,
        { opacity: 1, transform: "translateY(0px)" },
        { duration: reveal, ease, delay: stagger(gap, { startDelay: delay }) },
      ),
    );
  const fadeIn = (els: SVGElement[], duration: number, delay = 0): Live =>
    track(animate(els, { opacity: 1 }, { duration, ease, delay: stagger(gap, { startDelay: delay }) }));
  const traceIn = (els: SVGElement[], delay = 0): Live =>
    track(animate(els, { strokeDashoffset: 0 }, { duration: trace, ease, delay: stagger(gap, { startDelay: delay }) }));

  // Dots: loop only while the subscribe part is in, the section is on screen and the tab is visible.
  const stopDots = (): void => {
    dotLoops.forEach((controls) => controls.stop());
    dotLoops = [];
    dots.forEach((dot) => {
      dot.style.opacity = "0";
    });
  };
  const startDots = (): void => {
    if (dotLoops.length > 0) return;
    dotLoops = routes.map((route, i) => {
      const length = route.getTotalLength();
      const dot = dots[i];
      return animate(0, 1, {
        duration: travel,
        ease,
        delay: (travel * i) / routes.length,
        repeat: Infinity,
        repeatDelay: pause,
        onUpdate: (v: number) => {
          const point = route.getPointAtLength(v * length);
          dot.style.transform = `translate(${point.x}px, ${point.y}px)`;
          dot.style.opacity = String(dotOpacity(v));
        },
      });
    });
  };
  const syncDots = (): void => {
    const want = !destroyed && state[2] === "shown" && onScreen && !document.hidden;
    if (want) startDots();
    else stopDots();
  };

  // Each part finishes within about 1.4 s of its own start and does not wait for the previous one, so
  // the autoplay (a part every 1.4 s) and a jump straight to the last step both end up complete.
  async function show(index: number, current: number, offset: number): Promise<void> {
    state[index] = "partial";
    const part = parts[index];
    if (index === 0) {
      const [folder, file] = part.rise;
      await settle(
        riseIn([folder], offset),
        traceIn(part.trace, offset + reveal * 0.4),
        riseIn([file], offset + reveal * 0.4 + trace * 0.4),
      );
    } else if (index === 1 || index === 2) {
      await settle(traceIn(part.trace, offset), riseIn(part.rise, offset + trace * 0.4));
    } else {
      const start = offset + micro;
      await settle(
        fadeIn(boundary, reveal, offset),
        track(animate(chips, { transform: "translateY(0px)" }, { duration: trace, ease, delay: stagger(gap, { startDelay: start }) })),
        track(
          animate(
            chips,
            { opacity: [0, 1, restOpacity] },
            { duration: trace, ease, times: [0, 0.15, 1], delay: stagger(gap, { startDelay: start }) },
          ),
        ),
        fadeIn(marks, micro, offset + trace * 0.8),
      );
    }
    if (current !== epoch) return;
    state[index] = "shown";
    if (index === 2) syncDots();
  }

  async function hide(index: number, current: number): Promise<void> {
    state[index] = "partial";
    if (index === 2) stopDots();
    const part = parts[index];
    const controls: Live[] = [];
    const out = { duration: micro, ease };
    if (part.rise.length > 0) controls.push(animate(part.rise, { opacity: 0, transform: hiddenShift }, out));
    const fading = index === 3 ? [...boundary, ...marks] : part.flat;
    if (fading.length > 0) controls.push(animate(fading, { opacity: 0 }, out));
    if (part.trace.length > 0) controls.push(animate(part.trace, { strokeDashoffset: 1 }, out));
    if (index === 3) {
      chips.forEach((chip) => {
        controls.push(animate(chip, { opacity: 0, transform: `translateY(${-dropOf(chip)}px)` }, out));
      });
    }
    controls.forEach(track);
    await settle(...controls);
    if (current === epoch) state[index] = "hidden";
  }

  const onVisibility = (): void => syncDots();
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) onScreen = entry.isIntersecting;
    syncDots();
  });
  observer.observe(root);
  document.addEventListener("visibilitychange", onVisibility);

  return {
    go(index) {
      if (destroyed) return;
      const target = Math.min(Math.max(Math.trunc(index), 0), parts.length - 1);
      epoch += 1;
      const current = epoch;
      stopLive();
      for (let i = parts.length - 1; i > target; i -= 1) {
        if (state[i] !== "hidden") void hide(i, current);
      }
      applyStrokeWidth();
      let offset = 0;
      for (let i = 0; i <= target; i += 1) {
        if (state[i] === "shown") continue;
        void show(i, current, offset);
        offset += micro;
      }
      syncDots();
    },
    destroy() {
      destroyed = true;
      epoch += 1;
      stopLive();
      stopDots();
      observer.disconnect();
      resizeObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      // Back to the markup's own (final) state.
      stage.querySelectorAll<SVGElement>("*").forEach((el) => {
        STYLE_PROPS.forEach((prop) => el.style.removeProperty(prop));
      });
    },
  };
};

export default factory;
