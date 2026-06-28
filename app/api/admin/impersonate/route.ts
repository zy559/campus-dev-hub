import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { encode } from "next-auth/jwt";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

type SessionTokenPayload = Record<string, unknown> & { id: string };

function sessionCookieName() {
  return process.env.NODE_ENV === "production" ? "__Secure-next-auth.session-token" : "next-auth.session-token";
}

async function writeSessionCookie(tokenPayload: SessionTokenPayload, body: Record<string, unknown> = { success: true }) {
  const token = await encode({
    token: tokenPayload,
    secret: process.env.NEXTAUTH_SECRET || "",
  });

  const response = NextResponse.json(body);
  const isProd = process.env.NODE_ENV === "production";
  response.cookies.set(sessionCookieName(), token, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: 30 * 24 * 60 * 60,
  });
  return response;
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    if (session.user.role !== "admin" || session.user.impersonating) {
      return NextResponse.json({ error: "无权操作" }, { status: 403 });
    }

    const { userId, username } = await request.json();
    const targetUser = await db.user.findFirst({
      where: userId ? { id: String(userId) } : { username: String(username || "") },
      select: { id: true, username: true, email: true, role: true },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "用户不存在" }, { status: 404 });
    }

    if (targetUser.id === session.user.id) {
      return NextResponse.json({ error: "不能模拟自己" }, { status: 400 });
    }

    return writeSessionCookie(
      {
        id: targetUser.id,
        sub: targetUser.id,
        username: targetUser.username,
        name: targetUser.username,
        email: targetUser.email,
        role: targetUser.role,
        impersonating: true,
        impersonatorId: session.user.id,
        impersonatorName: session.user.name,
        impersonatorRole: session.user.role,
      },
      { success: true, username: targetUser.username }
    );
  } catch (error) {
    console.error("Impersonate error:", error);
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.impersonating || !session.user.impersonatorId) {
      return NextResponse.json({ error: "当前不在模拟登录状态" }, { status: 400 });
    }

    if (session.user.impersonatorRole !== "admin") {
      return NextResponse.json({ error: "无权操作" }, { status: 403 });
    }

    const admin = await db.user.findUnique({
      where: { id: session.user.impersonatorId },
      select: { id: true, username: true, email: true, role: true },
    });

    if (!admin || admin.role !== "admin") {
      return NextResponse.json({ error: "管理员账号不存在" }, { status: 404 });
    }

    return writeSessionCookie({
      id: admin.id,
      sub: admin.id,
      username: admin.username,
      name: admin.username,
      email: admin.email,
      role: admin.role,
    });
  } catch (error) {
    console.error("Stop impersonation error:", error);
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 });
  }
}
