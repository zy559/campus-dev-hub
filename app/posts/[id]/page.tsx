import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import PostContent from "@/components/posts/PostContent";
import CommentSection from "@/components/comments/CommentSection";
import PostDeleteButton from "@/components/posts/PostDeleteButton";
import { avatarColor, fullDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface Tag {
  id: string;
  name: string;
}

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
    id: post.id,
    title: post.title,
    content: post.content,
    author: post.author,
    authorId: post.authorId,
    tags: post.tags.map((pt) => pt.tag),
    commentCount: post._count.comments,
    createdAt: post.createdAt.toISOString(),
  };
}

export default async function PostDetailPage({ params }: { params: { id: string } }) {
  const [post, session] = await Promise.all([getPost(params.id), getServerSession(authOptions)]);

  if (!post) notFound();

  const currentUserId = session?.user?.id;
  const isAdmin = (session?.user as { role?: string } | undefined)?.role === "admin";
  const canDelete = currentUserId && (isAdmin || currentUserId === post.authorId);

  return (
    <article className="mx-auto max-w-3xl py-4 pb-24 lg:pb-8">
      <Link href="/activity" className="mb-4 inline-flex text-sm font-semibold text-slate-600 transition hover:text-teal-700">
        ← 返回动态
      </Link>

      <section className="rounded-2xl border border-slate-200/80 bg-white/88 p-5 shadow-sm backdrop-blur sm:p-7">
        <h1 className="text-2xl font-black leading-tight text-slate-950 sm:text-4xl">{post.title}</h1>

        <div className="mt-4 flex items-center gap-3 border-b border-slate-100 pb-4">
          <Link href={`/profile/${post.author.username}`}>
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full font-bold text-white ring-2 ring-white/70 shadow-sm"
              style={{ backgroundColor: avatarColor(post.author.username) }}
            >
              {post.author.username.charAt(0).toUpperCase()}
            </div>
          </Link>
          <div className="min-w-0 flex-1">
            <Link href={`/profile/${post.author.username}`} className="font-semibold text-slate-900 transition hover:text-teal-700">
              {post.author.username}
            </Link>
            <p className="text-sm text-slate-500">{fullDate(post.createdAt)}</p>
          </div>
          {canDelete && <PostDeleteButton postId={post.id} />}
        </div>

        {post.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {post.tags.map((tag: Tag) => (
              <Link
                key={tag.id}
                href={`/activity?tag=${encodeURIComponent(tag.name)}`}
                className="inline-flex min-h-[32px] items-center rounded-full bg-teal-50 px-3 py-1.5 text-xs font-bold text-teal-700 transition hover:bg-teal-100"
              >
                {tag.name}
              </Link>
            ))}
          </div>
        )}

        <div className="mt-6">
          <PostContent content={post.content} />
        </div>
      </section>

      <section className="mt-4 rounded-2xl border border-slate-200/80 bg-white/88 p-5 shadow-sm backdrop-blur sm:p-7">
        <h2 className="mb-5 text-xl font-black text-slate-950">评论 ({post.commentCount})</h2>
        <CommentSection postId={post.id} />
      </section>
    </article>
  );
}
