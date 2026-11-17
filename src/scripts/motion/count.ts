// Count-up of the GitHub band numbers (plan 4.4). The final value is already in the HTML; the
// count only replays it from 0 when the number enters view. Not used with reduced motion.
import { cssMs } from "./css";
import { countAt, formatCount } from "./pure";

export function initCountUp(): void {
  const duration = cssMs("--motion-count");

  const run = (el: HTMLElement, target: number): void => {
    const start = performance.now();
    el.textContent = formatCount(0);
    const tick = (now: number): void => {
      const value = countAt(target, now - start, duration);
      el.textContent = formatCount(value);
      if (now - start < duration) window.requestAnimationFrame(tick);
    };
    window.requestAnimationFrame(tick);
  };

  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      observer.unobserve(entry.target);
      const el = entry.target as HTMLElement;
      const target = Number(el.dataset.count);
      if (Number.isFinite(target) && target >= 0) run(el, target);
    }
  });

  for (const el of document.querySelectorAll<HTMLElement>("[data-count]")) observer.observe(el);
}
