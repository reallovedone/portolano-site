// Hero animation entry point (package S2). The load choreography is CSS; this script runs the
// continuous state (rotation, routes, pointer) and the scroll hand-off, and stops them when the tab is
// hidden, the hero is off screen or reduced motion is requested.
import { createMorph } from "./morph";
import { createRose } from "./rose";
import { cssMs } from "./css";
import { whenStylesReady } from "../motion/css";

function start(): void {
  const hero = document.querySelector<HTMLElement>("[data-hero]");
  const box = hero?.querySelector<HTMLElement>("[data-rose]");
  const svg = hero?.querySelector<SVGElement>("[data-rose-svg]");
  if (!hero || !box || !svg) return;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (reduced.matches) return;

  const abort = new AbortController();
  const { signal } = abort;
  const rose = createRose(hero, box, signal);
  if (!rose) return;
  // The animated rose styles (hairline strokes, trace, pop) apply only from here on, so a script that
  // never starts leaves the static drawing as it is.
  document.documentElement.classList.add("hero-ready");

  let onScreen = true;
  let tabVisible = !document.hidden;
  let shown = true;
  const update = (): void => rose.setActive(onScreen && tabVisible && shown);

  const observer = new IntersectionObserver((entries) => {
    onScreen = entries[entries.length - 1].isIntersecting;
    update();
  });
  observer.observe(hero);
  document.addEventListener("visibilitychange", () => {
    tabVisible = !document.hidden;
    update();
  }, { signal });

  const morph = createMorph(
    hero,
    box,
    svg,
    {
      hold: (degrees) => rose.hold(degrees),
      angle: () => rose.angle(),
      shown: (visible) => {
        shown = visible;
        update();
      },
    },
    signal,
  );

  // The window rises on load, so the geometry is measured again once the choreography has settled.
  const settle = window.setTimeout(() => morph.remeasure(), cssMs("--web-duration-intro") + 100);

  reduced.addEventListener(
    "change",
    () => {
      if (!reduced.matches) return;
      window.clearTimeout(settle);
      observer.disconnect();
      morph.destroy();
      abort.abort();
      rose.destroy();
    },
    { once: true },
  );
  update();
}

// Tokens are read from CSS, so start only once the stylesheets are applied.
whenStylesReady(() => {
  try {
    start();
  } catch (error) {
    // The page is complete without the animation: report and leave the static rose in place.
    document.documentElement.classList.remove("hero-ready");
    console.error("Hero animation disabled", error);
  }
});
