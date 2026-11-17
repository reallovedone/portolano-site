import type { APIRoute } from "astro";
import { buildRobots } from "../lib/seo";

export const GET = (({ site }) => {
  if (!site) throw new Error("astro.config.mjs must set `site` to generate robots.txt");
  return new Response(buildRobots(site), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}) satisfies APIRoute;
