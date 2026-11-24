// Scroll reveal (plan 2.4): content rises 16 px and fades in, once, when it enters view.
// Hidden states live in motion.css under html.motion-ready, so the page is complete without JavaScript.
//
// Targets (keep in step with motion.css):
// - children of [data-reveal-children] (set by Section.astro and the GitHub band),
// - the children of the download section's .inner,
// - the children of [data-reveal-items], one by one, staggered.
import { cssMs } from "../css";
import { staggerDelay } from "./pure";

const SINGLES = "[data-reveal-children] > :not([data-reveal-items]), #download > .inner > *";
const GROUPS = "[data-reveal-items]";

export function initReveal(): void {
  const step = cssMs("--motion-stagger");

  const show = (el: Element): void => {
    if (el.matches(GROUPS)) {
      Array.from(el.children).forEach((child, i) => {
        if (child instanceof HTMLElement) child.style.setProperty("--reveal-delay", `${staggerDelay(i, step)}ms`);
        child.classList.add("is-in");
      });
    } else {
      el.classList.add("is-in");
    }
  };

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        // Content already scrolled past (page reloaded halfway down) is shown at once.
        if (!entry.isIntersecting && entry.boundingClientRect.top >= 0) continue;
        show(entry.target);
        observer.unobserve(entry.target);
      }
    },
    { rootMargin: "0px 0px -8% 0px" },
  );

  for (const el of document.querySelectorAll(`${SINGLES}, ${GROUPS}`)) observer.observe(el);
}
