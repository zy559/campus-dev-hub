import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import ImpersonateClient from "./ImpersonateClient";

export default async function AdminImpersonatePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "admin" || session.user.impersonating) redirect("/me");

  return (
    <main className="mx-auto max-w-2xl py-5 pb-24 lg:pb-8">
      <div className="mb-4">
        <p className="text-sm font-bold text-amber-700">管理员</p>
        <h1 className="text-3xl font-black text-slate-950">模拟登录用户</h1>
        <p className="mt-2 text-sm text-slate-600">手机端也可以在这里输入用户名，直接进入对应用户账号。</p>
      </div>
      <ImpersonateClient />
    </main>
  );
}
