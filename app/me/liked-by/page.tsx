import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";

export default async function LikedByPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  return (
    <main className="mx-auto max-w-3xl py-5 pb-24 lg:pb-8">
      <div className="mb-4">
        <p className="text-sm font-bold text-teal-700">我的</p>
        <h1 className="text-3xl font-black text-slate-950">喜欢我的</h1>
      </div>
      <section className="rounded-2xl border border-slate-200/80 bg-white/88 p-8 text-center shadow-sm backdrop-blur">
        <p className="text-sm text-slate-600">当前喜欢关系先保存在本地，后续接入数据库后这里会展示真实喜欢你的人。</p>
        <Link href="/" className="mt-5 inline-flex rounded-full bg-teal-600 px-5 py-2 text-sm font-bold text-white">
          去完善资料卡
        </Link>
      </section>
    </main>
  );
}
