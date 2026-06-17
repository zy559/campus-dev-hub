import { NextResponse } from "next/server";
import { sendVerificationCode } from "@/lib/email";
import { generateCode, setCode, canSend } from "@/lib/verification-codes";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "请输入邮箱地址" }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // 简单邮箱格式校验
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return NextResponse.json({ error: "邮箱格式不正确" }, { status: 400 });
    }

    // 防刷：60 秒内不允许重复
    if (!canSend(normalizedEmail)) {
      return NextResponse.json(
        { error: "请 60 秒后再试" },
        { status: 429 }
      );
    }

    // 生成验证码并存储
    const code = generateCode();
    setCode(normalizedEmail, code);

    // 尝试发送邮件
    try {
      await sendVerificationCode(normalizedEmail, code);
    } catch (emailError: unknown) {
      console.error("Send email error:", emailError);
      const err = emailError as { statusCode?: number; message?: string };
      // Resend 限制 / API key 未配置
      if (err.statusCode === 403 || err.statusCode === 401) {
        return NextResponse.json(
          { error: "邮件服务未配置，请联系管理员" },
          { status: 500 }
        );
      }
      return NextResponse.json(
        { error: "邮件发送失败，请稍后重试" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "验证码已发送，请查收邮件" });
  } catch (error) {
    console.error("Send code error:", error);
    return NextResponse.json(
      { error: "服务器内部错误" },
      { status: 500 }
    );
  }
}
