// Number formatting shared by the build-time page and the browser count-up. No dependencies.

/** Integers up to 999, then one decimal with a "k" suffix (1.2k). */
export function formatCount(value: number): string {
  if (!Number.isFinite(value) || value < 0) {
    throw new RangeError(`formatCount expects a non-negative finite number, got ${value}`);
  }
  const whole = Math.floor(value);
  if (whole <= 999) return String(whole);
  const thousands = Math.floor(whole / 100) / 10;
  if (thousands >= 1000) return `${Math.floor(thousands / 1000)}M`;
  return `${thousands.toFixed(1).replace(/\.0$/, "")}k`;
}
