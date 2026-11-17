// OS detection in the browser, without network.

export type OsKind = "macos" | "windows" | "other";

interface NavigatorLike {
  userAgent?: string;
  userAgentData?: { platform?: string };
}

/** Phones and tablets count as "other", even though iPadOS and Android UAs mention Mac or Linux. */
const MOBILE = /iPhone|iPad|iPod|Android|Mobile/i;

export function detectOs(nav: NavigatorLike): OsKind {
  const ua = nav.userAgent ?? "";
  if (MOBILE.test(ua)) return "other";
  const platform = nav.userAgentData?.platform ?? "";
  const hint = platform || ua;
  if (/^mac/i.test(platform) || (!platform && /Macintosh|Mac OS X/i.test(hint))) return "macos";
  if (/^win/i.test(platform) || (!platform && /Windows/i.test(hint))) return "windows";
  return "other";
}
