import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { RegisterSchema } from "@/lib/validators";
import { verifyCode } from "@/lib/verification-codes";
import { encode } from "next-auth/jwt";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = RegisterSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "输入数据无效", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { username, email, password, tagIds, code } = parsed.data;
    const normalizedEmail = email.trim().toLowerCase();

    if (!code || typeof code !== "string") {
      return NextResponse.json({ error: "请输入邮箱验证码" }, { status: 400 });
    }

    if (!(await verifyCode(normalizedEmail, code))) {
      return NextResponse.json({ error: "验证码错误或已过期" }, { status: 400 });
    }

    const existingUsername = await db.user.findUnique({ where: { username } });
    if (existingUsername) {
      return NextResponse.json({ error: "用户名已被注册" }, { status: 409 });
    }

    const existingEmail = await db.user.findUnique({ where: { email: normalizedEmail } });
    if (existingEmail) {
      return NextResponse.json({ error: "邮箱已被注册" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await db.user.create({
      data: {
        username,
        email: normalizedEmail,
        password: hashedPassword,
        emailVerified: true,
        avatar: null,
        bio: null,
        userTags: tagIds?.length
          ? { create: tagIds.map((tagId: string) => ({ tagId })) }
          : undefined,
      },
    });

    const secret = process.env.NEXTAUTH_SECRET;
    if (!secret) {
      return NextResponse.json({ error: "服务器配置错误" }, { status: 500 });
    }

    const maxAge = 30 * 24 * 60 * 60; // 30 days
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

    // NextAuth 4 在 HTTPS 生产环境用 __Secure- 前缀
    const isProd = process.env.NODE_ENV === "production" || process.env.VERCEL === "1";
    const cookieName = isProd
      ? "__Secure-next-auth.session-token"
      : "next-auth.session-token";
    const secureFlag = isProd ? "; Secure" : "";

    const response = NextResponse.json({
      success: true,
      user: { id: user.id, username: user.username, email: user.email },
    });
    response.headers.set(
      "Set-Cookie",
      `${cookieName}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secureFlag}`
    );

    return response;
  } catch (error) {
    console.error("[register-with-login] error:", error);
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 });
  }
}
