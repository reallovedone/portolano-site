// Reads animation tokens from CSS custom properties, so durations and sizes live only in CSS.
const root = document.documentElement;

const read = (name: string): string => getComputedStyle(root).getPropertyValue(name).trim();

/** A time token ("900ms", "0.9s") in milliseconds. */
export function cssMs(name: string): number {
  const raw = read(name);
  const value = Number.parseFloat(raw);
  if (Number.isNaN(value)) throw new Error(`Missing CSS token ${name}`);
  return raw.endsWith("ms") ? value : value * 1000;
}

/** A unitless or px token as a number. */
export function cssNumber(name: string): number {
  const value = Number.parseFloat(read(name));
  if (Number.isNaN(value)) throw new Error(`Missing CSS token ${name}`);
  return value;
}

export function cssValue(name: string): string {
  return read(name);
}

/**
 * Runs `start` once the stylesheets are applied. Some engines (WebKit on an uncached load) run module
 * scripts before the CSS is in, so tokens read as empty: probe a sentinel token and, if it is not there
 * yet, wait for the window `load` event, which fires after the stylesheets have been applied.
 */
export function whenStylesReady(start: () => void): void {
  const ready = read("--web-duration-intro") !== "";
  if (ready || document.readyState === "complete") {
    start();
    return;
  }
  window.addEventListener("load", start, { once: true });
}
