import Link from "next/link";
import { notFound } from "next/navigation";
import PostContent from "@/components/posts/PostContent";

interface Tag {
  id: string;
  name: string;
}

async function getPost(id: string) {
  const res = await fetch(
    `${process.env.NEXTAUTH_URL}/api/posts/${id}`,
    { cache: "no-store" }
  );
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to fetch post");
  return res.json();
}

export default async function PostDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const post = await getPost(params.id);

  if (!post) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* 面包屑 */}
      <nav className="mb-6 text-sm text-gray-500">
        <Link href="/" className="hover:text-indigo-600">
          首页
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">帖子</span>
      </nav>

      {/* 标题 */}
      <h1 className="text-4xl font-bold mb-4">{post.title}</h1>

      {/* 作者信息 */}
      <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-200">
        <Link href={`/profile/${post.author.username}`}>
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
            {post.author.username.charAt(0).toUpperCase()}
          </div>
        </Link>
        <div>
          <Link
            href={`/profile/${post.author.username}`}
            className="font-medium text-gray-900 hover:text-indigo-600"
          >
            {post.author.username}
          </Link>
          <p className="text-sm text-gray-500">
            {new Date(post.createdAt).toLocaleDateString("zh-CN", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* 标签 */}
      {post.tags.length > 0 && (
        <div className="flex gap-2 mb-6">
          {post.tags.map((tag: Tag) => (
            <Link
              key={tag.id}
              href={`/?tag=${tag.name}`}
              className="px-3 py-1 bg-indigo-50 text-indigo-600 text-sm rounded-full hover:bg-indigo-100 transition-colors"
            >
              {tag.name}
            </Link>
          ))}
        </div>
      )}

      {/* Markdown 正文 */}
      <div className="mb-10">
        <PostContent content={post.content} />
      </div>

      {/* 评论区将在后续接入 */}
      <section className="border-t border-gray-200 pt-8">
        <h2 className="text-2xl font-bold mb-6">
          评论 ({post.commentCount})
        </h2>
        <p className="text-gray-500 text-center py-8">
          评论功能即将上线
        </p>
      </section>
    </div>
  );
}
