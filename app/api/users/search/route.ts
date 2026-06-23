import { NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";

    if (!q.trim() || q.trim().length < 1) {
      return NextResponse.json([]);
    }

    const users = await db.user.findMany({
      where: {
        username: { contains: q.trim() },
        id: { not: session.user.id }, // exclude self
      },
      select: { id: true, username: true, avatar: true },
      take: 15,
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("User search error:", error);
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 });
  }
}
