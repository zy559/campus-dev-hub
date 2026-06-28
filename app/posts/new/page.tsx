import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { PROFILE_CARD_MARKER } from "@/lib/activitySections";
import PostForm from "@/components/posts/PostForm";
import ProfileCardForm, { ProfileCardFormInitialValue } from "@/components/posts/ProfileCardForm";

export const dynamic = "force-dynamic";

function extractImages(content: string) {
  return Array.from(content.matchAll(/!\[[^\]]*\]\(([^)]+)\)/g)).map((match) => match[1]);
}

function readField(content: string, label: string) {
  const line = content.split("\n").find((item) => item.startsWith(`${label}：`));
  return line?.replace(`${label}：`, "").trim() || "";
}

function readIntro(content: string) {
  return content
    .split("\n")
    .filter((line) => {
      const trimmed = line.trim();
      return (
        trimmed &&
        trimmed !== PROFILE_CARD_MARKER &&
        !trimmed.startsWith("昵称：") &&
        !trimmed.startsWith("学校：") &&
        !trimmed.startsWith("想找：") &&
        !trimmed.startsWith("兴趣：") &&
        !trimmed.startsWith("![")
      );
    })
    .join("\n")
    .trim();
}

async function getProfileCardInitialValue(postId: string, userId: string, role?: string): Promise<ProfileCardFormInitialValue> {
  const post = await db.post.findUnique({ where: { id: postId } });
  if (!post) notFound();
  if (post.authorId !== userId && role !== "admin") notFound();
  if (!post.content.startsWith(PROFILE_CARD_MARKER) && !post.title.startsWith("资料卡：")) notFound();

  const needs = readField(post.content, "想找");
  const interests = readField(post.content, "兴趣");
  return {
    postId: post.id,
    nickname: readField(post.content, "昵称") || post.title.replace("资料卡：", ""),
    school: readField(post.content, "学校"),
    needs: needs ? needs.split("、").filter(Boolean) : [],
    interests: interests ? interests.split("、").filter(Boolean) : [],
    intro: readIntro(post.content),
    images: extractImages(post.content),
  };
}

export default async function NewPostPage({
  searchParams,
}: {
  searchParams: { type?: string; edit?: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const isProfileCard = searchParams.type === "card" || searchParams.type === "meet";
  const initialValue =
    isProfileCard && searchParams.edit
      ? await getProfileCardInitialValue(searchParams.edit, session.user.id, session.user.role)
      : undefined;

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-transparent px-4 py-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 rounded-2xl bg-white/75 p-6 shadow-sm ring-1 ring-white/70 backdrop-blur-xl">
          <p className="text-sm font-black text-teal-700">{isProfileCard ? "资料卡" : "动态"}</p>
          <h1 className="mt-1 text-3xl font-black tracking-normal text-slate-950">
            {isProfileCard ? (initialValue ? "编辑资料卡" : "发布资料卡") : "发布动态"}
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            {isProfileCard
              ? "用于推荐页展示自己，让同学可以根据资料卡发起聊天。"
              : "用于发布机会、组队、学习、生活和作品内容。"}
          </p>
        </div>

        {isProfileCard ? <ProfileCardForm initialValue={initialValue} /> : <PostForm />}
      </div>
    </main>
  );
}
