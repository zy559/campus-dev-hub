import Link from "next/link";
import { db } from "@/lib/db";
import PostFeed from "@/components/posts/PostFeed";
import PostCard from "@/components/posts/PostCard";

interface Tag {
  id: string;
  name: string;
}

interface PostCardData {
  id: string;
  title: string;
  content: string;
  author: { id: string; username: string; avatar: string | null };
  tags: Tag[];
  commentCount: number;
  createdAt: string;
  board?: { id: string; name: string };
}

const channels = ["\u63a8\u8350", "\u673a\u4f1a", "\u7ec4\u961f", "\u642d\u5b50", "\u9047\u89c1", "\u95ee\u7b54", "\u4f5c\u54c1", "\u7ecf\u9a8c", "\u65e5\u5e38"];

const actions = [
  ["\u53d1\u673a\u4f1a", "\u6bd4\u8d5b\u3001\u6d3b\u52a8\u3001\u62db\u52df", "/posts/new"],
  ["\u627e\u961f\u53cb", "\u6bd4\u8d5b\u548c\u9879\u76ee\u534f\u4f5c", "/posts/new"],
  ["\u9047\u89c1\u540c\u9891", "\u670b\u53cb\u3001\u642d\u5b50\u3001\u5bf9\u8c61", "/?search=%E9%81%87%E8%A7%81"],
  ["\u53d1\u8d77\u804a\u5929", "\u641c\u7d22\u540c\u5b66\uff0c\u8f7b\u677e\u5f00\u53e3", "/messages"],
];

const hotNeeds = [
  ["\u6570\u5b66\u5efa\u6a21", "\u7f3a\u7f16\u7a0b\u540c\u5b66"],
  ["\u8003\u7814\u81ea\u4e60", "\u665a\u95f4\u6253\u5361"],
  ["\u6311\u6218\u676f", "\u62db\u4ea7\u54c1\u548c\u7b54\u8fa9"],
  ["\u6444\u5f71\u7ea6\u62cd", "\u5468\u672b\u6821\u56ed"],
];

async function getPosts(tag?: string): Promise<{ posts: PostCardData[]; total: number }> {
  const where = tag ? { tags: { some: { tag: { name: tag } } } } : {};
  const [posts, total] = await Promise.all([
    db.post.findMany({
      where,
      include: {
        author: { select: { id: true, username: true, avatar: true } },
        tags: { include: { tag: true } },
        board: { select: { id: true, name: true } },
        _count: { select: { comments: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    db.post.count({ where }),
  ]);

  return {
    posts: posts.map((post) => ({
      id: post.id,
      title: post.title,
      content: post.content,
      author: post.author,
      tags: post.tags.map((pt) => pt.tag),
      board: post.board ?? undefined,
      commentCount: post._count.comments,
      createdAt: post.createdAt.toISOString(),
    })),
    total,
  };
}

async function getAllTags(): Promise<Tag[]> {
  const tags = await db.tag.findMany({
    where: { posts: { some: {} } },
    orderBy: { name: "asc" },
  });
  return tags.map((tag) => ({ id: tag.id, name: tag.name }));
}

async function getMainBoards() {
  return db.board.findMany({
    where: { parentId: null },
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { posts: true } } },
  });
}

export default async function DataFeed({
  tag,
  search,
  isBrowsing,
}: {
  tag?: string;
  search: string;
  isBrowsing: boolean;
}) {
  const [data, tags, mainBoards] = await Promise.all([
    getPosts(tag),
    getAllTags(),
    getMainBoards(),
  ]).catch(
    () =>
      [
        { posts: [], total: 0 },
        [],
        [],
      ] as [{ posts: PostCardData[]; total: number }, Tag[], Awaited<ReturnType<typeof getMainBoards>>]
  );

  return (
    <div className="space-y-6 py-4">
      {isBrowsing && (
        <div className="flex flex-col gap-3 rounded-2xl border border-teal-100 bg-teal-50 px-5 py-4 text-teal-900 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-medium">{"\u4f60\u6b63\u5728\u4ee5\u6e38\u5ba2\u8eab\u4efd\u6d4f\u89c8\u3002\u767b\u5f55\u540e\u53ef\u4ee5\u53d1\u5e03\u3001\u8bc4\u8bba\u3001\u79c1\u4fe1\u548c\u4f7f\u7528\u540c\u9891\u804a\u5929\u3002"}</p>
          <Link href="/login" className="inline-flex justify-center rounded-full bg-teal-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-teal-500">
            {"\u7acb\u5373\u767b\u5f55"}
          </Link>
        </div>
      )}

      <TodayMeetHero />

      <section className="rounded-[1.75rem] border border-slate-100 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-bold text-teal-600">{"\u56f4\u7089\u5de5\u4f5c\u53f0"}</p>
            <h1 className="mt-1 text-3xl font-black tracking-normal text-slate-950">{"\u4eca\u5929\u60f3\u505a\u70b9\u4ec0\u4e48\uff1f"}</h1>
            <p className="mt-2 text-sm text-slate-500">{"\u53d1\u73b0\u673a\u4f1a\uff0c\u627e\u5230\u4eba\uff0c\u628a\u60f3\u6cd5\u63a8\u8fdb\u4e00\u6b65\u3002"}</p>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {actions.map(([title, desc, href]) => (
              <Link
                key={title}
                href={href}
                className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 transition hover:-translate-y-0.5 hover:border-teal-200 hover:bg-teal-50"
              >
                <p className="text-sm font-black text-slate-950">{title}</p>
                <p className="mt-1 text-xs text-slate-500">{desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <nav className="flex gap-2 overflow-x-auto rounded-2xl border border-slate-100 bg-white p-2 shadow-sm scrollbar-hide">
        {channels.map((channel, index) => (
          <Link
            key={channel}
            href={index === 0 ? "/" : `/?search=${encodeURIComponent(channel)}`}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold transition ${
              index === 0 ? "bg-slate-950 text-white" : "text-slate-600 hover:bg-teal-50 hover:text-teal-700"
            }`}
          >
            {channel}
          </Link>
        ))}
      </nav>

      <div className="grid gap-6 xl:grid-cols-[1fr_300px]">
        <main className="min-w-0 rounded-[1.75rem] border border-slate-100 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black tracking-normal text-slate-950">{tag ? `#${tag}` : "\u63a8\u8350\u52a8\u6001"}</h2>
              <p className="mt-1 text-sm text-slate-500">
                {tag ? `${data.posts.length} \u7bc7\u76f8\u5173\u5e16\u5b50` : "\u673a\u4f1a\u3001\u7ec4\u961f\u3001\u9047\u89c1\u548c\u6821\u56ed\u8ba8\u8bba\u90fd\u5728\u8fd9\u91cc"}
              </p>
            </div>
            <Link href="/posts/new" className="rounded-full bg-teal-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-teal-500">
              {"\u53d1\u5e03"}
            </Link>
          </div>
          <PostFeed posts={data.posts} tags={tags} activeTag={tag} initialSearch={search} />
        </main>

        <aside className="space-y-4">
          <section className="rounded-[1.5rem] border border-slate-100 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-black text-slate-950">{"\u70ed\u95e8\u9700\u6c42"}</h2>
              <Link href="/posts/new" className="text-xs font-bold text-teal-600 hover:text-teal-500">
                {"\u53d1\u5e03"}
              </Link>
            </div>
            <div className="space-y-2">
              {hotNeeds.map(([title, desc]) => (
                <div key={title} className="rounded-2xl bg-slate-50 px-4 py-3">
                  <p className="text-sm font-bold text-slate-900">{title}</p>
                  <p className="mt-1 text-xs text-slate-500">{desc}</p>
                  <div className="mt-3 flex gap-2">
                    <Link href="/messages" className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-teal-700 ring-1 ring-teal-100">
                      {"\u79c1\u4fe1"}
                    </Link>
                    <Link href="/posts/new" className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-slate-600 ring-1 ring-slate-100">
                      {"\u6211\u4e5f\u60f3\u627e"}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[1.5rem] border border-slate-100 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-black text-slate-950">{"\u677f\u5757"}</h2>
              <Link href="/boards" className="text-xs font-bold text-teal-600 hover:text-teal-500">
                {"\u5168\u90e8"}
              </Link>
            </div>
            <div className="space-y-2">
              {mainBoards.slice(0, 5).map((board) => (
                <Link
                  key={board.id}
                  href={`/boards/${board.id}`}
                  className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 transition hover:bg-teal-50"
                >
                  <span className="line-clamp-1 text-sm font-bold text-slate-800">{board.name}</span>
                  <span className="text-xs text-slate-400">{board._count.posts}</span>
                </Link>
              ))}
              {mainBoards.length === 0 && (
                <p className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-500">{"\u6682\u65e0\u677f\u5757\u6570\u636e"}</p>
              )}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

function TodayMeetHero() {
  return (
    <section className="overflow-hidden rounded-[2rem] border border-teal-100 bg-white shadow-sm">
      <div className="grid min-h-[520px] gap-0 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="flex flex-col justify-between p-6 sm:p-8 lg:p-10">
          <div>
            <div className="mb-5 inline-flex rounded-full bg-teal-50 px-4 py-2 text-sm font-black text-teal-700">
              {"\u4eca\u65e5\u9047\u89c1"}
            </div>
            <h1 className="max-w-xl text-4xl font-black leading-tight tracking-normal text-slate-950 sm:text-5xl">
              {"\u7528\u4e00\u5f20\u7167\u7247\uff0c\u5148\u9047\u89c1\u540c\u9891\u7684\u4eba"}
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-500">
              {"\u4e0a\u4f20\u4f60\u7684\u6821\u56ed\u540d\u7247\u3001\u4f5c\u54c1\u7167\u6216\u751f\u6d3b\u77ac\u95f4\u3002\u627e\u5bf9\u8c61\u3001\u627e\u642d\u5b50\u3001\u627e\u961f\u53cb\uff0c\u90fd\u53ef\u4ee5\u5148\u4ece\u4e00\u5f20\u6709\u8bb0\u5fc6\u70b9\u7684\u56fe\u7247\u5f00\u59cb\u3002"}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {["\u627e\u5bf9\u8c61", "\u627e\u642d\u5b50", "\u627e\u961f\u53cb", "\u533f\u540d\u5148\u804a"].map((item) => (
                <Link key={item} href={`/?search=${encodeURIComponent(item)}`} className="rounded-full bg-slate-50 px-4 py-2 text-sm font-bold text-slate-700 ring-1 ring-slate-100 transition hover:bg-teal-50 hover:text-teal-700 hover:ring-teal-100">
                  {item}
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/posts/new?type=meet" className="inline-flex justify-center rounded-full bg-teal-600 px-6 py-3 text-sm font-black text-white transition hover:bg-teal-500">
              {"\u4e0a\u4f20\u7167\u7247\u53d1\u5e03\u540d\u7247"}
            </Link>
            <Link href="/messages" className="inline-flex justify-center rounded-full bg-slate-950 px-6 py-3 text-sm font-black text-white transition hover:bg-slate-800">
              {"\u53d1\u8d77\u804a\u5929"}
            </Link>
          </div>
        </div>

        <div className="relative min-h-[500px] bg-gradient-to-br from-teal-50 via-cyan-50 to-white p-5 sm:p-7 lg:p-9">
          <div className="grid h-full grid-cols-[0.9fr_1.1fr] gap-4">
            <div className="space-y-4 pt-8">
              <PhotoTile className="h-48" label={"\u6821\u56ed\u751f\u6d3b"} gradient="from-emerald-200 via-teal-100 to-white" />
              <PhotoTile className="h-64" label={"\u4f5c\u54c1\u77ac\u95f4"} gradient="from-sky-200 via-cyan-100 to-white" />
            </div>
            <div className="space-y-4">
              <div className="rounded-[1.75rem] bg-white p-4 shadow-xl ring-1 ring-teal-100">
                <PhotoTile className="h-72" label={"\u6211\u7684\u540d\u7247\u7167"} gradient="from-teal-300 via-cyan-100 to-white" />
                <div className="mt-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-lg font-black text-slate-950">{"\u60f3\u8ba4\u8bc6\u4e00\u8d77\u8fdb\u6b65\u7684\u4eba"}</p>
                      <p className="mt-1 text-xs text-slate-500">{"\u524d\u7aef / \u7fbd\u6bdb\u7403 / \u6444\u5f71 / \u6162\u70ed\u4f46\u771f\u8bda"}</p>
                    </div>
                    <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-black text-teal-700">92%</span>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    <button className="rounded-full border border-slate-200 bg-white py-2 text-xs font-bold text-slate-500">
                      {"\u8df3\u8fc7"}
                    </button>
                    <button className="rounded-full bg-teal-600 py-2 text-xs font-bold text-white">
                      {"\u611f\u5174\u8da3"}
                    </button>
                    <Link href="/messages" className="rounded-full bg-slate-950 py-2 text-center text-xs font-bold text-white">
                      {"\u533f\u540d\u804a"}
                    </Link>
                  </div>
                </div>
              </div>
              <PhotoTile className="h-36" label={"\u4e0a\u4f20 1-3 \u5f20\u56fe\u66f4\u5bb9\u6613\u88ab\u8bb0\u4f4f"} gradient="from-amber-100 via-rose-50 to-white" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PhotoTile({
  className,
  label,
  gradient,
}: {
  className: string;
  label: string;
  gradient: string;
}) {
  return (
    <div className={`relative overflow-hidden rounded-[1.5rem] bg-gradient-to-br ${gradient} ${className}`}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_24%_20%,rgba(255,255,255,0.95),transparent_26%),radial-gradient(circle_at_78%_18%,rgba(20,184,166,0.22),transparent_24%),radial-gradient(circle_at_52%_76%,rgba(14,165,233,0.18),transparent_28%)]" />
      <div className="absolute bottom-3 left-3 rounded-full bg-white/85 px-3 py-1 text-xs font-black text-slate-700 shadow-sm backdrop-blur">
        {label}
      </div>
    </div>
  );
}

export async function LandingPostSection() {
  const [data] = await Promise.all([getPosts()]);

  return (
    <>
      <h2 className="mb-8 pt-4 text-center text-2xl font-bold text-slate-900">{"\u8fd1\u671f\u5e16\u5b50"}</h2>
      {data.posts.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-slate-400">{"\u6682\u65e0\u5e16\u5b50"}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {data.posts.slice(0, 5).map((post) => (
            <PostCard key={post.id} {...post} />
          ))}
        </div>
      )}
    </>
  );
}
