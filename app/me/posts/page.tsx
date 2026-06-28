import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import PostCard from "@/components/posts/PostCard";

export const dynamic = "force-dynamic";

export default async function MyPostsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const posts = await db.post.findMany({
    where: { authorId: session.user.id },
    include: {
      author: { select: { id: true, username: true, avatar: true } },
      tags: { include: { tag: true } },
      board: { select: { id: true, name: true } },
      _count: { select: { comments: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <main className="mx-auto max-w-3xl py-5 pb-24 lg:pb-8">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-teal-700">我的</p>
          <h1 className="text-3xl font-black text-slate-950">我的帖子</h1>
        </div>
        <Link href="/posts/new?type=post" className="rounded-full bg-teal-600 px-4 py-2 text-sm font-bold text-white">
          发布
        </Link>
      </div>
      <div className="space-y-3">
        {posts.length === 0 ? (
          <p className="rounded-2xl bg-white/88 p-6 text-center text-sm text-slate-600 ring-1 ring-slate-200">你还没有发布过帖子。</p>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post.id}
              id={post.id}
              title={post.title}
              content={post.content}
              author={post.author}
              tags={post.tags.map((pt) => pt.tag)}
              board={post.board ?? undefined}
              commentCount={post._count.comments}
              createdAt={post.createdAt.toISOString()}
            />
          ))
        )}
      </div>
    </main>
  );
}
