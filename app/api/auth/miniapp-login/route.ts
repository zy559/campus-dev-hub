import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { encode } from "next-auth/jwt";

/**
 * 小程序账号密码登录（不依赖微信）
 *
 * POST /api/auth/miniapp-login
 * Body: { username: string, password: string }
 * Returns: { token: string, user: {...} }
 *
 * 与 wechat-login 不同，这个端点:
 * 1) 不需要微信 code
 * 2) 直接验用户名+密码
 * 3) 签发相同的 JWT 格式
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const username = String(body.username || "").trim();
    const password = String(body.password || "");

    if (!username || !password) {
      return NextResponse.json(
        { error: "请输入用户名和密码" },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({
      where: { username },
      select: { id: true, username: true, email: true, password: true, role: true, avatar: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "用户名或密码错误" },
        { status: 401 }
      );
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return NextResponse.json(
        { error: "用户名或密码错误" },
        { status: 401 }
      );
    }

    if (user.password) {
      // 被封禁检查
      const fullUser = await db.user.findUnique({ where: { id: user.id }, select: { bannedUntil: true } });
      if (fullUser?.bannedUntil && new Date(fullUser.bannedUntil) > new Date()) {
        const days = Math.ceil((fullUser.bannedUntil.getTime() - Date.now()) / 86400000);
        return NextResponse.json(
          { error: `账号已被封禁，剩余 ${days} 天` },
          { status: 403 }
        );
      }
    }

    const secret = process.env.NEXTAUTH_SECRET;
    if (!secret) {
      return NextResponse.json({ error: "服务器配置错误" }, { status: 500 });
    }

    const maxAge = 30 * 24 * 60 * 60;
    const token = await encode({
      token: {
        id: user.id,
        name: user.username,
        username: user.username,
        email: user.email,
        role: user.role,
        sub: user.id,
      },
      secret,
      maxAge,
    });

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error("[miniapp-login] error:", error);
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 });
  }
}
