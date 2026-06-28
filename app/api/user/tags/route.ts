import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const userTags = await db.userTag.findMany({
      where: { userId: session.user.id },
      include: { tag: true },
    });

    return NextResponse.json(userTags.map((ut) => ({ id: ut.tag.id, name: ut.tag.name })));
  } catch (error) {
    console.error("Get user tags error:", error);
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const { tagIds } = await request.json();
    if (!Array.isArray(tagIds) || tagIds.length > 5) {
      return NextResponse.json({ error: "最多选择 5 个标签" }, { status: 400 });
    }

    await db.userTag.deleteMany({ where: { userId: session.user.id } });

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

    return NextResponse.json(userTags.map((ut) => ({ id: ut.tag.id, name: ut.tag.name })));
  } catch (error) {
    console.error("Update user tags error:", error);
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 });
  }
}
