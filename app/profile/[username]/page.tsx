import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";

interface PostTag {
  id: string;
  name: string;
}

interface PostTagRelation {
  tag: PostTag;
}

interface UserPost {
  id: string;
  title: string;
  content: string;
  tags: PostTag[];
  commentCount: number;
  createdAt: string;
}

async function getUserProfile(username: string) {
  const user = await db.user.findUnique({
    where: { username },
    include: {
      posts: {
        include: {
          tags: { include: { tag: true } },
          _count: { select: { comments: true } },
        },
        orderBy: { createdAt: "desc" },
      },
      _count: { select: { posts: true, comments: true } },
    },
  });

  if (!user) return null;

  return {
    id: user.id,
    username: user.username,
    avatar: user.avatar,
    bio: user.bio,
    createdAt: user.createdAt.toISOString(),
    postCount: user._count.posts,
    commentCount: user._count.comments,
    posts: user.posts.map((post) => ({
      id: post.id,
      title: post.title,
      content: post.content.slice(0, 200),
      tags: post.tags.map((pt: PostTagRelation) => pt.tag),
      commentCount: post._count.comments,
      createdAt: post.createdAt.toISOString(),
    })),
  };
}

export default async function ProfilePage({
  params,
}: {
  params: { username: string };
}) {
  const profile = await getUserProfile(params.username);

  if (!profile) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* 用户信息卡片 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
        <div className="flex items-start gap-6">
          <div className="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-3xl flex-shrink-0">
            {profile.username.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-gray-900">
              {profile.username}
            </h1>
            {profile.bio ? (
              <p className="mt-2 text-gray-600">{profile.bio}</p>
            ) : (
              <p className="mt-2 text-gray-400 italic">这个人很懒，什么都没写...</p>
            )}
            <div className="flex gap-6 mt-4 text-sm text-gray-500">
              <span>{profile.postCount} 篇帖子</span>
              <span>{profile.commentCount} 条评论</span>
              <span>
                加入于 {new Date(profile.createdAt).toLocaleDateString("zh-CN")}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 帖子列表 */}
      <section>
        <h2 className="text-xl font-bold mb-4">发布的帖子</h2>
        {profile.posts.length === 0 ? (
          <p className="text-gray-500 text-center py-8">暂无帖子</p>
        ) : (
          <div className="space-y-4">
            {profile.posts.map((post: UserPost) => (
              <article
                key={post.id}
                className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow"
              >
                <Link href={`/posts/${post.id}`}>
                  <h3 className="text-lg font-bold text-gray-900 hover:text-indigo-600 mb-2">
                    {post.title}
                  </h3>
                </Link>
                <p className="text-gray-600 mb-3 line-clamp-2">{post.content}</p>
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    {post.tags.map((tag) => (
                      <Link
                        key={tag.id}
                        href={`/?tag=${tag.name}`}
                        className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full hover:bg-indigo-100"
                      >
                        {tag.name}
                      </Link>
                    ))}
                  </div>
                  <span className="text-sm text-gray-500">
                    {post.commentCount} 条评论 ·{" "}
                    {new Date(post.createdAt).toLocaleDateString("zh-CN")}
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
