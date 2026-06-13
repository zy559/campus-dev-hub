"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function StartChatButton({
  targetUserId,
  targetUsername,
}: {
  targetUserId: string;
  targetUsername: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    const res = await fetch("/api/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ participantId: targetUserId }),
    });
    const data = await res.json();
    setLoading(false);
    if (data.id) {
      router.push(`/messages/${data.id}`);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="text-sm px-4 py-2 rounded-full bg-accent text-white hover:bg-accent-hover transition-colors disabled:opacity-50"
    >
      {loading ? "..." : `💬 和 ${targetUsername} 聊天`}
    </button>
  );
}
