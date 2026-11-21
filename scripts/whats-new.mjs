// Generates the screenshots the app shows in its "What's new" window:
//   public/whats-new/<version>/<name>-<theme>.webp   1600x1000 WebP, quality 82
// from src/assets/screens/<name>-<theme>.png (2560x1600), for theme = light and dark.
//
// The app has these URLs written in its code (https://portolano.cloud/whats-new/<version>/...),
// so the files live in public/ (fixed names, no hashing) and are committed, not built.
// Files of a published version never change: if different images are needed, use a new name.
// For that reason the script refuses to overwrite an existing file unless --force is given,
// which is only for a version that has not been published yet.
//
// Regenerate (from the repository root):
//   node scripts/whats-new.mjs 0.4.0 settings connections
// sharp is taken from Astro's own dependencies; set SHARP_MODULE to a `sharp` package directory
// to use another copy.

import { createRequire } from "node:module";
import { access, mkdir, writeFile } from "node:fs/promises";
import { resolve, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const WIDTH = 1600;
const HEIGHT = 1000;
const QUALITY = 82;
const THEMES = ["light", "dark"];

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);
const sharp = process.env.SHARP_MODULE
  ? require(resolve(root, process.env.SHARP_MODULE))
  : createRequire(require.resolve("astro/package.json"))("sharp");

const args = process.argv.slice(2);
const force = args.includes("--force");
const [version, ...names] = args.filter((a) => a !== "--force");
if (!version || !/^\d+\.\d+\.\d+$/.test(version) || names.length === 0) {
  console.error("Usage: node scripts/whats-new.mjs <version> <name>... [--force]");
  console.error("Example: node scripts/whats-new.mjs 0.4.0 settings connections");
  process.exit(1);
}

const exists = (path) => access(path).then(() => true, () => false);

const outDir = resolve(root, "public/whats-new", version);
const jobs = names.flatMap((name) =>
  THEMES.map((theme) => ({
    src: resolve(root, "src/assets/screens", `${name}-${theme}.png`),
    out: resolve(outDir, `${name}-${theme}.webp`),
  })),
);

// Check everything before writing anything, so a mistake leaves no half-generated version.
for (const { src, out } of jobs) {
  if (!(await exists(src))) {
    console.error(`Missing source: ${relative(root, src)}`);
    process.exit(1);
  }
  const { width, height } = await sharp(src).metadata();
  if (width * HEIGHT !== height * WIDTH) {
    console.error(`${relative(root, src)} is ${width}x${height}, not 16:10`);
    process.exit(1);
  }
  if (!force && (await exists(out))) {
    console.error(`${relative(root, out)} already exists; published files never change (see the header).`);
    process.exit(1);
  }
}

await mkdir(outDir, { recursive: true });
for (const { src, out } of jobs) {
  const webp = await sharp(src).resize(WIDTH, HEIGHT, { kernel: "lanczos3" }).webp({ quality: QUALITY, effort: 6 }).toBuffer();
  await writeFile(out, webp);
  console.log(`${relative(root, out)}  ${(webp.length / 1024).toFixed(0)} KB`);
}
