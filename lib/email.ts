import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// Resend 免费版：需要验证发件域名。未验证域名的可以先用 resend.dev 开发模式
const FROM = process.env.RESEND_FROM || "围炉 Campfire <onboarding@resend.dev>";

export async function sendVerificationCode(to: string, code: string) {
  const { data, error } = await resend.emails.send({
    from: FROM,
    to,
    subject: "围炉 · Campfire — 邮箱验证码",
    html: `
      <div style="max-width:480px;margin:0 auto;padding:32px 24px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#1e293b">
        <h1 style="font-size:24px;margin:0 0 24px">🔥 围炉 · Campfire</h1>
        <p style="font-size:16px;line-height:1.7;margin:0 0 24px;color:#475569">
          你的邮箱验证码是：
        </p>
        <div style="background:#f8fafc;border-radius:12px;padding:24px;text-align:center;margin:0 0 24px">
          <span style="font-size:36px;font-weight:700;letter-spacing:6px;color:#0f172a">${code}</span>
        </div>
        <p style="font-size:14px;color:#94a3b8;line-height:1.6;margin:0 0 8px">
          验证码 5 分钟内有效，请勿转发给他人。
        </p>
        <p style="font-size:14px;color:#94a3b8;line-height:1.6;margin:0">
          如果这不是你的操作，请忽略这封邮件。
        </p>
        <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0" />
        <p style="font-size:12px;color:#cbd5e1;margin:0">
          围炉 · Campfire — 技术有温度，写代码也写日常
        </p>
      </div>
    `,
  });

  if (error) throw error;
  return data;
}

/**
 * 发送密码重置链接
 */
export async function sendResetLink(to: string, token: string) {
  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;

  const { data, error } = await resend.emails.send({
    from: FROM,
    to,
    subject: "围炉 · Campfire — 重置密码",
    html: `
      <div style="max-width:480px;margin:0 auto;padding:32px 24px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#1e293b">
        <h1 style="font-size:24px;margin:0 0 24px">🔥 围炉 · Campfire</h1>
        <p style="font-size:16px;line-height:1.7;margin:0 0 24px;color:#475569">
          收到你的密码重置请求。点击下方按钮设置新密码：
        </p>
        <a href="${resetUrl}" style="display:inline-block;background:#e67e22;color:#fff;padding:14px 32px;border-radius:999px;text-decoration:none;font-weight:600;font-size:16px;margin:0 0 24px">
          重置密码
        </a>
        <p style="font-size:14px;color:#94a3b8;line-height:1.6;margin:0 0 8px">
          或者复制这个链接到浏览器：<br />
          <span style="color:#64748b">${resetUrl}</span>
        </p>
        <p style="font-size:14px;color:#94a3b8;line-height:1.6;margin:0">
          此链接 30 分钟内有效。如果这不是你的操作，请忽略。
        </p>
        <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0" />
        <p style="font-size:12px;color:#cbd5e1;margin:0">
          围炉 · Campfire — 技术有温度，写代码也写日常
        </p>
      </div>
    `,
  });

  if (error) throw error;
  return data;
}
