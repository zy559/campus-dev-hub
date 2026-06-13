"use client";

import { useState, useEffect } from "react";

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
      <label className="block text-sm font-medium text-muted mb-2">
        {label} ({selectedTagIds.length}/{maxTags})
      </label>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <button
            key={tag.id}
            type="button"
            onClick={() => toggle(tag.id)}
            className={`px-3 py-2 rounded-full text-sm font-medium transition-colors min-h-[36px] ${
              selectedTagIds.includes(tag.id)
                ? "bg-accent text-white"
                : "bg-surface-alt text-muted hover:bg-accent-soft"
            }`}
          >
            {tag.name}
          </button>
        ))}
      </div>
    </div>
  );
}
