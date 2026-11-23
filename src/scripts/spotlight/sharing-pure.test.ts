import { describe, expect, it } from "vitest";
import { dotOpacity, parseBezier } from "./sharing-pure";

describe("parseBezier", () => {
  it("reads a cubic-bezier token", () => {
    expect(parseBezier("cubic-bezier(0.2, 0.8, 0.2, 1)")).toEqual([0.2, 0.8, 0.2, 1]);
  });
  it("rejects anything else", () => {
    expect(parseBezier("ease-out")).toBeNull();
    expect(parseBezier("")).toBeNull();
    expect(parseBezier("cubic-bezier(a, b, c, d)")).toBeNull();
  });
});

describe("dotOpacity", () => {
  it("is hidden at both ends and full in the middle", () => {
    expect(dotOpacity(0)).toBe(0);
    expect(dotOpacity(1)).toBe(0);
    expect(dotOpacity(0.5)).toBe(1);
  });
  it("ramps up and down at the edges", () => {
    expect(dotOpacity(0.06)).toBeCloseTo(0.5);
    expect(dotOpacity(0.94)).toBeCloseTo(0.5);
  });
});
