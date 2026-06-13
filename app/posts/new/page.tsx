import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import PostForm from "@/components/posts/PostForm";

export const dynamic = 'force-dynamic';

export default async function NewPostPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="py-6">
      <h1 className="text-3xl font-bold text-ink mb-8">发布新帖子</h1>
      <PostForm />
    </div>
  );
}
