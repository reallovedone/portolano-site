import { describe, expect, it } from "vitest";

import { stepAt } from "./pure";

describe("stepAt", () => {
  it("splits the progress evenly across the steps", () => {
    expect(stepAt(0, 4)).toBe(0);
    expect(stepAt(0.24, 4)).toBe(0);
    expect(stepAt(0.25, 4)).toBe(1);
    expect(stepAt(0.5, 4)).toBe(2);
    expect(stepAt(0.99, 4)).toBe(3);
  });
  it("puts the very end on the last step", () => {
    expect(stepAt(1, 4)).toBe(3);
    expect(stepAt(1, 1)).toBe(0);
  });
  it("clamps out-of-range and invalid input", () => {
    expect(stepAt(-0.5, 4)).toBe(0);
    expect(stepAt(3, 4)).toBe(3);
    expect(stepAt(Number.NaN, 4)).toBe(0);
    expect(stepAt(0.5, 0)).toBe(0);
  });
});
