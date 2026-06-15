import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import PostContent from "@/components/posts/PostContent";
import CommentSection from "@/components/comments/CommentSection";
import { avatarColor, fullDate } from "@/lib/utils";

export const dynamic = 'force-dynamic';

interface Tag { id: string; name: string; }

async function getPost(id: string) {
  const post = await db.post.findUnique({
    where: { id },
    include: {
      author: { select: { id: true, username: true, avatar: true } },
      tags: { include: { tag: true } },
      _count: { select: { comments: true } },
    },
  });
  if (!post) return null;
  return {
    id: post.id, title: post.title, content: post.content,
    author: post.author,
    tags: post.tags.map((pt) => pt.tag),
    commentCount: post._count.comments,
    createdAt: post.createdAt.toISOString(),
  };
}

export default async function PostDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const post = await getPost(params.id);

  if (!post) {
    notFound();
  }

  return (
    <div className="py-6">
      {/* 面包屑 */}
      <nav className="mb-6 text-sm text-muted animate-fade-in" aria-label="面包屑导航">
        <Link href="/" className="hover:text-accent transition-colors">
          首页
        </Link>
        <span className="mx-2" aria-hidden="true">/</span>
        <span className="text-ink">帖子</span>
      </nav>

      {/* 标题 */}
      <h1 className="text-4xl font-bold text-ink mb-4 animate-fade-in-up">{post.title}</h1>

      {/* 作者信息 */}
      <div className="flex items-center gap-3 mb-6 pb-6 border-b border-border animate-fade-in-up stagger-1">
        <Link href={`/profile/${post.author.username}`}>
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ring-2 ring-white/50 shadow-sm transition-transform duration-200 hover:scale-105"
            style={{ backgroundColor: avatarColor(post.author.username) }}
          >
            {post.author.username.charAt(0).toUpperCase()}
          </div>
        </Link>
        <div>
          <Link
            href={`/profile/${post.author.username}`}
            className="font-semibold text-ink hover:text-accent transition-colors"
          >
            {post.author.username}
          </Link>
          <p className="text-sm text-muted">{fullDate(post.createdAt)}</p>
        </div>
      </div>

      {/* 标签 */}
      {post.tags.length > 0 && (
        <div className="flex gap-2 mb-6 animate-fade-in-up stagger-2">
          {post.tags.map((tag: Tag) => (
            <Link
              key={tag.id}
              href={`/?tag=${tag.name}`}
              className="px-3 py-2 bg-accent-subtle text-accent text-sm rounded-full hover:bg-accent-soft transition-all duration-200 min-h-[36px] inline-flex items-center"
            >
              {tag.name}
            </Link>
          ))}
        </div>
      )}

      {/* Markdown 正文 */}
      <div className="mb-10 animate-fade-in-up stagger-3">
        <PostContent content={post.content} />
      </div>

      {/* 评论区 */}
      <section className="border-t border-border pt-8 animate-fade-in-up stagger-4">
        <h2 className="text-2xl font-bold text-ink mb-6">
          评论 ({post.commentCount})
        </h2>
        <CommentSection postId={post.id} />
      </section>
    </div>
  );
}
