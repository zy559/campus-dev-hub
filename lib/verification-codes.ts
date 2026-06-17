import { db } from "./db";

export function generateCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

/** 存储验证码到数据库，5 分钟有效 */
export async function setCode(email: string, code: string): Promise<void> {
  const normalizedEmail = email.toLowerCase();
  await db.verificationCode.upsert({
    where: { email: normalizedEmail },
    create: {
      email: normalizedEmail,
      code,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    },
    update: {
      code,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    },
  });
}

/** 校验验证码，成功后删除 */
export async function verifyCode(email: string, code: string): Promise<boolean> {
  const normalizedEmail = email.toLowerCase();
  const entry = await db.verificationCode.findUnique({
    where: { email: normalizedEmail },
  });
  if (!entry) return false;
  if (entry.expiresAt < new Date()) {
    await db.verificationCode.delete({ where: { email: normalizedEmail } });
    return false;
  }
  if (entry.code !== code) return false;
  await db.verificationCode.delete({ where: { email: normalizedEmail } });
  return true;
}

/** 检查是否可以发送（距上次 >= 60 秒） */
export async function canSend(email: string): Promise<boolean> {
  const normalizedEmail = email.toLowerCase();
  const entry = await db.verificationCode.findUnique({
    where: { email: normalizedEmail },
  });
  if (!entry) return true;
  // 如果 5 分钟 - 60 秒内创建的，不允许重发
  const firstSendTime = new Date(entry.expiresAt.getTime() - 5 * 60 * 1000);
  return Date.now() - firstSendTime.getTime() >= 60_000;
}
