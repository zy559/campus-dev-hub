import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

interface PostTagItem {
  tag: { id: string; name: string };
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const post = await db.post.findUnique({
      where: { id: params.id },
      include: {
        author: {
          select: { id: true, username: true, avatar: true, bio: true },
        },
        tags: {
          include: { tag: true },
        },
        _count: { select: { comments: true } },
      },
    });

    if (!post) {
      return NextResponse.json({ error: "帖子不存在" }, { status: 404 });
    }

    return NextResponse.json({
      id: post.id,
      title: post.title,
      content: post.content,
      author: post.author,
      tags: post.tags.map((pt: PostTagItem) => pt.tag),
      commentCount: post._count.comments,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    });
  } catch (error) {
    console.error("Get post error:", error);
    return NextResponse.json(
      { error: "服务器内部错误" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const post = await db.post.findUnique({ where: { id: params.id } });
    if (!post) {
      return NextResponse.json({ error: "帖子不存在" }, { status: 404 });
    }

    const isAdmin = (session.user as { role?: string }).role === "admin";
    const isAuthor = post.authorId === session.user.id;

    if (!isAdmin && !isAuthor) {
      return NextResponse.json({ error: "无权删除此帖子" }, { status: 403 });
    }

    await db.post.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 });
  }
}
