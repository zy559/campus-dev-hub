import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import AdminPanel from "./AdminPanel";
import { authOptions } from "@/lib/auth";
import { buildAdminMonitorMetrics } from "@/lib/adminMetrics";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const EMPTY_METRICS = {
  totalUsers: 0,
  totalPosts: 0,
  totalComments: 0,
  totalConversations: 0,
  newUsers7d: 0,
  newPosts7d: 0,
  newComments7d: 0,
  newConversations7d: 0,
  recentUsers: [],
  boardPostCounts: [],
};

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  if (session.user.role !== "admin") {
    return (
      <main className="mx-auto max-w-4xl px-4 py-20 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-2xl text-red-500">
          !
        </div>
        <h1 className="text-xl font-semibold text-ink">无权访问</h1>
        <p className="mt-2 text-sm text-muted">该页面仅管理员可见。</p>
      </main>
    );
  }

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [
    users,
    totalUsers,
    totalPosts,
    totalComments,
    totalConversations,
    newUsers7d,
    newPosts7d,
    newComments7d,
    newConversations7d,
    recentUsers,
    boards,
  ] = await Promise.all([
    db.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        warned: true,
        muted: true,
        bannedUntil: true,
        createdAt: true,
        _count: { select: { posts: true, comments: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    db.user.count(),
    db.post.count(),
    db.comment.count(),
    db.conversation.count(),
    db.user.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    db.post.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    db.comment.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    db.conversation.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    db.user.findMany({
      select: { createdAt: true },
      orderBy: { createdAt: "desc" },
      take: 80,
    }),
    db.board.findMany({
      select: {
        name: true,
        _count: { select: { posts: true } },
      },
      orderBy: { sortOrder: "asc" },
    }),
  ]).catch(() => [
    [],
    EMPTY_METRICS.totalUsers,
    EMPTY_METRICS.totalPosts,
    EMPTY_METRICS.totalComments,
    EMPTY_METRICS.totalConversations,
    EMPTY_METRICS.newUsers7d,
    EMPTY_METRICS.newPosts7d,
    EMPTY_METRICS.newComments7d,
    EMPTY_METRICS.newConversations7d,
    EMPTY_METRICS.recentUsers,
    [],
  ] as const);

  const monitor = buildAdminMonitorMetrics({
    totalUsers,
    totalPosts,
    totalComments,
    totalConversations,
    newUsers7d,
    newPosts7d,
    newComments7d,
    newConversations7d,
    recentUsers,
    boardPostCounts: boards
      .map((board) => ({ name: board.name, count: board._count.posts }))
      .filter((board) => board.count > 0)
      .sort((a, b) => b.count - a.count),
  });

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-accent">Admin Monitor</p>
          <h1 className="mt-1 text-2xl font-bold text-ink">管理员监控面板</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted">
            用最小数据三件套观察流量、内容热度与核心转化，同时保留用户治理入口。
          </p>
        </div>
        <div className="rounded-full border border-border bg-surface-alt px-4 py-2 text-xs text-muted">
          仅管理员可见
        </div>
      </div>

      <AdminPanel
        monitor={monitor}
        users={users.map((user) => ({
          ...user,
          bannedUntil: user.bannedUntil?.toISOString() ?? null,
          createdAt: user.createdAt.toISOString(),
          postCount: user._count.posts,
          commentCount: user._count.comments,
        }))}
      />
    </main>
  );
}
