// GitHub data used by the page. Build time only: the browser never calls GitHub.
// Fetching is split from the pure helpers below so the logic can be tested with fixture JSON.

export interface GithubData {
  stars: number | null;
  downloads: number | null;
  version: string | null; // "0.1.0", without the leading "v"
  installers: { macosArm: string; macosIntel: string; windows: string }; // fall back to releases/latest
  releasesUrl: string;
  checksumsUrl: string;
}

/** Statistics below this value are hidden. 0 shows everything, including very small numbers. */
export const MIN_STAT_TO_SHOW = 0;

// Build-time only; @types/node is not a dependency of the site.
declare const process: { env: Record<string, string | undefined> };

const REPO = "reallovedone/portolano";
const REPO_WEB = `https://github.com/${REPO}`;
export const RELEASES_URL = `${REPO_WEB}/releases`;
export const LATEST_RELEASE_URL = `${REPO_WEB}/releases/latest`;
const FETCH_TIMEOUT_MS = 15_000;

/** Subset of the GitHub release payload that we use. */
export interface ReleaseAsset {
  name: string;
  download_count: number;
  browser_download_url: string;
}
export interface Release {
  tag_name: string;
  draft: boolean;
  prerelease: boolean;
  published_at?: string | null;
  assets: ReleaseAsset[];
}

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

/** Returns the value only when it should be displayed; null hides the column. */
export function visibleStat(value: number | null): number | null {
  if (value === null) return null;
  return value >= MIN_STAT_TO_SHOW ? value : null;
}

/** True for the installer files that count as downloads: .dmg and -setup.exe. */
export function isInstallerAsset(name: string): boolean {
  return name.endsWith(".dmg") || name.endsWith("-setup.exe");
}

/** Drops drafts and pre-releases. */
export function publishedReleases(releases: Release[]): Release[] {
  return releases.filter((r) => !r.draft && !r.prerelease);
}

/** Sum of download_count of installer assets across the given releases. */
export function sumDownloads(releases: Release[]): number {
  let total = 0;
  for (const release of publishedReleases(releases)) {
    for (const asset of release.assets) {
      if (isInstallerAsset(asset.name)) total += asset.download_count;
    }
  }
  return total;
}

/** Most recent published release, by published_at (falls back to list order, newest first). */
export function pickLatest(releases: Release[]): Release | null {
  const list = publishedReleases(releases);
  if (list.length === 0) return null;
  return list.reduce((best, r) => {
    const a = Date.parse(best.published_at ?? "");
    const b = Date.parse(r.published_at ?? "");
    return Number.isFinite(a) && Number.isFinite(b) && b > a ? r : best;
  });
}

export function versionFromTag(tag: string): string {
  return tag.replace(/^v/, "");
}

/** Installer and checksum URLs of one release, found by asset name; missing ones fall back. */
export function releaseLinks(release: Release): {
  installers: GithubData["installers"];
  checksumsUrl: string;
} {
  const version = versionFromTag(release.tag_name);
  const find = (name: string): string =>
    release.assets.find((a) => a.name === name)?.browser_download_url ?? LATEST_RELEASE_URL;
  return {
    installers: {
      macosArm: find(`Portolano-${version}-macos-aarch64.dmg`),
      macosIntel: find(`Portolano-${version}-macos-x86_64.dmg`),
      windows: find(`Portolano-${version}-windows-x64-setup.exe`),
    },
    checksumsUrl: find("SHA256SUMS.txt"),
  };
}

export function fallbackGithubData(): GithubData {
  return {
    stars: null,
    downloads: null,
    version: null,
    installers: {
      macosArm: LATEST_RELEASE_URL,
      macosIntel: LATEST_RELEASE_URL,
      windows: LATEST_RELEASE_URL,
    },
    releasesUrl: RELEASES_URL,
    checksumsUrl: LATEST_RELEASE_URL,
  };
}

/** Builds the page data from the two API payloads. Throws on malformed payloads. */
export function buildGithubData(repo: unknown, releases: unknown): GithubData {
  const stars = (repo as { stargazers_count?: unknown } | null)?.stargazers_count;
  if (typeof stars !== "number") throw new Error("repository payload has no stargazers_count");
  if (!Array.isArray(releases)) throw new Error("releases payload is not a list");
  const list = releases as Release[];
  const data = fallbackGithubData();
  data.stars = stars;
  data.downloads = sumDownloads(list);
  const latest = pickLatest(list);
  if (latest) {
    data.version = versionFromTag(latest.tag_name);
    const links = releaseLinks(latest);
    data.installers = links.installers;
    data.checksumsUrl = links.checksumsUrl;
  }
  return data;
}

async function fetchJson(fetchFn: typeof fetch, url: string, token?: string): Promise<unknown> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const headers: Record<string, string> = {
      Accept: "application/vnd.github+json",
      "User-Agent": "portolano-site-build",
    };
    if (token) headers.Authorization = `Bearer ${token}`;
    const response = await fetchFn(url, { headers, signal: controller.signal });
    if (!response.ok) throw new Error(`${url} answered HTTP ${response.status}`);
    return await response.json();
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Fetches the live data. Never throws: on any failure it warns once and returns the fallback.
 * `apiBase` and `fetchFn` are injectable for tests.
 */
export async function loadGithubData(
  fetchFn: typeof fetch = fetch,
  apiBase: string = process.env.GITHUB_API_URL || "https://api.github.com",
  token: string | undefined = process.env.GITHUB_TOKEN,
): Promise<GithubData> {
  try {
    const [repo, releases] = await Promise.all([
      fetchJson(fetchFn, `${apiBase}/repos/${REPO}`, token),
      fetchJson(fetchFn, `${apiBase}/repos/${REPO}/releases?per_page=100`, token),
    ]);
    return buildGithubData(repo, releases);
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    console.warn(`[github] Could not load repository data, building without it: ${reason}`);
    return fallbackGithubData();
  }
}

let memo: Promise<GithubData> | null = null;

/** Fetched once per build. */
export function getGithubData(): Promise<GithubData> {
  memo ??= loadGithubData();
  return memo;
}
