import { describe, expect, it } from "vitest";

import { detectOs } from "./platform";

const UA = {
  mac: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
  win: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
  linux: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
  ios: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
  ipad: "Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
  android: "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Mobile Safari/537.36",
};

describe("detectOs", () => {
  it("detects macOS from userAgentData and from the user agent", () => {
    expect(detectOs({ userAgent: UA.win, userAgentData: { platform: "macOS" } })).toBe("macos");
    expect(detectOs({ userAgent: UA.mac })).toBe("macos");
  });

  it("detects Windows", () => {
    expect(detectOs({ userAgent: UA.win, userAgentData: { platform: "Windows" } })).toBe("windows");
    expect(detectOs({ userAgent: UA.win })).toBe("windows");
  });

  it("treats Linux as other", () => {
    expect(detectOs({ userAgent: UA.linux })).toBe("other");
    expect(detectOs({ userAgent: UA.linux, userAgentData: { platform: "Linux" } })).toBe("other");
  });

  it("treats iOS and Android as other", () => {
    expect(detectOs({ userAgent: UA.ios })).toBe("other");
    expect(detectOs({ userAgent: UA.ipad })).toBe("other");
    expect(detectOs({ userAgent: UA.android })).toBe("other");
    expect(detectOs({ userAgent: UA.android, userAgentData: { platform: "Android" } })).toBe("other");
  });

  it("treats an empty navigator as other", () => {
    expect(detectOs({})).toBe("other");
  });
});
