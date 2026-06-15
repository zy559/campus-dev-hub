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
    <div className="space-y-4">
      {/* 全部按钮 */}
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
      </div>

      {/* 按父板块分组显示 */}
      {boards.map((board) => {
        const isActive = activeBoardId === board.id;
        const hasChildren = board.children && board.children.length > 0;

        return (
          <div key={board.id} className="space-y-2">
            {/* 父板块 */}
            <Link
              href={`/boards/${board.id}`}
              className={`inline-flex px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-ink text-white shadow-md"
                  : "bg-surface-alt text-muted hover:bg-accent-soft border border-border"
              }`}
            >
              {board.name}
            </Link>

            {/* 子板块 — 缩进显示 */}
            {hasChildren && (
              <div className="flex flex-wrap gap-1.5 ml-2 pl-3 border-l-2 border-border/50">
                {board.children!.map((child) => (
                  <Link
                    key={child.id}
                    href={`/boards/${child.id}`}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                      activeBoardId === child.id
                        ? "bg-ink text-white shadow-md"
                        : "bg-surface-alt/70 text-muted hover:bg-accent-soft/50 hover:text-ink border border-border"
                    }`}
                  >
                    {child.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
