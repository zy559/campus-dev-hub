import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendResetLink } from "@/lib/email";

function generateToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "请输入邮箱地址" }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // 查找用户
    const user = await db.user.findUnique({
      where: { email: normalizedEmail },
    });

    // 即使邮箱不存在也返回成功（防止枚举攻击）
    if (!user) {
      return NextResponse.json({
        message: "如果该邮箱已注册，你将会收到一封重置密码的邮件",
      });
    }

    // 生成 token（Web Crypto）
    const resetToken = generateToken();
    const resetTokenExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 分钟

    await db.user.update({
      where: { id: user.id },
      data: { resetToken, resetTokenExpires },
    });

    // 发送重置邮件
    try {
      await sendResetLink(normalizedEmail, resetToken);
    } catch (emailError) {
      console.error("Send reset email error:", emailError);
      // 即使邮件发送失败，token 已存，用户可以重试
      return NextResponse.json(
        { error: "邮件发送失败，请稍后重试" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "如果该邮箱已注册，你将会收到一封重置密码的邮件",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "服务器内部错误" },
      { status: 500 }
    );
  }
}
