import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import AdminPanel from "./AdminPanel";
export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");
  if ((session.user as { role?: string }).role !== "admin") {
    return (
      <div className="max-w-4xl mx-auto py-20 px-4 text-center">
        <div className="text-5xl mb-4">🔒</div>
        <p className="text-muted text-lg">无权访问</p>
      </div>
    );
  }

  // 获取最近用户列表
  const users = await db.user.findMany({
    select: {
      id: true, username: true, email: true, role: true,
      warned: true, muted: true, bannedUntil: true,
      createdAt: true,
      _count: { select: { posts: true, comments: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold text-ink mb-2">管理面板</h1>
      <p className="text-muted mb-8">管理用户、审核内容</p>
      <AdminPanel users={users.map(u => ({
        ...u,
        bannedUntil: u.bannedUntil?.toISOString() ?? null,
        createdAt: u.createdAt.toISOString(),
        postCount: u._count.posts,
        commentCount: u._count.comments,
      }))} />
    </div>
  );
}
