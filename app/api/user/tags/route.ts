import { NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const userTags = await db.userTag.findMany({
      where: { userId: session.user.id },
      include: { tag: true },
    });

    return NextResponse.json(
      userTags.map((ut) => ({ id: ut.tag.id, name: ut.tag.name }))
    );
  } catch (error) {
    console.error("Get user tags error:", error);
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const { tagIds } = await request.json();
    if (!Array.isArray(tagIds) || tagIds.length > 5) {
      return NextResponse.json(
        { error: "请选择最多 5 个标签" },
        { status: 400 }
      );
    }

    // 删除旧标签
    await db.userTag.deleteMany({ where: { userId: session.user.id } });

    // 创建新标签
    if (tagIds.length > 0) {
      await db.userTag.createMany({
        data: tagIds.map((tagId: string) => ({
          userId: session.user.id,
          tagId,
        })),
      });
    }

    const userTags = await db.userTag.findMany({
      where: { userId: session.user.id },
      include: { tag: true },
    });

    return NextResponse.json(
      userTags.map((ut) => ({ id: ut.tag.id, name: ut.tag.name }))
    );
  } catch (error) {
    console.error("Update user tags error:", error);
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 });
  }
}
