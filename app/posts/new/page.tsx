import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import PostForm from "@/components/posts/PostForm";
import ProfileCardForm from "@/components/posts/ProfileCardForm";

export const dynamic = "force-dynamic";

export default async function NewPostPage({
  searchParams,
}: {
  searchParams: { type?: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const isProfileCard = searchParams.type === "card" || searchParams.type === "meet";

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-[#f7f8fb] px-4 py-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 rounded-[1.75rem] bg-white p-6 shadow-sm ring-1 ring-slate-100">
          <p className={`text-sm font-black ${isProfileCard ? "text-pink-500" : "text-teal-600"}`}>
            {isProfileCard ? "资料卡" : "动态"}
          </p>
          <h1 className="mt-1 text-3xl font-black tracking-normal text-slate-950">
            {isProfileCard ? "发布资料卡" : "发布动态"}
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            {isProfileCard
              ? "用于推荐页展示自己，让同学可以根据资料卡发起聊天。"
              : "用于发布机会、组队、学习、生活和作品内容。"}
          </p>
        </div>

        {isProfileCard ? <ProfileCardForm /> : <PostForm />}
      </div>
    </main>
  );
}
