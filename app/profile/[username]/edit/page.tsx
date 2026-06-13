import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import ProfileEditForm from "./ProfileEditForm";

export default async function ProfileEditPage({
  params,
}: {
  params: { username: string };
}) {
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
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold text-ink mb-6">编辑个人资料</h1>
      <ProfileEditForm
        username={user.username}
        currentBio={user.bio || ""}
        currentTagIds={currentTags}
      />
    </div>
  );
}
