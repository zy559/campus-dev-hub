import { NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { db } from "@/lib/db";
import { PostSchema } from "@/lib/validators";

interface PostTagItem {
  tag: { id: string; name: string };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tag = searchParams.get("tag");
    const boardId = searchParams.get("boardId");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(20, Math.max(1, parseInt(searchParams.get("limit") || "10")));
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (tag) where.tags = { some: { tag: { name: tag } } };
    if (boardId) where.boardId = boardId;

    const [posts, total] = await Promise.all([
      db.post.findMany({
        where,
        include: {
          author: {
            select: { id: true, username: true, avatar: true },
          },
          tags: {
            include: { tag: true },
          },
          board: { select: { id: true, name: true } },
          _count: { select: { comments: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      db.post.count({ where }),
    ]);

    const formattedPosts = posts.map((post) => ({
      id: post.id,
      title: post.title,
      content: post.content.slice(0, 300),
      author: post.author,
      tags: post.tags.map((pt: PostTagItem) => pt.tag),
      board: post.board ?? undefined,
      commentCount: post._count.comments,
      createdAt: post.createdAt,
    }));

    return NextResponse.json({
      posts: formattedPosts,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Get posts error:", error);
    return NextResponse.json(
      { error: "服务器内部错误" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSessionFromRequest(request);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "请先登录" },
        { status: 401 }
      );
    }

    // 检查是否被禁言
    const user = await db.user.findUnique({ where: { id: session.user.id }, select: { muted: true } });
    if (user?.muted) {
      return NextResponse.json(
        { error: "你已被禁言，暂时无法发帖" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = PostSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "输入数据无效", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { title, content, tagIds, boardId } = parsed.data;

    const post = await db.post.create({
      data: {
        title,
        content,
        boardId: boardId || null,
        authorId: session.user.id,
        tags: {
          create: tagIds.map((tagId: string) => ({
            tag: { connect: { id: tagId } },
          })),
        },
      },
      include: {
        author: {
          select: { id: true, username: true, avatar: true },
        },
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error("Create post error:", error);
    return NextResponse.json(
      { error: "服务器内部错误" },
      { status: 500 }
    );
  }
}
