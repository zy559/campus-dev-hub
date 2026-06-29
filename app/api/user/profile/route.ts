import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getRequestUser } from "@/lib/wechatAuth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const requestUser = await getRequestUser(request);
    if (!requestUser?.id) {
      return NextResponse.json({ error: "Please login first" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: requestUser.id },
      select: { id: true, username: true, avatar: true, bio: true, role: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Get profile error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const requestUser = await getRequestUser(request);
    if (!requestUser?.id) {
      return NextResponse.json({ error: "Please login first" }, { status: 401 });
    }

    const { username, avatar, bio, tagIds } = await request.json();
    const cleanUsername = String(username || "").trim();
    const cleanAvatar = String(avatar || "").trim();
    const cleanBio = String(bio || "").trim();

    if (cleanUsername.length < 2 || cleanUsername.length > 20) {
      return NextResponse.json({ error: "Nickname must be 2-20 characters" }, { status: 400 });
    }
    if (!/^[a-zA-Z0-9_\u4e00-\u9fa5]+$/.test(cleanUsername)) {
      return NextResponse.json({ error: "Nickname can only contain Chinese, English, numbers and underscores" }, { status: 400 });
    }
    if (!Array.isArray(tagIds) || tagIds.length > 5) {
      return NextResponse.json({ error: "Choose at most 5 interest tags" }, { status: 400 });
    }

    const existed = await db.user.findUnique({ where: { username: cleanUsername } });
    if (existed && existed.id !== requestUser.id) {
      return NextResponse.json({ error: "Nickname already used" }, { status: 409 });
    }

    await db.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: requestUser.id },
        data: {
          username: cleanUsername,
          avatar: cleanAvatar || null,
          bio: cleanBio || null,
        },
      });

      await tx.userTag.deleteMany({ where: { userId: requestUser.id } });
      if (tagIds.length > 0) {
        await tx.userTag.createMany({
          data: tagIds.map((tagId: string) => ({
            userId: requestUser.id,
            tagId,
          })),
        });
      }
    });

    return NextResponse.json({ success: true, username: cleanUsername });
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
