import Link from "next/link";
import { db } from "@/lib/db";
import PostFeed from "@/components/posts/PostFeed";
import PostCard from "@/components/posts/PostCard";

interface Tag { id: string; name: string; }
interface PostCardData {
  id: string; title: string; content: string;
  author: { id: string; username: string; avatar: string | null };
  tags: Tag[]; commentCount: number; createdAt: string;
  board?: { id: string; name: string };
}

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
    posts: posts.map((p) => ({
      id: p.id, title: p.title, content: p.content.slice(0, 300),
      author: p.author, tags: p.tags.map((pt) => pt.tag),
      board: p.board ?? undefined, commentCount: p._count.comments,
      createdAt: p.createdAt.toISOString(),
    })),
    total,
  };
}

async function getAllTags(): Promise<Tag[]> {
  const tags = await db.tag.findMany({
    where: { posts: { some: {} } },
    orderBy: { name: "asc" },
  });
  return tags.map((t) => ({ id: t.id, name: t.name }));
}

// 登录/浏览用户的帖子流 — 异步数据查询
export default async function DataFeed({
  tag,
  search,
  isBrowsing,
}: {
  tag?: string;
  search: string;
  isBrowsing: boolean;
}) {
  const [data, tags] = await Promise.all([getPosts(tag), getAllTags()]);

  return (
    <div className="py-6">
      {isBrowsing && (
        <div className="flex items-center justify-between bg-accent-subtle border border-accent/20 rounded-xl px-5 py-3 mb-6">
          <p className="text-sm text-accent font-medium">
            你正在以游客身份浏览，登录后可发帖、评论、私信
          </p>
          <Link href="/login" className="text-sm bg-accent text-white px-4 py-1.5 rounded-full hover:bg-accent-hover transition-colors flex-shrink-0">
            立即登录
          </Link>
        </div>
      )}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-ink">
            {tag ? `#${tag}` : "发现"}
          </h1>
          <p className="text-muted mt-1">
            {tag ? `${data.posts.length} 篇帖子` : "校园技术交流社区"}
          </p>
        </div>
        <Link href="/posts/new" className="bg-accent text-white px-5 py-2.5 rounded-full hover:bg-accent-hover transition-all duration-200 font-medium text-sm hover:shadow-xl hover:shadow-accent/30 active:scale-95">
          发布帖子
        </Link>
      </div>
      <PostFeed posts={data.posts} tags={tags} activeTag={tag} initialSearch={search} />
    </div>
  );
}

// 着陆页底部帖子区 — 异步加载
export async function LandingPostSection() {
  const [data] = await Promise.all([getPosts()]);

  return (
    <>
      <h2 className="text-2xl font-bold text-ink mb-8 text-center">近期帖子</h2>
      {data.posts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400">暂无帖子</p>
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
