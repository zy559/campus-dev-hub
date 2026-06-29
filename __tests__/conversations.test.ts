import { describe, expect, it } from "vitest";
import { formatConversationForUser } from "@/lib/conversations";

describe("conversation helpers", () => {
  it("returns the other participant for the current user", () => {
    const conversation = formatConversationForUser({
      conversation: {
        id: "conv-1",
        participant1Id: "user-1",
        participant2Id: "user-2",
        updatedAt: new Date("2026-06-28T00:00:00.000Z"),
        participant1: { id: "user-1", username: "Alice", avatar: null },
        participant2: { id: "user-2", username: "Bob", avatar: "bob.png" },
      },
      currentUserId: "user-1",
    });

    expect(conversation).toMatchObject({
      id: "conv-1",
      otherUser: { id: "user-2", username: "Bob", avatar: "bob.png" },
      updatedAt: "2026-06-28T00:00:00.000Z",
    });
  });
});
