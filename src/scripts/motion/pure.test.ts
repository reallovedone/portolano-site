import { describe, expect, it } from "vitest";

import { activeIndex, autoDelay, countAt, easeOutCubic, staggerDelay, tabForKey, travelled, wrapIndex } from "./pure";

describe("easeOutCubic", () => {
  it("runs from 0 to 1, decelerating, and clamps", () => {
    expect(easeOutCubic(0)).toBe(0);
    expect(easeOutCubic(1)).toBe(1);
    expect(easeOutCubic(0.5)).toBeGreaterThan(0.5);
    expect(easeOutCubic(-1)).toBe(0);
    expect(easeOutCubic(2)).toBe(1);
  });
});

describe("countAt", () => {
  it("starts at 0 and ends exactly on the target", () => {
    expect(countAt(120, 0, 900)).toBe(0);
    expect(countAt(120, 900, 900)).toBe(120);
    expect(countAt(120, 5000, 900)).toBe(120);
  });
  it("only ever shows integers and never overshoots", () => {
    let last = 0;
    for (let t = 0; t <= 900; t += 16) {
      const v = countAt(1234, t, 900);
      expect(Number.isInteger(v)).toBe(true);
      expect(v).toBeGreaterThanOrEqual(last);
      expect(v).toBeLessThanOrEqual(1234);
      last = v;
    }
  });
  it("handles a zero duration and a zero target", () => {
    expect(countAt(7, 0, 0)).toBe(7);
    expect(countAt(0, 300, 900)).toBe(0);
  });
});

describe("staggerDelay", () => {
  it("is the index times the step", () => {
    expect(staggerDelay(0, 60)).toBe(0);
    expect(staggerDelay(3, 60)).toBe(180);
    expect(staggerDelay(-2, 60)).toBe(0);
  });
});

describe("activeIndex", () => {
  const dots = [100, 900, 1800, 2600];
  it("picks the last dot at or above the probe", () => {
    expect(activeIndex(dots, 0)).toBe(0);
    expect(activeIndex(dots, 100)).toBe(0);
    expect(activeIndex(dots, 899)).toBe(0);
    expect(activeIndex(dots, 900)).toBe(1);
    expect(activeIndex(dots, 2000)).toBe(2);
    expect(activeIndex(dots, 99999)).toBe(3);
  });
  it("copes with an empty list", () => {
    expect(activeIndex([], 500)).toBe(0);
  });
});

describe("travelled", () => {
  it("is clamped between 0 and the line length", () => {
    expect(travelled(100, 600, 50)).toBe(0);
    expect(travelled(100, 600, 350)).toBe(250);
    expect(travelled(100, 600, 5000)).toBe(500);
    expect(travelled(100, 100, 5000)).toBe(0);
  });
});

describe("wrapIndex and tabForKey", () => {
  it("wraps in both directions", () => {
    expect(wrapIndex(3, 1, 4)).toBe(0);
    expect(wrapIndex(0, -1, 4)).toBe(3);
    expect(wrapIndex(1, 1, 4)).toBe(2);
    expect(wrapIndex(0, 1, 0)).toBe(0);
  });
  it("maps keys to tabs", () => {
    expect(tabForKey("ArrowRight", 3, 4)).toBe(0);
    expect(tabForKey("ArrowLeft", 0, 4)).toBe(3);
    expect(tabForKey("Home", 2, 4)).toBe(0);
    expect(tabForKey("End", 0, 4)).toBe(3);
    expect(tabForKey("Enter", 0, 4)).toBeNull();
    expect(tabForKey("ArrowDown", 0, 4)).toBeNull();
  });
});

describe("tabForKey axes", () => {
  it("handles up/down only for vertical and both axes", () => {
    expect(tabForKey("ArrowDown", 3, 4, "vertical")).toBe(0);
    expect(tabForKey("ArrowUp", 0, 4, "vertical")).toBe(3);
    expect(tabForKey("ArrowRight", 0, 4, "vertical")).toBeNull();
    expect(tabForKey("ArrowDown", 1, 4, "both")).toBe(2);
    expect(tabForKey("ArrowLeft", 1, 4, "both")).toBe(0);
    expect(tabForKey("Home", 2, 4, "vertical")).toBe(0);
    expect(tabForKey("End", 0, 4, "vertical")).toBe(3);
  });
});

describe("autoDelay", () => {
  it("uses the interval, and the longer hold on the last tab only", () => {
    expect(autoDelay(0, 4, 3500, 6000)).toBe(3500);
    expect(autoDelay(2, 4, 3500, 6000)).toBe(3500);
    expect(autoDelay(3, 4, 3500, 6000)).toBe(6000);
  });
  it("defaults to a constant interval", () => {
    expect(autoDelay(3, 4, 3500)).toBe(3500);
  });
});
