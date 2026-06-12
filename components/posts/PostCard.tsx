import Link from "next/link";
import { avatarColor, relativeTime } from "@/lib/utils";

interface Tag {
  id: string;
  name: string;
}

interface PostCardProps {
  id: string;
  title: string;
  content: string;
  author: {
    id: string;
    username: string;
    avatar: string | null;
  };
  tags: Tag[];
  commentCount: number;
  createdAt: string;
}

export default function PostCard({
  id,
  title,
  content,
  author,
  tags,
  commentCount,
  createdAt,
}: PostCardProps) {
  const color = avatarColor(author.username);

  return (
    <article className="bg-surface border border-border rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-md hover:border-border-strong transition-all duration-200">
      <div className="flex items-center gap-3 mb-3">
        <Link href={`/profile/${author.username}`} className="flex-shrink-0">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm ring-2 ring-white/50 shadow-sm transition-transform duration-200 hover:scale-105"
            style={{ backgroundColor: color }}
          >
            {author.username.charAt(0).toUpperCase()}
          </div>
        </Link>
        <div className="min-w-0 flex-1">
          <Link
            href={`/profile/${author.username}`}
            className="text-sm font-semibold text-ink hover:text-accent transition-colors"
          >
            {author.username}
          </Link>
          <span className="text-xs text-subtle ml-2">
            {relativeTime(createdAt)}
          </span>
        </div>
      </div>

      <Link href={`/posts/${id}`} className="group">
        <h2 className="text-lg sm:text-xl font-bold text-ink mb-2 group-hover:text-accent transition-colors leading-snug">
          {title}
        </h2>
      </Link>

      <p className="text-muted mb-4 line-clamp-3 leading-relaxed text-sm sm:text-base">
        {content}
      </p>

      <div className="flex items-center justify-between">
        <div className="flex gap-1.5 flex-wrap">
          {tags.map((tag) => (
            <Link
              key={tag.id}
              href={`/?tag=${tag.name}`}
              className="px-2.5 py-1 bg-surface-alt text-muted text-xs rounded-full hover:bg-accent-subtle hover:text-accent transition-all duration-200 min-h-[26px] inline-flex items-center active:scale-95"
            >
              {tag.name}
            </Link>
          ))}
        </div>

        <span className="text-xs text-subtle flex-shrink-0 ml-3">
          {commentCount > 0 ? `${commentCount} 条评论` : "暂无评论"}
        </span>
      </div>
    </article>
  );
}
