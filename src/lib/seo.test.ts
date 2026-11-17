import { describe, expect, it } from "vitest";
import { meta } from "../content/copy";
import {
  absoluteUrl,
  buildRobots,
  buildSitemap,
  buildSoftwareApplication,
  OG_IMAGE,
  serializeJsonLd,
} from "./seo";

const site = new URL("https://portolano.cloud");

describe("absoluteUrl", () => {
  it("resolves paths against the site", () => {
    expect(absoluteUrl("/", site)).toBe("https://portolano.cloud/");
    expect(absoluteUrl("/og.png", site)).toBe("https://portolano.cloud/og.png");
  });
});

describe("buildSoftwareApplication", () => {
  const data = buildSoftwareApplication({ site, version: "0.1.0" });

  it("round-trips through JSON", () => {
    const parsed = JSON.parse(serializeJsonLd(data));
    expect(parsed["@type"]).toBe("SoftwareApplication");
    expect(parsed.description).toBe(meta.description);
    expect(parsed.softwareVersion).toBe("0.1.0");
    expect(parsed.offers.price).toBe(0);
    expect(parsed.url).toBe("https://portolano.cloud/");
    expect(parsed.image).toBe(`https://portolano.cloud${OG_IMAGE.path}`);
    expect(parsed.author).toEqual({ "@type": "Person", name: "Simone Amato" });
  });

  it("omits softwareVersion when unknown", () => {
    expect(buildSoftwareApplication({ site, version: null })).not.toHaveProperty("softwareVersion");
  });

  it("has no ratings or reviews", () => {
    const text = JSON.stringify(data);
    expect(text).not.toMatch(/aggregateRating|review|ratingValue/i);
  });

  it("escapes angle brackets", () => {
    expect(serializeJsonLd({ a: "</script>" })).not.toContain("</script>");
  });
});

describe("sitemap and robots", () => {
  it("lists only the home page with the build date", () => {
    const xml = buildSitemap(site, new Date("2026-11-17T10:00:00Z"));
    expect(xml.match(/<loc>/g)).toHaveLength(1);
    expect(xml).toContain("<loc>https://portolano.cloud/</loc>");
    expect(xml).toContain("<lastmod>2026-11-17</lastmod>");
    expect(xml).not.toContain("404");
  });

  it("allows all and points at the absolute sitemap", () => {
    const txt = buildRobots(site);
    expect(txt).toContain("User-agent: *\nAllow: /");
    expect(txt).toContain("Sitemap: https://portolano.cloud/sitemap.xml");
  });
});
