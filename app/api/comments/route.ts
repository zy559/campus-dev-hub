import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { CommentSchema } from "@/lib/validators";
import { getRequestUser } from "@/lib/wechatAuth";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get("postId");

    if (!postId) {
      return NextResponse.json(
        { error: "缺少 postId 参数" },
        { status: 400 }
      );
    }

    const comments = await db.comment.findMany({
      where: { postId },
      include: {
        author: {
          select: { id: true, username: true, avatar: true },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(comments);
  } catch (error) {
    console.error("Get comments error:", error);
    return NextResponse.json(
      { error: "服务器内部错误" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const requestUser = await getRequestUser(request);

    if (!requestUser?.id) {
      return NextResponse.json(
        { error: "请先登录" },
        { status: 401 }
      );
    }

    // 检查是否被禁言
    const user = await db.user.findUnique({ where: { id: requestUser.id }, select: { muted: true } });
    if (user?.muted) {
      return NextResponse.json(
        { error: "你已被禁言，暂时无法评论" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = CommentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "输入数据无效", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { content } = parsed.data;
    const postId = body.postId as string;

    const post = await db.post.findUnique({ where: { id: postId } });
    if (!post) {
      return NextResponse.json(
        { error: "帖子不存在" },
        { status: 404 }
      );
    }

    const comment = await db.comment.create({
      data: {
        content,
        postId,
        authorId: requestUser.id,
      },
      include: {
        author: {
          select: { id: true, username: true, avatar: true },
        },
      },
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error("Create comment error:", error);
    return NextResponse.json(
      { error: "服务器内部错误" },
      { status: 500 }
    );
  }
}
