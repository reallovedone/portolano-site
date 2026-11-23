// Spotlight scenes entry point. Reduced motion: nothing runs, the diagrams stay complete. Otherwise
// `spotlight-ready` goes on <html> (hidden/dimmed states live in spotlight.css under it) and each
// [data-spotlight] section loads its scene and `motion` lazily when it nears the viewport. From 1024px
// the scene follows the scroll through the steps column; below, it plays the steps once on its own.
// When a section fails, `spotlight-off` on it switches its pre-animation states off.
import { whenStylesReady, cssMs } from "../motion/css";
import { stepAt } from "./pure";
import type { MotionApi, Scene, SceneFactory } from "./types";

const SCENES: Record<string, () => Promise<{ default: SceneFactory }>> = {
  sharing: () => import("./sharing"),
  vault: () => import("./vault"),
};

const WIDE = "(min-width: 1024px)";

function fail(root: HTMLElement, name: string, error: unknown): void {
  root.classList.add("spotlight-off");
  root.querySelectorAll<HTMLElement>("[data-step]").forEach((step) => step.removeAttribute("data-active"));
  console.error(`Spotlight disabled: ${name}`, error);
}

function setActive(steps: HTMLElement[], upTo: number, onlyThis: boolean): void {
  steps.forEach((step, i) => {
    const on = onlyThis ? i === upTo : i <= upTo;
    if (on) step.setAttribute("data-active", "");
    else step.removeAttribute("data-active");
  });
}

/** Runs `scene` for one section in whichever layout is current, restarting when the breakpoint changes. */
function drive(root: HTMLElement, steps: HTMLElement[], scene: Scene, motion: MotionApi, name: string): void {
  const list = root.querySelector<HTMLElement>(".steps");
  const figure = root.querySelector<HTMLElement>(".stage");
  if (!list || !figure) throw new Error("Spotlight markup is incomplete");
  const target: HTMLElement = list;
  const watched: HTMLElement = figure;

  const query = window.matchMedia(WIDE);
  let stopMode: () => void = () => {};
  let broken = false;

  const safeGo = (index: number): void => {
    if (broken) return;
    try {
      scene.go(index);
    } catch (error) {
      broken = true;
      stopMode();
      try {
        scene.destroy();
      } catch {
        // The scene is already broken; the section is switched off below.
      }
      fail(root, name, error);
    }
  };

  // Calls `onChange(visible)` whenever the stage crosses into or out of view.
  const watchStage = (onChange: (visible: boolean) => void): (() => void) => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) onChange(entry.isIntersecting);
      },
      { threshold: 0.35 },
    );
    io.observe(watched);
    return () => io.disconnect();
  };

  function startWide(): () => void {
    let progress = 0;
    let visible = false;
    let current = -1;
    const update = (): void => {
      if (!visible) return;
      const index = stepAt(progress, steps.length);
      if (index === current) return;
      current = index;
      setActive(steps, index, true);
      safeGo(index);
    };
    const stopWatch = watchStage((v) => {
      visible = v;
      update();
    });
    const stopScroll = motion.scroll(
      (p: number) => {
        progress = p;
        update();
      },
      { target, offset: ["start center", "end center"] },
    );
    return () => {
      stopWatch();
      stopScroll();
    };
  }

  function startNarrow(): () => void {
    const gap = cssMs("--spotlight-autoplay-step");
    const timers: number[] = [];
    let started = false;
    const stopWatch = watchStage((visible) => {
      if (!visible || started) return;
      started = true;
      stopWatch();
      steps.forEach((_, i) => {
        timers.push(
          window.setTimeout(() => {
            setActive(steps, i, false);
            safeGo(i);
          }, i * gap),
        );
      });
    });
    return () => {
      stopWatch();
      timers.forEach((id) => window.clearTimeout(id));
    };
  }

  const start = (): void => {
    stopMode();
    steps.forEach((step) => step.removeAttribute("data-active"));
    stopMode = query.matches ? startWide() : startNarrow();
  };

  query.addEventListener("change", start);
  start();
}

function load(root: HTMLElement): void {
  const name = root.dataset.spotlight ?? "";
  const scenes = SCENES[name];
  const stage = root.querySelector<SVGSVGElement>(".stage svg");
  const steps = Array.from(root.querySelectorAll<HTMLElement>("[data-step]"));
  if (!scenes || !stage || steps.length === 0) {
    fail(root, name, new Error("Unknown scene or missing markup"));
    return;
  }
  Promise.all([scenes(), import("./motion-api")])
    .then(([module, motion]) => {
      const scene = module.default({ root, stage, motion, stepCount: steps.length });
      drive(root, steps, scene, motion, name);
    })
    .catch((error: unknown) => fail(root, name, error));
}

function run(): void {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-spotlight]"));
  if (sections.length === 0) return;

  document.documentElement.classList.add("spotlight-ready");
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        io.unobserve(entry.target);
        load(entry.target as HTMLElement);
      }
    },
    { rootMargin: "50% 0px" },
  );
  sections.forEach((section) => io.observe(section));
}

whenStylesReady(run);
