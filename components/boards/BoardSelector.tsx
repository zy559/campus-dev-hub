"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { Board } from "@/lib/types";

interface BoardSelectorProps {
  activeBoardId?: string;
}

export default function BoardSelector({ activeBoardId }: BoardSelectorProps) {
  const [boards, setBoards] = useState<Board[]>([]);

  useEffect(() => {
    fetch("/api/boards")
      .then((res) => res.json())
      .then((data) => setBoards(Array.isArray(data) ? data : []))
      .catch(() => setBoards([]));
  }, []);

  if (boards.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      <Link
        href="/"
        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
          !activeBoardId
            ? "bg-ink text-white shadow-md"
            : "bg-surface-alt text-muted hover:bg-accent-soft border border-border"
        }`}
      >
        全部
      </Link>
      {boards.map((board) => (
        <Link
          key={board.id}
          href={`/boards/${board.id}`}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
            activeBoardId === board.id
              ? "bg-ink text-white shadow-md"
              : "bg-surface-alt text-muted hover:bg-accent-soft border border-border"
          }`}
        >
          {board.name}
        </Link>
      ))}
    </div>
  );
}
