import Link from "next/link";
import PostCard from "@/components/posts/PostCard";

interface PostCardData {
  id: string;
  title: string;
  content: string;
  author: { id: string; username: string; avatar: string | null };
  tags: { id: string; name: string }[];
  commentCount: number;
  createdAt: string;
}

interface Tag {
  id: string;
  name: string;
}

async function getPosts(tag?: string) {
  const url = tag
    ? `${process.env.NEXTAUTH_URL}/api/posts?tag=${tag}&limit=20`
    : `${process.env.NEXTAUTH_URL}/api/posts?limit=20`;

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return { posts: [], total: 0, page: 1, totalPages: 0 };
  return res.json();
}

async function getAllTags(): Promise<Tag[]> {
  const res = await fetch(`${process.env.NEXTAUTH_URL}/api/tags`, {
    cache: "no-store",
  });
  if (!res.ok) return [];
  return res.json();
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: { tag?: string };
}) {
  const tag = searchParams.tag;
  const [data, tags] = await Promise.all([
    getPosts(tag),
    getAllTags(),
  ]);

  const posts = data.posts || [];

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">
            {tag ? `#${tag}` : "发现"}
          </h1>
          <p className="text-gray-600 mt-1">
            {tag ? `${posts.length} 篇相关帖子` : "校园技术交流社区"}
          </p>
        </div>
        <Link
          href="/posts/new"
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors font-medium"
        >
          发布帖子
        </Link>
      </div>

      {/* 标签筛选栏 */}
      <div className="flex flex-wrap gap-2 mb-8">
        <Link
          href="/"
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            !tag
              ? "bg-indigo-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          全部
        </Link>
        {tags.map((t) => (
          <Link
            key={t.id}
            href={`/?tag=${t.name}`}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              tag === t.name
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {t.name}
          </Link>
        ))}
      </div>

      {/* 帖子列表 */}
      {posts.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg">暂无帖子</p>
          <p className="text-gray-400 mt-2">成为第一个发帖的人吧！</p>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post: PostCardData) => (
            <PostCard key={post.id} {...post} />
          ))}
        </div>
      )}
    </div>
  );
}
