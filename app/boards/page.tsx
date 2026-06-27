import Link from "next/link";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const fallbackBoards = [
  { id: "team", name: "组队", description: "比赛、项目、课设协作", _count: { posts: 0 }, children: [] },
  { id: "partner", name: "搭子", description: "学习、运动、兴趣同行", _count: { posts: 0 }, children: [] },
  { id: "blog", name: "博客", description: "经验复盘、作品记录", _count: { posts: 0 }, children: [] },
  { id: "qa", name: "问答", description: "课程、技术、生活求助", _count: { posts: 0 }, children: [] },
  { id: "works", name: "作品", description: "项目展示、简历素材", _count: { posts: 0 }, children: [] },
  { id: "events", name: "活动", description: "社团、讲座、校园局", _count: { posts: 0 }, children: [] },
  { id: "resource", name: "资源", description: "资料、二手、工具推荐", _count: { posts: 0 }, children: [] },
  { id: "daily", name: "日常", description: "校园生活和轻松分享", _count: { posts: 0 }, children: [] },
];

const colors = [
  "bg-teal-50 text-teal-700 ring-teal-100",
  "bg-sky-50 text-sky-700 ring-sky-100",
  "bg-indigo-50 text-indigo-700 ring-indigo-100",
  "bg-emerald-50 text-emerald-700 ring-emerald-100",
  "bg-cyan-50 text-cyan-700 ring-cyan-100",
  "bg-rose-50 text-rose-700 ring-rose-100",
  "bg-amber-50 text-amber-700 ring-amber-100",
  "bg-slate-50 text-slate-700 ring-slate-100",
];

async function getBoards() {
  return db.board
    .findMany({
      where: { parentId: null },
      include: {
        children: { orderBy: { sortOrder: "asc" } },
        _count: { select: { posts: true } },
      },
      orderBy: { sortOrder: "asc" },
    })
    .catch(() => fallbackBoards);
}

export default async function BoardsPage() {
  const boards = await getBoards();

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#f6f8fb] px-4 py-8 lg:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-100">
          <Link href="/" className="text-sm font-bold text-teal-600 hover:text-teal-500">
            ← 返回发现
          </Link>
          <h1 className="mt-4 text-4xl font-black tracking-normal text-slate-950">板块</h1>
          <p className="mt-2 text-slate-500">按场景进入，不用在一堆帖子里迷路。</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {boards.map((board, index) => {
            const color = colors[index % colors.length];
            const href = board.id.length > 12 ? `/boards/${board.id}` : "/posts/new";

            return (
              <Link
                key={board.id}
                href={href}
                className="rounded-[1.5rem] bg-white p-5 shadow-sm ring-1 ring-slate-100 transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className={`inline-flex rounded-full px-3 py-1 text-xs font-black ring-1 ${color}`}>
                  {board._count.posts} 篇
                </div>
                <h2 className="mt-5 text-2xl font-black text-slate-950">{board.name}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">{board.description}</p>

                {board.children.length > 0 && (
                  <div className="mt-5 flex flex-wrap gap-2">
                    {board.children.slice(0, 4).map((child) => (
                      <span key={child.id} className="rounded-full bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-500">
                        {child.name.replace(/^[^\s]+\s/, "")}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
