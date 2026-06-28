import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import ProfileEditForm from "./ProfileEditForm";

export default async function ProfileEditPage({ params }: { params: { username: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");
  if (session.user.name !== params.username) redirect("/login");

  const user = await db.user.findUnique({
    where: { username: params.username },
    include: { userTags: { include: { tag: true } } },
  });
  if (!user) notFound();

  const currentTags = user.userTags.map((ut) => ut.tag.id);

  return (
    <main className="mx-auto max-w-3xl py-6 pb-24 lg:pb-8">
      <div className="mb-5">
        <p className="text-sm font-bold text-teal-700">个人资料</p>
        <h1 className="mt-1 text-3xl font-black text-slate-950">编辑个人资料</h1>
      </div>
      <ProfileEditForm
        currentUsername={user.username}
        currentAvatar={user.avatar || ""}
        currentBio={user.bio || ""}
        currentTagIds={currentTags}
      />
    </main>
  );
}
