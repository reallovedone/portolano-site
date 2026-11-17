// Reads animation tokens from CSS custom properties, so durations and sizes live only in hero.css.
const root = document.documentElement;

const read = (name: string): string => getComputedStyle(root).getPropertyValue(name).trim();

/** A time token ("900ms", "240s") in milliseconds. */
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
