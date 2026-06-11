import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    // 验证管理员身份
    const role = (session.user as { role?: string }).role;
    if (role !== "admin") {
      return NextResponse.json({ error: "无权操作" }, { status: 403 });
    }

    const { username } = await request.json();

    if (!username || typeof username !== "string") {
      return NextResponse.json({ error: "请输入用户名" }, { status: 400 });
    }

    const targetUser = await db.user.findUnique({
      where: { username },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "用户不存在" }, { status: 404 });
    }

    // 构建目标用户的 JWT payload，和 NextAuth authorize 返回的一致
    const userPayload = {
      id: targetUser.id,
      email: targetUser.email,
      name: targetUser.username,
      role: targetUser.role,
    };

    // 使用 NextAuth 内置的 JWT 编码
    const { encode } = await import("next-auth/jwt");

    const token = await encode({
      token: userPayload as Parameters<typeof encode>[0]["token"],
      secret: process.env.NEXTAUTH_SECRET || "",
    });

    // 构建响应，设置 session cookie
    const response = NextResponse.json({ success: true, username: targetUser.username });

    // 判断环境：生产用 __Secure 前缀，开发不用
    const isProd = process.env.NODE_ENV === "production";
    const cookieName = isProd
      ? "__Secure-next-auth.session-token"
      : "next-auth.session-token";

    response.cookies.set(cookieName, token, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60, // 30 天
    });

    return response;
  } catch (error) {
    console.error("Impersonate error:", error);
    return NextResponse.json(
      { error: "服务器内部错误" },
      { status: 500 }
    );
  }
}
