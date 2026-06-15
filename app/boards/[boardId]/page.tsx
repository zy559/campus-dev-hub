import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import PostFeed from "@/components/posts/PostFeed";
import BoardSelector from "@/components/boards/BoardSelector";
export const dynamic = 'force-dynamic';

async function getBoard(boardId: string) {
  return db.board.findUnique({ where: { id: boardId } });
}

async function getPosts(boardId: string, tag?: string) {
  const where: Record<string, unknown> = { boardId };
  if (tag) where.tags = { some: { tag: { name: tag } } };
  const posts = await db.post.findMany({
    where,
    include: {
      author: { select: { id: true, username: true, avatar: true } },
      tags: { include: { tag: true } },
      board: { select: { id: true, name: true } },
      _count: { select: { comments: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return posts.map((post) => ({
    id: post.id,
    title: post.title,
    content: post.content.slice(0, 300),
    author: post.author,
    tags: post.tags.map((pt) => pt.tag),
    board: post.board ?? undefined,
    commentCount: post._count.comments,
    createdAt: post.createdAt.toISOString(),
  }));
}

async function getAllTags() {
  const tags = await db.tag.findMany({
    where: { posts: { some: {} } },
    include: { _count: { select: { posts: true } } },
    orderBy: { name: "asc" },
  });
  return tags.map((t) => ({ id: t.id, name: t.name }));
}

export default async function BoardPage({
  params,
  searchParams,
}: {
  params: { boardId: string };
  searchParams: { tag?: string };
}) {
  const board = await getBoard(params.boardId);
  if (!board) notFound();

  const activeTag = searchParams.tag;
  const [posts, tags] = await Promise.all([
    getPosts(params.boardId, activeTag),
    getAllTags(),
  ]);

  return (
    <div className="py-6">
      <div className="mb-8">
        <Link href="/" className="text-sm text-muted hover:text-accent transition-colors">
          ← 返回首页
        </Link>
        <h1 className="text-3xl font-bold text-ink mt-2">{board.name}</h1>
        <p className="text-muted mt-1">{board.description}</p>
      </div>

      <BoardSelector activeBoardId={params.boardId} />

      <div className="mt-8">
        <PostFeed posts={posts} tags={tags} activeTag={activeTag} />
      </div>
    </div>
  );
}
