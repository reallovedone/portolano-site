import { describe, expect, it } from "vitest";
import { faq } from "../content/copy";
import { linkify } from "./linkify";

describe("linkify", () => {
  it("returns the text untouched without links", () => {
    expect(linkify("plain text")).toEqual(["plain text"]);
  });

  it("links the first occurrence of each word, in text order", () => {
    const parts = linkify("see B and A, then B again", [
      { text: "A", href: "/a" },
      { text: "B", href: "/b" },
    ]);
    expect(parts).toEqual(["see ", { text: "B", href: "/b" }, " and ", { text: "A", href: "/a" }, ", then B again"]);
  });

  it("ignores words that are not in the text", () => {
    expect(linkify("hello", [{ text: "x", href: "/x" }])).toEqual(["hello"]);
  });

  it("rebuilds the original string from the parts", () => {
    for (const item of faq.items) {
      const rebuilt = linkify(item.a, item.links)
        .map((part) => (typeof part === "string" ? part : part.text))
        .join("");
      expect(rebuilt).toBe(item.a);
    }
  });
});
