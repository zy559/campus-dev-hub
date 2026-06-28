import { describe, expect, it } from "vitest";
import {
  buildProfileCardContent,
  parseProfileCardPost,
} from "@/lib/profileCards";

describe("profile card helpers", () => {
  it("round-trips profile card content through the post body", () => {
    const content = buildProfileCardContent({
      name: "Alex",
      meta: "Campus student",
      intro: "Looking for teammates",
      needs: ["Competition", "Friend"],
      interests: ["AI", "Design"],
      cover: "https://example.com/cover.jpg",
    });

    const card = parseProfileCardPost({
      id: "post-1",
      content,
      createdAt: new Date("2026-06-28T00:00:00.000Z"),
      author: { id: "user-1", username: "alex", avatar: null },
    });

    expect(card).toMatchObject({
      id: "post-1",
      postId: "post-1",
      remote: true,
      name: "Alex",
      meta: "Campus student",
      intro: "Looking for teammates",
      needs: ["Competition", "Friend"],
      interests: ["AI", "Design"],
      cover: "https://example.com/cover.jpg",
      author: { id: "user-1", username: "alex", avatar: null },
    });
  });

  it("returns null for non-profile-card posts", () => {
    const card = parseProfileCardPost({
      id: "post-2",
      content: "normal post",
      createdAt: new Date("2026-06-28T00:00:00.000Z"),
      author: { id: "user-2", username: "user", avatar: null },
    });

    expect(card).toBeNull();
  });
});
