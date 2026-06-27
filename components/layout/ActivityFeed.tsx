import Link from "next/link";
import { db } from "@/lib/db";
import PostFeed from "@/components/posts/PostFeed";

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

const channels = ["推荐", "机会", "组队", "搭子", "遇见", "问答", "作品", "经验", "日常"];

const actions = [
  ["发机会", "比赛、活动、招募", "/posts/new"],
  ["找队友", "比赛和项目协作", "/posts/new"],
  ["遇见同频", "朋友、搭子、对象", "/?search=遇见"],
  ["发起聊天", "搜索同学，轻松开口", "/messages"],
];

const hotNeeds = [
  ["数学建模", "缺编程同学"],
  ["考研自习", "晚间打卡"],
  ["挑战杯", "招产品和答辩"],
  ["摄影约拍", "周末校园"],
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

export default async function ActivityFeed({
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
          <p className="text-sm font-medium">你正在以游客身份浏览。登录后可以发布、评论、私信和使用同频聊天。</p>
          <Link href="/login" className="inline-flex justify-center rounded-full bg-teal-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-teal-500">
            立即登录
          </Link>
        </div>
      )}

      <section className="rounded-[1.75rem] border border-slate-100 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-bold text-teal-600">动态</p>
            <h1 className="mt-1 text-3xl font-black tracking-normal text-slate-950">校园信息流</h1>
            <p className="mt-2 text-sm text-slate-500">机会、组队、知识、日常都放在这里，不挤占推荐页。</p>
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
            href={index === 0 ? "/activity" : `/activity?search=${encodeURIComponent(channel)}`}
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
              <h2 className="text-2xl font-black tracking-normal text-slate-950">{tag ? `#${tag}` : "推荐动态"}</h2>
              <p className="mt-1 text-sm text-slate-500">
                {tag ? `${data.posts.length} 篇相关帖子` : "机会、组队、遇见和校园讨论都在这里"}
              </p>
            </div>
            <Link href="/posts/new" className="rounded-full bg-teal-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-teal-500">
              发布
            </Link>
          </div>
          <PostFeed posts={data.posts} tags={tags} activeTag={tag} initialSearch={search} />
        </main>

        <aside className="space-y-4">
          <section className="rounded-[1.5rem] border border-slate-100 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-black text-slate-950">热门需求</h2>
              <Link href="/posts/new" className="text-xs font-bold text-teal-600 hover:text-teal-500">
                发布
              </Link>
            </div>
            <div className="space-y-2">
              {hotNeeds.map(([title, desc]) => (
                <div key={title} className="rounded-2xl bg-slate-50 px-4 py-3">
                  <p className="text-sm font-bold text-slate-900">{title}</p>
                  <p className="mt-1 text-xs text-slate-500">{desc}</p>
                  <div className="mt-3 flex gap-2">
                    <Link href="/messages" className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-teal-700 ring-1 ring-teal-100">
                      私信
                    </Link>
                    <Link href="/posts/new" className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-slate-600 ring-1 ring-slate-100">
                      我也想找
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[1.5rem] border border-slate-100 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-black text-slate-950">板块</h2>
              <Link href="/boards" className="text-xs font-bold text-teal-600 hover:text-teal-500">
                全部
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
                <p className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-500">暂无板块数据</p>
              )}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
