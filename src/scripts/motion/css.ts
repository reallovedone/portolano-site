// Reads motion tokens from CSS custom properties, so durations live only in CSS.
const root = document.documentElement;

/** A time token ("900ms", "0.9s") in milliseconds. */
export function cssMs(name: string): number {
  const raw = getComputedStyle(root).getPropertyValue(name).trim();
  const value = Number.parseFloat(raw);
  if (Number.isNaN(value)) throw new Error(`Missing CSS token ${name}`);
  return raw.endsWith("ms") ? value : value * 1000;
}
