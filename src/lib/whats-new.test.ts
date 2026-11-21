// Guards the contract with the app's "What's new" window: public/whats-new/<version>/ holds
// <name>-<theme>.webp files, 1600x1000, in both themes. The app has these URLs in its code.
import { describe, expect, it } from "vitest";

// The project has no Node type definitions, so the fs module is loaded untyped (the specifier
// is built at runtime so TypeScript does not try to resolve it) and typed by hand below.
const fs: {
  readFileSync(path: URL): Uint8Array;
  readdirSync(path: URL): string[];
} = await import(/* @vite-ignore */ ["node", "fs"].join(":"));

const dir = new URL("../../public/whats-new/", import.meta.url);

function ascii(bytes: Uint8Array, start: number, end: number): string {
  return String.fromCharCode(...bytes.subarray(start, end));
}

// Reads the canvas size from a WebP header (lossy VP8, lossless VP8L or extended VP8X).
function webpSize(bytes: Uint8Array): { width: number; height: number } {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const u24 = (at: number) => view.getUint16(at, true) | (view.getUint8(at + 2) << 16);
  expect(ascii(bytes, 0, 4)).toBe("RIFF");
  expect(ascii(bytes, 8, 12)).toBe("WEBP");
  const chunk = ascii(bytes, 12, 16);
  if (chunk === "VP8X") return { width: 1 + u24(24), height: 1 + u24(27) };
  if (chunk === "VP8L") {
    const bits = view.getUint32(21, true);
    return { width: 1 + (bits & 0x3fff), height: 1 + ((bits >> 14) & 0x3fff) };
  }
  expect(chunk).toBe("VP8 ");
  return { width: view.getUint16(26, true) & 0x3fff, height: view.getUint16(28, true) & 0x3fff };
}

const versions = fs.readdirSync(dir);

describe("public/whats-new", () => {
  it("has the 0.4.0 screenshots the app links to", () => {
    expect(fs.readdirSync(new URL("0.4.0/", dir)).sort()).toEqual(
      ["connections-dark.webp", "connections-light.webp", "settings-dark.webp", "settings-light.webp"],
    );
  });

  for (const version of versions) {
    it(`${version}: names, themes and size`, () => {
      expect(version).toMatch(/^\d+\.\d+\.\d+$/);
      const files = fs.readdirSync(new URL(`${version}/`, dir));
      for (const file of files) {
        expect(file).toMatch(/^[a-z0-9-]+-(light|dark)\.webp$/);
        const other = file.endsWith("-light.webp") ? file.replace("-light.", "-dark.") : file.replace("-dark.", "-light.");
        expect(files).toContain(other);
        expect(webpSize(fs.readFileSync(new URL(`${version}/${file}`, dir)))).toEqual({ width: 1600, height: 1000 });
      }
    });
  }
});
