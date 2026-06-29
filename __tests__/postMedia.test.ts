import { describe, expect, it } from "vitest";
import {
  buildPostContentWithImages,
  parsePostMedia,
} from "@/lib/postMedia";

describe("post media helpers", () => {
  it("parses mini program image marker", () => {
    const content = buildPostContentWithImages("hello", ["https://example.com/a.jpg"]);

    expect(parsePostMedia(content)).toEqual({
      text: "hello",
      images: ["https://example.com/a.jpg"],
    });
  });

  it("parses markdown images from web posts", () => {
    const content = "hello\n\n![photo](https://example.com/a.jpg)";

    expect(parsePostMedia(content)).toEqual({
      text: "hello",
      images: ["https://example.com/a.jpg"],
    });
  });
});
