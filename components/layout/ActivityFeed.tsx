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

const sections = [
  { title: "机会", desc: "比赛、实习、活动、项目", color: "bg-teal-50 text-teal-700 ring-teal-100", children: ["比赛组队", "实习内推", "活动讲座", "项目招募"] },
  { title: "学习", desc: "课程、考试、技术、问答", color: "bg-sky-50 text-sky-700 ring-sky-100", children: ["课程资料", "考研考公", "技术笔记", "问答求助"] },
  { title: "社交", desc: "对象、朋友、搭子、同好", color: "bg-pink-50 text-pink-600 ring-pink-100", children: ["找对象", "找搭子", "运动约局", "兴趣同好"] },
  { title: "生活", desc: "二手、美食、吐槽、失物", color: "bg-amber-50 text-amber-700 ring-amber-100", children: ["二手闲置", "美食推荐", "校园吐槽", "失物招领"] },
  { title: "展示", desc: "作品、博客、项目、复盘", color: "bg-indigo-50 text-indigo-700 ring-indigo-100", children: ["作品展示", "博客文章", "简历项目", "经验复盘"] },
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

export default async function ActivityFeed({
  tag,
  search,
  isBrowsing,
}: {
  tag?: string;
  search: string;
  isBrowsing: boolean;
}) {
  const [data, tags] = await Promise.all([getPosts(tag), getAllTags()]).catch(
    () => [{ posts: [], total: 0 }, []] as [{ posts: PostCardData[]; total: number }, Tag[]]
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

      <section className="rounded-[1.75rem] bg-white p-5 shadow-sm ring-1 ring-slate-100">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-black text-teal-600">动态</p>
            <h1 className="mt-1 text-3xl font-black tracking-normal text-slate-950">先选栏目，再找内容</h1>
            <p className="mt-2 text-sm text-slate-500">把学校里的机会、学习、社交、生活和展示分开，减少信息差。</p>
          </div>
          <Link href="/posts/new?type=post" className="rounded-full bg-teal-600 px-5 py-2.5 text-center text-sm font-black text-white transition hover:bg-teal-500">
            发布动态
          </Link>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-5">
        {sections.map((section) => (
          <div key={section.title} className="rounded-[1.5rem] bg-white p-4 shadow-sm ring-1 ring-slate-100">
            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ring-1 ${section.color}`}>{section.title}</span>
            <p className="mt-3 text-sm font-bold text-slate-950">{section.desc}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {section.children.map((child) => (
                <Link key={child} href={`/activity?search=${encodeURIComponent(child)}`} className="rounded-full bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-600 transition hover:bg-teal-50 hover:text-teal-700">
                  {child}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </section>

      <main className="rounded-[1.75rem] bg-white p-5 shadow-sm ring-1 ring-slate-100">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black tracking-normal text-slate-950">{tag ? `#${tag}` : search ? `搜索：${search}` : "最新动态"}</h2>
            <p className="mt-1 text-sm text-slate-500">
              {data.posts.length > 0 ? `${data.posts.length} 条内容` : "还没有内容，发布第一条动态吧"}
            </p>
          </div>
          <Link href="/boards" className="rounded-full bg-slate-100 px-4 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-200">
            查看板块
          </Link>
        </div>
        <PostFeed posts={data.posts} tags={tags} activeTag={tag} initialSearch={search} />
      </main>
    </div>
  );
}
