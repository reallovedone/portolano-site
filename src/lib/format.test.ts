import { describe, expect, it } from "vitest";

import { formatCount } from "./format";

describe("formatCount", () => {
  it("keeps integers up to 999", () => {
    expect(formatCount(0)).toBe("0");
    expect(formatCount(11)).toBe("11");
    expect(formatCount(999)).toBe("999");
  });

  it("abbreviates from 1000", () => {
    expect(formatCount(1000)).toBe("1k");
    expect(formatCount(1234)).toBe("1.2k");
    expect(formatCount(2000)).toBe("2k");
    expect(formatCount(15999)).toBe("15.9k");
    expect(formatCount(1_000_000)).toBe("1M");
  });

  it("rejects invalid input", () => {
    expect(() => formatCount(-1)).toThrow(RangeError);
    expect(() => formatCount(Number.NaN)).toThrow(RangeError);
  });
});
