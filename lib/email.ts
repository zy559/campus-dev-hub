import { Resend } from "resend";

const FROM = process.env.RESEND_FROM || "围炉 Campfire <onboarding@resend.dev>";

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey.startsWith("re_placeholder")) {
    throw new Error("RESEND_API_KEY is not configured");
  }
  return new Resend(apiKey);
}

export async function sendVerificationCode(to: string, code: string) {
  const resend = getResendClient();
  const { data, error } = await resend.emails.send({
    from: FROM,
    to,
    subject: "围炉 Campfire - 邮箱验证码",
    html: `
      <div style="max-width:480px;margin:0 auto;padding:32px 24px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#1e293b">
        <h1 style="font-size:24px;margin:0 0 24px">围炉 Campfire</h1>
        <p style="font-size:16px;line-height:1.7;margin:0 0 24px;color:#475569">你的邮箱验证码是：</p>
        <div style="background:#f8fafc;border-radius:12px;padding:24px;text-align:center;margin:0 0 24px">
          <span style="font-size:36px;font-weight:700;letter-spacing:6px;color:#0f172a">${code}</span>
        </div>
        <p style="font-size:14px;color:#94a3b8;line-height:1.6;margin:0 0 8px">验证码 5 分钟内有效，请勿转发给他人。</p>
        <p style="font-size:14px;color:#94a3b8;line-height:1.6;margin:0">如果这不是你的操作，请忽略这封邮件。</p>
      </div>
    `,
  });

  if (error) throw error;
  return data;
}

export async function sendResetLink(to: string, token: string) {
  const resend = getResendClient();
  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;

  const { data, error } = await resend.emails.send({
    from: FROM,
    to,
    subject: "围炉 Campfire - 重置密码",
    html: `
      <div style="max-width:480px;margin:0 auto;padding:32px 24px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#1e293b">
        <h1 style="font-size:24px;margin:0 0 24px">围炉 Campfire</h1>
        <p style="font-size:16px;line-height:1.7;margin:0 0 24px;color:#475569">收到你的密码重置请求。点击下方按钮设置新密码：</p>
        <a href="${resetUrl}" style="display:inline-block;background:#0d9488;color:#fff;padding:14px 32px;border-radius:999px;text-decoration:none;font-weight:600;font-size:16px;margin:0 0 24px">
          重置密码
        </a>
        <p style="font-size:14px;color:#94a3b8;line-height:1.6;margin:0 0 8px">
          或者复制这个链接到浏览器：<br />
          <span style="color:#64748b">${resetUrl}</span>
        </p>
        <p style="font-size:14px;color:#94a3b8;line-height:1.6;margin:0">此链接 30 分钟内有效。如果这不是你的操作，请忽略。</p>
      </div>
    `,
  });

  if (error) throw error;
  return data;
}
