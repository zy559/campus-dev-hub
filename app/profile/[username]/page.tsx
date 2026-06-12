import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { avatarColor, relativeTime, fullDate } from "@/lib/utils";

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
      <div className="glass rounded-2xl p-8 mb-8 animate-scale-in">
        <div className="flex items-start gap-6">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-3xl flex-shrink-0 ring-4 ring-white/30 shadow-lg"
            style={{ backgroundColor: avatarColor(profile.username) }}
          >
            {profile.username.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-ink">
              {profile.username}
            </h1>
            {profile.bio ? (
              <p className="mt-2 text-muted">{profile.bio}</p>
            ) : (
              <p className="mt-2 text-subtle italic">这个人很懒，什么都没写...</p>
            )}
            <div className="flex gap-6 mt-4 text-sm text-muted">
              <span>{profile.postCount} 篇帖子</span>
              <span>{profile.commentCount} 条评论</span>
              <span>加入于 {fullDate(profile.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 帖子列表 */}
      <section>
        <h2 className="text-xl font-bold text-ink mb-4">发布的帖子</h2>
        {profile.posts.length === 0 ? (
          <p className="text-muted text-center py-8">暂无帖子</p>
        ) : (
          <div className="space-y-4">
            {profile.posts.map((post: UserPost, i: number) => (
              <article
                key={post.id}
                className="bg-surface border border-border rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-border-strong transition-all duration-200"
                style={{ animationDelay: `${i * 0.06}s` }}
              >
                <Link href={`/posts/${post.id}`}>
                  <h3 className="text-lg font-bold text-ink hover:text-accent mb-2 transition-colors">
                    {post.title}
                  </h3>
                </Link>
                <p className="text-muted mb-3 line-clamp-2 text-sm">{post.content}</p>
                <div className="flex items-center justify-between">
                  <div className="flex gap-1.5 flex-wrap">
                    {post.tags.map((tag) => (
                      <Link
                        key={tag.id}
                        href={`/?tag=${tag.name}`}
                        className="px-2.5 py-1 bg-surface-alt text-muted text-xs rounded-full hover:bg-accent-subtle hover:text-accent transition-all duration-200 active:scale-95"
                      >
                        {tag.name}
                      </Link>
                    ))}
                  </div>
                  <span className="text-xs text-subtle flex-shrink-0 ml-3">
                    {post.commentCount > 0 ? `${post.commentCount} 条评论` : ""}
                    {" · "}
                    {relativeTime(post.createdAt)}
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
