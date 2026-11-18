// Reads motion tokens from CSS custom properties, so durations live only in CSS.
const root = document.documentElement;

/** A time token ("900ms", "0.9s") in milliseconds. */
export function cssMs(name: string): number {
  const raw = getComputedStyle(root).getPropertyValue(name).trim();
  const value = Number.parseFloat(raw);
  if (Number.isNaN(value)) throw new Error(`Missing CSS token ${name}`);
  return raw.endsWith("ms") ? value : value * 1000;
}

/**
 * Runs `start` once the stylesheets are applied. Some engines (WebKit on an uncached load) run module
 * scripts before the CSS is in, so tokens read as empty: probe a sentinel token and, if it is not there
 * yet, wait for the window `load` event, which fires after the stylesheets have been applied.
 */
export function whenStylesReady(start: () => void): void {
  const ready = getComputedStyle(root).getPropertyValue("--web-duration-intro").trim() !== "";
  if (ready || document.readyState === "complete") {
    start();
    return;
  }
  window.addEventListener("load", start, { once: true });
}
