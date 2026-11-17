import type { APIRoute } from "astro";
import { buildSitemap } from "../lib/seo";

export const GET = (({ site }) => {
  if (!site) throw new Error("astro.config.mjs must set `site` to generate sitemap.xml");
  return new Response(buildSitemap(site, new Date()), {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}) satisfies APIRoute;
