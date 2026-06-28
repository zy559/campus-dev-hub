"use client";

import { useEffect, useState } from "react";

interface Tag {
  id: string;
  name: string;
}

interface UserTagSelectorProps {
  selectedTagIds: string[];
  onChange: (tags: string[]) => void;
  maxTags?: number;
  label?: string;
}

export default function UserTagSelector({
  selectedTagIds,
  onChange,
  maxTags = 5,
  label = "选择你的兴趣标签",
}: UserTagSelectorProps) {
  const [tags, setTags] = useState<Tag[]>([]);

  useEffect(() => {
    fetch("/api/tags")
      .then((res) => res.json())
      .then((data) => setTags(Array.isArray(data) ? data : []))
      .catch(() => setTags([]));
  }, []);

  function toggle(tagId: string) {
    if (selectedTagIds.includes(tagId)) {
      onChange(selectedTagIds.filter((id) => id !== tagId));
    } else if (selectedTagIds.length < maxTags) {
      onChange([...selectedTagIds, tagId]);
    }
  }

  return (
    <div>
      <label className="mb-2 block text-sm font-bold text-slate-700">
        {label} ({selectedTagIds.length}/{maxTags})
      </label>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <button
            key={tag.id}
            type="button"
            onClick={() => toggle(tag.id)}
            className={`min-h-[36px] rounded-full px-3 py-2 text-sm font-bold transition-colors ${
              selectedTagIds.includes(tag.id)
                ? "bg-teal-600 text-white"
                : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-teal-50 hover:text-teal-700"
            }`}
          >
            {tag.name}
          </button>
        ))}
        {tags.length === 0 && <p className="text-sm text-slate-500">暂无可选标签</p>}
      </div>
    </div>
  );
}
