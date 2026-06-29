import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { PostSchema } from "@/lib/validators";
import { getRequestUser } from "@/lib/wechatAuth";

interface PostTagItem {
  tag: { id: string; name: string };
}

export const dynamic = "force-dynamic";

function canManagePost(user: { id: string; role: string } | null, post: { authorId: string }) {
  return Boolean(user && (user.role === "admin" || user.id === post.authorId));
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const [requestUser, post] = await Promise.all([
      getRequestUser(request),
      db.post.findUnique({
        where: { id: params.id },
        include: {
          author: { select: { id: true, username: true, avatar: true, bio: true } },
          tags: { include: { tag: true } },
          _count: { select: { comments: true } },
        },
      }),
    ]);

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: post.id,
      title: post.title,
      content: post.content,
      author: post.author,
      authorId: post.authorId,
      tags: post.tags.map((pt: PostTagItem) => pt.tag),
      commentCount: post._count.comments,
      canDelete: canManagePost(requestUser, post),
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    });
  } catch (error) {
    console.error("Get post error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const requestUser = await getRequestUser(request);
    if (!requestUser?.id) {
      return NextResponse.json({ error: "Please login first" }, { status: 401 });
    }

    const post = await db.post.findUnique({ where: { id: params.id } });
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (!canManagePost(requestUser, post)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = PostSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { title, content, tagIds, tagNames, boardId } = parsed.data;
    const cleanTagNames = Array.from(new Set((tagNames || []).map((name) => name.trim()).filter(Boolean))).slice(0, 8);

    await db.postTag.deleteMany({ where: { postId: params.id } });
    const updated = await db.post.update({
      where: { id: params.id },
      data: {
        title,
        content,
        boardId: boardId || null,
        tags: {
          create: [
            ...tagIds.map((tagId: string) => ({ tag: { connect: { id: tagId } } })),
            ...cleanTagNames.map((name) => ({
              tag: { connectOrCreate: { where: { name }, create: { name } } },
            })),
          ],
        },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update post error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const requestUser = await getRequestUser(request);
    if (!requestUser?.id) {
      return NextResponse.json({ error: "Please login first" }, { status: 401 });
    }

    const post = await db.post.findUnique({ where: { id: params.id } });
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (!canManagePost(requestUser, post)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await db.post.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete post error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
