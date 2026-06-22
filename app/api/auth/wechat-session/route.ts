import { NextResponse } from "next/server";
import { decode } from "next-auth/jwt";

/**
 * 微信小程序会话验证
 *
 * GET /api/auth/wechat-session
 * Header: Authorization: Bearer <token>
 *
 * 小程序启动时调用，校验 token 是否有效 & 返回当前用户信息。
 */
export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "未提供认证令牌" },
        { status: 401 }
      );
    }

    const token = authHeader.slice(7);
    const secret = process.env.NEXTAUTH_SECRET;

    if (!secret) {
      return NextResponse.json({ error: "服务器配置错误" }, { status: 500 });
    }

    const decoded = await decode({ token, secret });

    if (!decoded) {
      return NextResponse.json(
        { error: "令牌无效或已过期" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      user: {
        id: decoded.id || decoded.sub,
        username: (decoded as Record<string, unknown>).username || decoded.name,
        role: (decoded as Record<string, unknown>).role || "user",
      },
    });
  } catch (error) {
    console.error("[wechat-session] 服务器错误:", error);
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 });
  }
}
