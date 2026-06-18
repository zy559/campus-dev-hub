import { db } from "./db";

export function generateCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

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

export async function verifyCode(email: string, code: string): Promise<boolean> {
  const normalizedEmail = email.toLowerCase();
  try {
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
  } catch {
    return false;
  }
}

export async function canSend(email: string): Promise<boolean> {
  const normalizedEmail = email.toLowerCase();
  const entry = await db.verificationCode.findUnique({
    where: { email: normalizedEmail },
  });
  if (!entry) return true;
  const firstSendTime = new Date(entry.expiresAt.getTime() - 5 * 60 * 1000);
  return Date.now() - firstSendTime.getTime() >= 60_000;
}
