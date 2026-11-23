import { describe, expect, it } from "vitest";
import { parseBezier, planParts, timesOf } from "./vault-pure";

describe("parseBezier", () => {
  it("reads a cubic-bezier token", () => {
    expect(parseBezier("cubic-bezier(0.2, 0.8, 0.2, 1)")).toEqual([0.2, 0.8, 0.2, 1]);
    expect(parseBezier(" cubic-bezier(0.25,0.1,0.25,1) ")).toEqual([0.25, 0.1, 0.25, 1]);
  });
  it("returns null for anything else", () => {
    expect(parseBezier("")).toBeNull();
    expect(parseBezier("ease-out")).toBeNull();
    expect(parseBezier("cubic-bezier(a, b, c, d)")).toBeNull();
  });
});

describe("timesOf", () => {
  it("maps moments to 0..1", () => {
    expect(timesOf([0, 500, 1000], 1000)).toEqual([0, 0.5, 1]);
  });
  it("clamps and keeps the list ascending", () => {
    expect(timesOf([0, 800, 600, 1500], 1000)).toEqual([0, 0.8, 0.8, 1]);
  });
  it("handles an empty duration", () => {
    expect(timesOf([0, 10], 0)).toEqual([0, 0]);
  });
});

describe("planParts", () => {
  it("reveals new parts going forward", () => {
    expect(planParts(["shown", "hidden", "hidden", "hidden"], 2)).toEqual({ show: [1, 2], hide: [] });
  });
  it("hides parts above the target going backward", () => {
    expect(planParts(["shown", "shown", "revealing", "shown"], 0)).toEqual({ show: [], hide: [1, 2, 3] });
  });
  it("leaves parts that are already revealing alone", () => {
    expect(planParts(["shown", "revealing", "hidden", "hidden"], 1)).toEqual({ show: [], hide: [] });
  });
  it("brings back a part that was on its way out", () => {
    expect(planParts(["shown", "hiding", "hidden", "hidden"], 1)).toEqual({ show: [1], hide: [] });
  });
});
