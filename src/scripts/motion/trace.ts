// One-off tracing of drawings when they enter view: the pilot sheet (4.3) and the download
// section's corner rose (4.4). The animation itself is CSS (motion.css, PilotSheet.astro);
// this script only starts it.

/** Adds `is-writing` to the pilot sheet when at least half of it is in view. */
export function initPilotSheet(): void {
  const sheets = document.querySelectorAll<HTMLElement>("[data-pilot]");
  if (sheets.length === 0) return;
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("is-writing");
        observer.unobserve(entry.target);
      }
    },
    { threshold: 0.5 },
  );
  for (const el of sheets) observer.observe(el);
}

/**
 * Traces the corner rose once. Dashes do not work with non-scaling strokes in Chromium, so while
 * tracing the strokes are a screen pixel wide in user units (--trace-u) and, once everything has
 * finished, the static hairline style takes over again (`is-done`).
 */
export function initCornerRose(): void {
  const roses = document.querySelectorAll<HTMLElement>("[data-trace]");

  for (const rose of roses) {
    const svg = rose.querySelector<SVGSVGElement>("svg");
    if (!svg) continue;
    const pieces = svg.querySelectorAll(".net, .ring, .wind, .node").length;
    let finished = 0;
    svg.addEventListener("animationend", () => {
      finished += 1;
      if (finished >= pieces) rose.classList.add("is-done");
    });

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          observer.disconnect();
          const width = svg.getBoundingClientRect().width;
          const viewBox = svg.viewBox.baseVal;
          if (width > 0 && viewBox.width > 0) {
            svg.style.setProperty("--trace-u", `${viewBox.width / width}px`);
          }
          rose.classList.add("is-tracing");
        }
      },
      // The visible part of the rose is a fraction of its (much larger) box.
      { threshold: 0.04 },
    );
    observer.observe(svg);
  }
}
