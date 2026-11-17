import { afterEach, describe, expect, it, vi } from "vitest";

import {
  buildGithubData,
  fallbackGithubData,
  formatCount,
  getGithubData,
  loadGithubData,
  pickLatest,
  sumDownloads,
  visibleStat,
  type Release,
} from "./github";

const BASE = "https://github.com/reallovedone/portolano/releases/download";

function asset(name: string, count: number, tag = "v0.2.0") {
  return { name, download_count: count, browser_download_url: `${BASE}/${tag}/${name}` };
}

function release(tag: string, publishedAt: string, counts: number[], extra: Partial<Release> = {}): Release {
  const v = tag.replace(/^v/, "");
  return {
    tag_name: tag,
    draft: false,
    prerelease: false,
    published_at: publishedAt,
    assets: [
      asset(`Portolano-${v}-macos-aarch64.dmg`, counts[0], tag),
      asset(`Portolano-${v}-macos-x86_64.dmg`, counts[1], tag),
      asset(`Portolano-${v}-windows-x64-setup.exe`, counts[2], tag),
      asset("SHA256SUMS.txt", 100, tag),
      asset("latest.json", 100, tag),
      asset(`Portolano-${v}-windows-x64-setup.exe.sig`, 100, tag),
      asset("Portolano.app.tar.gz", 100, tag),
    ],
    ...extra,
  };
}

const releases: Release[] = [
  release("v0.1.0", "2026-10-01T10:00:00Z", [1, 2, 3]),
  release("v0.2.0", "2026-11-01T10:00:00Z", [10, 20, 30]),
  release("v0.3.0", "2026-11-10T10:00:00Z", [1000, 1000, 1000], { draft: true }),
  release("v0.4.0-beta.1", "2026-11-12T10:00:00Z", [500, 500, 500], { prerelease: true }),
];

describe("formatCount", () => {
  it("keeps integers up to 999", () => {
    expect(formatCount(0)).toBe("0");
    expect(formatCount(11)).toBe("11");
    expect(formatCount(999)).toBe("999");
  });

  it("abbreviates from 1000", () => {
    expect(formatCount(1000)).toBe("1k");
    expect(formatCount(1234)).toBe("1.2k");
    expect(formatCount(15999)).toBe("15.9k");
  });

  it("rejects invalid input", () => {
    expect(() => formatCount(-1)).toThrow(RangeError);
    expect(() => formatCount(Number.NaN)).toThrow(RangeError);
  });
});

describe("visibleStat", () => {
  it("hides null", () => {
    expect(visibleStat(null)).toBeNull();
    expect(visibleStat(3)).toBe(3);
  });
});

describe("sumDownloads", () => {
  it("counts only .dmg and -setup.exe, excluding drafts and prereleases", () => {
    expect(sumDownloads(releases)).toBe(1 + 2 + 3 + 10 + 20 + 30);
  });

  it("is zero without releases", () => {
    expect(sumDownloads([])).toBe(0);
  });
});

describe("pickLatest and buildGithubData", () => {
  it("picks the most recent published release regardless of list order", () => {
    expect(pickLatest(releases)?.tag_name).toBe("v0.2.0");
    expect(pickLatest([...releases].reverse())?.tag_name).toBe("v0.2.0");
    expect(pickLatest([releases[2]])).toBeNull();
  });

  it("builds version, installer URLs and checksums from the latest release", () => {
    const data = buildGithubData({ stargazers_count: 42 }, releases);
    expect(data.stars).toBe(42);
    expect(data.downloads).toBe(66);
    expect(data.version).toBe("0.2.0");
    expect(data.installers.macosArm).toBe(`${BASE}/v0.2.0/Portolano-0.2.0-macos-aarch64.dmg`);
    expect(data.installers.macosIntel).toBe(`${BASE}/v0.2.0/Portolano-0.2.0-macos-x86_64.dmg`);
    expect(data.installers.windows).toBe(`${BASE}/v0.2.0/Portolano-0.2.0-windows-x64-setup.exe`);
    expect(data.checksumsUrl).toBe(`${BASE}/v0.2.0/SHA256SUMS.txt`);
  });

  it("falls back for installers missing from the release", () => {
    const bare: Release = { ...releases[1], assets: [] };
    const data = buildGithubData({ stargazers_count: 1 }, [bare]);
    expect(data.installers.windows).toBe("https://github.com/reallovedone/portolano/releases/latest");
  });

  it("rejects malformed payloads", () => {
    expect(() => buildGithubData({}, [])).toThrow();
    expect(() => buildGithubData({ stargazers_count: 1 }, {})).toThrow();
  });
});

describe("loadGithubData", () => {
  afterEach(() => vi.restoreAllMocks());

  function json(body: unknown, status = 200): Response {
    return new Response(JSON.stringify(body), { status });
  }

  it("returns live data and sends the token and user agent", async () => {
    const fetchFn = vi.fn(async (url: string | URL | Request, _init?: RequestInit) =>
      String(url).includes("/releases") ? json(releases) : json({ stargazers_count: 7 }),
    );
    const data = await loadGithubData(fetchFn as unknown as typeof fetch, "https://api.test", "tok");
    expect(data.stars).toBe(7);
    expect(data.version).toBe("0.2.0");
    const init = fetchFn.mock.calls[0][1] as RequestInit;
    const headers = init.headers as Record<string, string>;
    expect(headers.Authorization).toBe("Bearer tok");
    expect(headers["User-Agent"]).toBe("portolano-site-build");
  });

  it("does not throw when the network is absent", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const fetchFn = vi.fn(async () => {
      throw new TypeError("fetch failed");
    });
    const data = await loadGithubData(fetchFn as unknown as typeof fetch, "https://api.test");
    expect(data).toEqual(fallbackGithubData());
    expect(data.stars).toBeNull();
    expect(data.downloads).toBeNull();
    expect(data.version).toBeNull();
    expect(data.installers.macosArm).toBe("https://github.com/reallovedone/portolano/releases/latest");
    expect(warn).toHaveBeenCalledTimes(1);
  });

  it("falls back on a non-200 answer", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const fetchFn = vi.fn(async () => json({ message: "rate limited" }, 403));
    const data = await loadGithubData(fetchFn as unknown as typeof fetch, "https://api.test");
    expect(data).toEqual(fallbackGithubData());
    expect(warn).toHaveBeenCalledTimes(1);
  });
});

describe("getGithubData", () => {
  it("is memoised", () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.stubGlobal("fetch", vi.fn(async () => new Response("{}", { status: 500 })));
    expect(getGithubData()).toBe(getGithubData());
    vi.unstubAllGlobals();
  });
});
