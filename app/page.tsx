import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import PostCard from "@/components/posts/PostCard";

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
}

async function getPosts(tag?: string) {
  const url = tag
    ? `${process.env.NEXTAUTH_URL}/api/posts?tag=${tag}&limit=20`
    : `${process.env.NEXTAUTH_URL}/api/posts?limit=20`;

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return { posts: [], total: 0 };
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
  const session = await getServerSession(authOptions);
  const tag = searchParams.tag;
  const [data, tags] = await Promise.all([
    getPosts(tag),
    getAllTags(),
  ]);
  const posts = data.posts || [];
  const total = data.total || 0;

  // ===== 已登录用户 =====
  if (session) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* 顶栏标语 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#1c1c1e]">
              {tag ? `#${tag}` : "发现"}
            </h1>
            <p className="text-[#6e6e73] mt-1">
              {tag ? `${posts.length} 篇帖子` : "校园技术交流社区"}
            </p>
          </div>
          <Link
            href="/posts/new"
            className="bg-orange-600 text-white px-4 py-2 rounded-full hover:bg-orange-700 transition-colors font-medium text-sm"
          >
            发布帖子
          </Link>
        </div>

        {/* 标签 */}
        <div className="flex flex-wrap gap-2 mb-8">
          <Link
            href="/"
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              !tag
                ? "bg-[#1c1c1e] text-white"
                : "bg-gray-100 text-[#6e6e73] hover:bg-gray-200"
            }`}
          >
            全部
          </Link>
          {tags.map((t) => (
            <Link
              key={t.id}
              href={`/?tag=${t.name}`}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                tag === t.name
                  ? "bg-[#1c1c1e] text-white"
                  : "bg-gray-100 text-[#6e6e73] hover:bg-gray-200"
              }`}
            >
              {t.name}
            </Link>
          ))}
        </div>

        {/* 帖子列表 */}
        {posts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-lg">暂无帖子</p>
            <p className="text-gray-300 mt-2">成为第一个发帖的人吧</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post: PostCardData) => (
              <PostCard key={post.id} {...post} />
            ))}
          </div>
        )}
      </div>
    );
  }

  // ===== 未登录用户：全屏宣传页 =====
  return (
    <div>
      {/* Section 1: Hero */}
      <section className="min-h-[80vh] flex flex-col items-center justify-center text-center px-6 py-20">
        <div className="text-7xl mb-8">💻</div>
        <h1 className="text-5xl font-bold text-[#1c1c1e] mb-4 tracking-tight">
          校园技术交流社区
        </h1>
        <p className="text-xl text-[#6e6e73] mb-10 max-w-xl leading-relaxed">
          分享知识 · 展示项目 · 找到队友
        </p>
        <div className="flex gap-4">
          <Link
            href="/login"
            className="bg-orange-600 text-white px-8 py-3 rounded-full hover:bg-orange-700 transition-colors font-medium text-base"
          >
            开始探索
          </Link>
          <Link
            href="/login"
            className="bg-white text-[#1c1c1e] px-8 py-3 rounded-full border border-gray-200 hover:border-gray-300 transition-colors font-medium text-base"
          >
            了解更多
          </Link>
        </div>

        {/* 向下滚动提示 */}
        <div className="mt-20 animate-bounce text-gray-300 text-sm">
          ↓ 向下滑动
        </div>
      </section>

      {/* Section 2: 功能卡片 */}
      <section className="py-28 px-6 bg-[#fafaf9]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-[#1c1c1e] mb-4">
            在这里，你能做什么
          </h2>
          <p className="text-center text-[#6e6e73] mb-16">
            一个专为计算机系同学打造的交流平台
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* 卡片 1 */}
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow text-center">
              <div className="text-4xl mb-4">📝</div>
              <h3 className="text-lg font-bold text-[#1c1c1e] mb-2">发帖讨论</h3>
              <p className="text-[#6e6e73] text-sm leading-relaxed">
                用 Markdown 写技术文章，分享你的学习和项目经验
              </p>
            </div>

            {/* 卡片 2 */}
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow text-center">
              <div className="text-4xl mb-4">🔗</div>
              <h3 className="text-lg font-bold text-[#1c1c1e] mb-2">分享资源</h3>
              <p className="text-[#6e6e73] text-sm leading-relaxed">
                上传课程笔记和资料，帮助同学也让自己温故知新
              </p>
            </div>

            {/* 卡片 3 */}
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow text-center">
              <div className="text-4xl mb-4">👥</div>
              <h3 className="text-lg font-bold text-[#1c1c1e] mb-2">组队找人</h3>
              <p className="text-[#6e6e73] text-sm leading-relaxed">
                找到志同道合的同学，一起刷题、做项目、打比赛
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: 价值说明 */}
      <section className="py-28 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          {/* 左文右图 */}
          <div className="flex flex-col md:flex-row items-center gap-16 mb-24">
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-[#1c1c1e] mb-4">
                不只是浏览，更是参与
              </h3>
              <p className="text-[#6e6e73] leading-relaxed">
                每一个帖子都是同学的真实经验。从课程心得到面试总结，从技术踩坑到项目展示——这里沉淀的不只是信息，是整个校园的技术记忆。你可以评论、互动、收藏，真正加入这个社区。
              </p>
            </div>
            <div className="flex-1 flex justify-center">
              <div className="w-64 h-64 bg-[#fafaf9] rounded-3xl flex items-center justify-center text-6xl shadow-sm">
                💬
              </div>
            </div>
          </div>

          {/* 左图右文（交错） */}
          <div className="flex flex-col md:flex-row-reverse items-center gap-16">
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-[#1c1c1e] mb-4">
                Markdown 编辑器，技术写作的最佳方式
              </h3>
              <p className="text-[#6e6e73] leading-relaxed">
                支持 GitHub 风格 Markdown，代码高亮、表格、图片一应俱全。写技术文章就像写代码一样自然。内容即价值，格式即态度。
              </p>
            </div>
            <div className="flex-1 flex justify-center">
              <div className="w-64 h-64 bg-[#fafaf9] rounded-3xl flex items-center justify-center text-6xl shadow-sm">
                ✍️
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: 社交证明 */}
      <section className="py-28 px-6 bg-[#fafaf9]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-[#1c1c1e] mb-4">
            加入我们
          </h2>
          <p className="text-[#6e6e73] mb-12">
            校园技术社区正在成长，来自不同年级、方向的同学都在这里
          </p>

          <div className="grid grid-cols-3 gap-8 mb-12">
            <div>
              <div className="text-4xl font-bold text-[#1c1c1e] mb-1">{total || "..."}</div>
              <div className="text-sm text-[#6e6e73]">篇帖子</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-[#1c1c1e] mb-1">{tags.length}</div>
              <div className="text-sm text-[#6e6e73]">个话题</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-[#1c1c1e] mb-1">0</div>
              <div className="text-sm text-[#6e6e73]">个日活用户</div>
            </div>
          </div>

          <Link
            href="/login"
            className="inline-block bg-orange-600 text-white px-10 py-3 rounded-full hover:bg-orange-700 transition-colors font-medium text-base"
          >
            立即加入
          </Link>
        </div>
      </section>

      {/* Section 5: 帖子列表 */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-[#1c1c1e] mb-8 text-center">
            近期帖子
          </h2>

          {posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400">暂无帖子</p>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.slice(0, 5).map((post: PostCardData) => (
                <PostCard key={post.id} {...post} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
