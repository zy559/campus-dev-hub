import Link from "next/link";
import { db } from "@/lib/db";
import PostFeed from "@/components/posts/PostFeed";
import { ACTIVITY_SECTIONS, PROFILE_CARD_MARKER } from "@/lib/activitySections";

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

function normalPostWhere() {
  return {
    NOT: [
      { content: { startsWith: PROFILE_CARD_MARKER } },
      { content: { startsWith: "[资料卡]" } },
      { title: { startsWith: "资料卡：" } },
    ],
  };
}

function buildWhere(tag?: string, search?: string) {
  const where: Record<string, unknown> = normalPostWhere();
  const keyword = search?.trim();

  if (tag) where.tags = { some: { tag: { name: tag } } };
  if (keyword) {
    where.OR = [
      { title: { contains: keyword } },
      { content: { contains: keyword } },
      { tags: { some: { tag: { name: { contains: keyword } } } } },
      { board: { name: { contains: keyword } } },
    ];
  }

  return where;
}

function getActiveSection(tag?: string) {
  if (!tag) return undefined;
  return ACTIVITY_SECTIONS.find((section) => section.title === tag || (section.children as readonly string[]).includes(tag));
}

async function getPosts(tag?: string, search?: string): Promise<{ posts: PostCardData[]; total: number }> {
  const where = buildWhere(tag, search);
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
    where: { posts: { some: { post: normalPostWhere() } } },
    orderBy: { name: "asc" },
  });
  return tags.map((tag) => ({ id: tag.id, name: tag.name }));
}

async function getTopPreview() {
  const posts = await db.post.findMany({
    where: normalPostWhere(),
    include: { _count: { select: { comments: true } } },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  return posts
    .sort((a, b) => {
      const commentDiff = b._count.comments - a._count.comments;
      if (commentDiff !== 0) return commentDiff;
      return b.createdAt.getTime() - a.createdAt.getTime();
    })
    .slice(0, 1)
    .map((post) => ({ id: post.id, title: post.title, commentCount: post._count.comments }))[0];
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
  const [data, tags, topPost] = await Promise.all([getPosts(tag, search), getAllTags(), getTopPreview()]).catch(
    () =>
      [{ posts: [], total: 0 }, [], undefined] as [
        { posts: PostCardData[]; total: number },
        Tag[],
        { id: string; title: string; commentCount: number } | undefined,
      ]
  );
  const activeLabel = tag || search;
  const activeSection = getActiveSection(tag);
  const visibleChildren = activeSection ? activeSection.children : ACTIVITY_SECTIONS.flatMap((section) => section.children);

  return (
    <div className="space-y-4 py-3 pb-24 lg:pb-6">
      {isBrowsing && (
        <div className="flex flex-col gap-3 rounded-2xl border border-teal-100 bg-white/85 px-5 py-4 text-teal-900 shadow-sm backdrop-blur sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-medium">你正在以游客身份浏览。登录后可以发布、评论、私信和使用同频聊天。</p>
          <Link href="/login" className="inline-flex justify-center rounded-full bg-teal-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-teal-500">
            立即登录
          </Link>
        </div>
      )}

      <section className="rounded-2xl bg-white/80 p-4 shadow-sm ring-1 ring-white/70 backdrop-blur-xl">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-black text-teal-700">动态</p>
            <h1 className="mt-1 truncate text-2xl font-black tracking-normal text-slate-950">按栏目找内容</h1>
          </div>
          <div className="flex min-w-0 shrink-0 items-center gap-2">
            <Link href="/top" className="hidden max-w-[220px] items-center gap-2 rounded-full bg-teal-600 px-4 py-2 text-sm font-black text-white sm:inline-flex" title={topPost ? topPost.title : "Top榜单"}>
              <span className="shrink-0">Top</span>
              <span className="truncate text-white/85">{topPost ? topPost.title : "榜单"}</span>
            </Link>
            <Link href="/top" className="rounded-full bg-teal-600 px-4 py-2 text-sm font-black text-white sm:hidden">
              Top
            </Link>
            <Link href="/posts/new?type=post" className="rounded-full bg-white px-4 py-2 text-sm font-black text-teal-700 ring-1 ring-teal-100 transition hover:bg-teal-50">
              发布
            </Link>
          </div>
        </div>
      </section>

      <section className="rounded-2xl bg-white/80 p-3 shadow-sm ring-1 ring-white/70 backdrop-blur-xl">
        <div className="flex gap-2 overflow-x-auto pb-1">
          <Link href="/activity" className={`shrink-0 rounded-full px-4 py-2 text-sm font-black transition ${!activeLabel ? "bg-teal-600 text-white" : "bg-white text-slate-700 ring-1 ring-slate-100 hover:bg-teal-50 hover:text-teal-700"}`}>
            全部
          </Link>
          {ACTIVITY_SECTIONS.map((section) => (
            <Link
              key={section.title}
              href={`/activity?tag=${encodeURIComponent(section.title)}`}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-black ring-1 transition ${
                activeSection?.title === section.title ? "bg-teal-600 text-white ring-teal-600" : section.color
              }`}
            >
              {section.title}
            </Link>
          ))}
        </div>
        <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
          {visibleChildren.map((child) => (
            <Link
              key={child}
              href={`/activity?tag=${encodeURIComponent(child)}`}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold transition ${
                tag === child ? "bg-teal-600 text-white" : "bg-white text-slate-700 ring-1 ring-slate-100 hover:bg-teal-50 hover:text-teal-700"
              }`}
            >
              {child}
            </Link>
          ))}
        </div>
      </section>

      <main className="rounded-2xl bg-white/80 p-4 shadow-sm ring-1 ring-white/70 backdrop-blur-xl">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black tracking-normal text-slate-950">{tag ? `#${tag}` : search ? `搜索：${search}` : "动态广场"}</h2>
            <p className="mt-1 text-sm text-slate-600">
              {data.posts.length > 0 ? `${data.posts.length} 条内容` : "还没有内容，发布第一条动态吧"}
            </p>
          </div>
        </div>
        <PostFeed posts={data.posts} tags={tags} activeTag={tag} initialSearch={search} />
      </main>
    </div>
  );
}
