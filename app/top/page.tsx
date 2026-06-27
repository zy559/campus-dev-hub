import Link from "next/link";
import { db } from "@/lib/db";
import { PROFILE_CARD_MARKER } from "@/lib/activitySections";
import PostCard from "@/components/posts/PostCard";

export const dynamic = "force-dynamic";

async function getTopPosts() {
  const posts = await db.post.findMany({
    where: {
      NOT: [
        { content: { startsWith: PROFILE_CARD_MARKER } },
        { content: { startsWith: "[资料卡]" } },
        { title: { startsWith: "资料卡｜" } },
      ],
    },
    include: {
      author: { select: { id: true, username: true, avatar: true } },
      tags: { include: { tag: true } },
      board: { select: { id: true, name: true } },
      _count: { select: { comments: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 80,
  });

  return posts
    .sort((a, b) => {
      const hotDiff = b._count.comments - a._count.comments;
      if (hotDiff !== 0) return hotDiff;
      return b.createdAt.getTime() - a.createdAt.getTime();
    })
    .slice(0, 10)
    .map((post) => ({
      id: post.id,
      title: post.title,
      content: post.content,
      author: post.author,
      tags: post.tags.map((pt) => pt.tag),
      board: post.board ?? undefined,
      commentCount: post._count.comments,
      createdAt: post.createdAt.toISOString(),
    }));
}

export default async function TopPage() {
  const posts = await getTopPosts().catch(() => []);

  return (
    <div className="space-y-4 py-3 pb-24 lg:pb-6">
      <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-black text-teal-700">Top榜单</p>
            <h1 className="mt-1 text-2xl font-black tracking-normal text-slate-950">校园热度 Top10</h1>
            <p className="mt-2 text-sm text-slate-500">按评论互动和发布时间排序，优先看正在被讨论的内容。</p>
          </div>
          <Link href="/activity" className="shrink-0 rounded-full bg-teal-600 px-4 py-2 text-sm font-black text-white">
            返回动态
          </Link>
        </div>
      </section>

      {posts.length === 0 ? (
        <section className="rounded-2xl bg-white p-10 text-center shadow-sm ring-1 ring-slate-100">
          <p className="text-sm font-bold text-slate-500">暂无上榜动态</p>
          <Link href="/posts/new?type=post" className="mt-4 inline-flex rounded-full bg-teal-600 px-5 py-2.5 text-sm font-bold text-white">
            发布第一条动态
          </Link>
        </section>
      ) : (
        <div className="space-y-3">
          {posts.map((post, index) => (
            <div key={post.id} className="grid gap-3 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-100 sm:grid-cols-[3.5rem_1fr]">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-lg font-black text-white">
                {index + 1}
              </div>
              <PostCard {...post} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
