import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const { username, avatar, bio, tagIds } = await request.json();
    const cleanUsername = String(username || "").trim();
    const cleanAvatar = String(avatar || "").trim();
    const cleanBio = String(bio || "").trim();

    if (cleanUsername.length < 2 || cleanUsername.length > 20) {
      return NextResponse.json({ error: "昵称需要 2-20 个字符" }, { status: 400 });
    }
    if (!/^[a-zA-Z0-9_\u4e00-\u9fa5]+$/.test(cleanUsername)) {
      return NextResponse.json({ error: "昵称只能包含中英文、数字和下划线" }, { status: 400 });
    }
    if (!Array.isArray(tagIds) || tagIds.length > 5) {
      return NextResponse.json({ error: "最多选择 5 个兴趣标签" }, { status: 400 });
    }

    const existed = await db.user.findUnique({ where: { username: cleanUsername } });
    if (existed && existed.id !== session.user.id) {
      return NextResponse.json({ error: "这个昵称已被使用" }, { status: 409 });
    }

    await db.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: session.user.id },
        data: {
          username: cleanUsername,
          avatar: cleanAvatar || null,
          bio: cleanBio || null,
        },
      });

      await tx.userTag.deleteMany({ where: { userId: session.user.id } });
      if (tagIds.length > 0) {
        await tx.userTag.createMany({
          data: tagIds.map((tagId: string) => ({
            userId: session.user.id,
            tagId,
          })),
        });
      }
    });

    return NextResponse.json({ success: true, username: cleanUsername });
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 });
  }
}
