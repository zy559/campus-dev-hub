import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { RegisterSchema } from "@/lib/validators";
import { verifyCode } from "@/lib/verification-codes";

// 服务器端签名 session JWT（不经过 NextAuth CSRF）
// 使用与 NextAuth 相同的 secret，session 格式兼容
import { encode } from "next-auth/jwt";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("[register-with-login] body keys:", Object.keys(body));
    const parsed = RegisterSchema.safeParse(body);

    if (!parsed.success) {
      const errors = parsed.error.flatten().fieldErrors;
      console.log("[register-with-login] zod fail:", JSON.stringify(errors));
      return NextResponse.json(
        { error: "输入数据无效", details: errors },
        { status: 400 }
      );
    }

    const { username, email, password, tagIds, code } = parsed.data;
    console.log("[register-with-login] parsed:", { username, email: email.slice(0, 3) + "..." });

    // 校验验证码
    const normalizedEmail = email.trim().toLowerCase();
    if (!code || typeof code !== "string") {
      return NextResponse.json({ error: "请输入邮箱验证码" }, { status: 400 });
    }

    const codeValid = await verifyCode(normalizedEmail, code);
    console.log("[register-with-login] code valid:", codeValid);
    if (!codeValid) {
      return NextResponse.json({ error: "验证码错误或已过期" }, { status: 400 });
    }

    // 查重
    const existingUsername = await db.user.findUnique({ where: { username } });
    if (existingUsername) {
      return NextResponse.json({ error: "用户名已被注册" }, { status: 409 });
    }

    const existingEmail = await db.user.findUnique({ where: { email: normalizedEmail } });
    if (existingEmail) {
      return NextResponse.json({ error: "邮箱已被注册" }, { status: 409 });
    }

    // 创建用户
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

    console.log("[register-with-login] user created:", user.id);

    // 直接生成 session JWT（跳过 NextAuth authorize/CSRF）
    const secret = process.env.NEXTAUTH_SECRET;
    if (!secret) {
      return NextResponse.json(
        { error: "服务器配置错误" },
        { status: 500 }
      );
    }

    const maxAge = 30 * 24 * 60 * 60; // 30 天
    const token = await encode({
      token: {
        id: user.id,
        name: user.username,
        email: user.email,
        role: user.role,
        sub: user.id,
      },
      secret,
      maxAge,
    });

    // 设置 cookie
    const cookieValue = `next-auth.session-token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}`;
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });

    response.headers.set("Set-Cookie", cookieValue);
    console.log("[register-with-login] success, cookie set");
    return response;
  } catch (error) {
    console.error("[register-with-login] error:", error);
    return NextResponse.json(
      { error: "服务器内部错误" },
      { status: 500 }
    );
  }
}
