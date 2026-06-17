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

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return NextResponse.json({ error: "邮箱格式不正确" }, { status: 400 });
    }

    if (!(await canSend(normalizedEmail))) {
      return NextResponse.json({ error: "请 60 秒后再试" }, { status: 429 });
    }

    const code = generateCode();
    await setCode(normalizedEmail, code);

    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY.startsWith("re_placeholder")) {
      return NextResponse.json({ error: "邮件服务未配置，请联系管理员" }, { status: 500 });
    }

    try {
      await sendVerificationCode(normalizedEmail, code);
    } catch (emailError: unknown) {
      console.error("Send email error:", JSON.stringify(emailError));
      const err = emailError as { statusCode?: number; name?: string; message?: string };
      if (err.statusCode === 403) {
        return NextResponse.json({ error: "发件域名未验证，请在 Resend 控制台验证域名" }, { status: 500 });
      }
      if (err.statusCode === 401) {
        return NextResponse.json({ error: "API Key 无效，请检查环境变量 RESEND_API_KEY" }, { status: 500 });
      }
      return NextResponse.json({ error: `邮件发送失败：${err.message || "请稍后重试"}` }, { status: 500 });
    }

    return NextResponse.json({ message: "验证码已发送，请查收邮件" });
  } catch (error) {
    console.error("Send code error:", error);
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 });
  }
}
