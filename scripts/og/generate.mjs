// Generates the static brand images from files in this repository:
//   public/og.png              1200x630 social image   (from scripts/og/template.html)
//   public/apple-touch-icon.png 180x180                (from src/assets/brand/icon.svg)
//   public/favicon-32.png      32x32                   (from src/assets/brand/icon.svg)
// It renders pages in headless Chromium (Playwright); it is NOT part of `pnpm build`.
//
// Regenerate (from the repository root):
//   PLAYWRIGHT_BROWSERS_PATH=.tmp/shots/browsers \
//   PLAYWRIGHT_MODULE=.tmp/shots/ui/node_modules/playwright \
//   node scripts/og/generate.mjs
// PLAYWRIGHT_MODULE is the directory of any installed `playwright` or `playwright-core` package.
// Optional: set SHARP_MODULE to a `sharp` package directory to palette-optimise og.png.
// Commit the PNGs it writes in public/.

import { createRequire } from "node:module";
import { readFile, writeFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "../..");
const require = createRequire(import.meta.url);

const playwrightDir = process.env.PLAYWRIGHT_MODULE;
if (!playwrightDir) {
  console.error("Set PLAYWRIGHT_MODULE to the directory of an installed playwright package (see the header of this file).");
  process.exit(1);
}
const { chromium } = require(resolve(root, playwrightDir));

let sharp = null;
if (process.env.SHARP_MODULE) {
  sharp = require(resolve(root, process.env.SHARP_MODULE));
}

async function optimise(png) {
  if (!sharp) return png;
  return sharp(png).png({ palette: true, quality: 90, effort: 10, compressionLevel: 9 }).toBuffer();
}

const browser = await chromium.launch();
try {
  const context = await browser.newContext({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  const page = await context.newPage();
  await page.goto(pathToFileURL(resolve(here, "template.html")).href);
  await page.evaluate(() => document.fonts.ready);
  const og = await page.screenshot({ type: "png", clip: { x: 0, y: 0, width: 1200, height: 630 } });
  await writeFile(resolve(root, "public/og.png"), await optimise(og));

  // The icon file has a 100 px transparent margin on a 1024 canvas. Crop to the tile so it fills the
  // image. The Apple touch icon must be an opaque full-bleed square (iOS rounds it itself), so it gets
  // the tile gradient behind it; the 32 px favicon keeps the rounded transparent corners.
  const icon = (await readFile(resolve(root, "src/assets/brand/icon.svg"), "utf8")).replace(
    'viewBox="0 0 1024 1024"',
    'viewBox="100 100 824 824"',
  );
  for (const [size, file, background] of [
    [180, "apple-touch-icon.png", "linear-gradient(#3b3e44, #1f2124)"],
    [32, "favicon-32.png", "transparent"],
  ]) {
    const iconPage = await browser.newPage({ viewport: { width: size, height: size } });
    await iconPage.setContent(
      `<!doctype html><style>html,body{margin:0;background:${background}}svg{display:block;width:${size}px;height:${size}px}</style>${icon}`,
    );
    const png = await iconPage.screenshot({ type: "png", omitBackground: file === "favicon-32.png", clip: { x: 0, y: 0, width: size, height: size } });
    await writeFile(resolve(root, "public", file), png);
    await iconPage.close();
  }
} finally {
  await browser.close();
}
