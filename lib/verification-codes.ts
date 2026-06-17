// 内存验证码存储 — 服务重启后所有验证码失效
// 每个邮箱同时最多一个有效验证码

interface CodeEntry {
  code: string;
  expiresAt: number;
}

const store = new Map<string, CodeEntry>();

// 清理过期条目（每 60 秒自动运行一次）
setInterval(() => {
  const now = Date.now();
  store.forEach((entry, key) => {
    if (entry.expiresAt < now) store.delete(key);
  });
}, 60_000);

/** 生成 6 位数字验证码 */
export function generateCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

/** 存储验证码，5 分钟有效 */
export function setCode(email: string, code: string): void {
  store.set(email.toLowerCase(), {
    code,
    expiresAt: Date.now() + 5 * 60 * 1000,
  });
}

/** 校验验证码，验证成功后删除 */
export function verifyCode(email: string, code: string): boolean {
  const entry = store.get(email.toLowerCase());
  if (!entry) return false;
  if (entry.expiresAt < Date.now()) {
    store.delete(email.toLowerCase());
    return false;
  }
  if (entry.code !== code) return false;
  store.delete(email.toLowerCase());
  return true;
}

/** 检查是否可以发送（距离上次发送需 >= 60 秒） */
export function canSend(email: string): boolean {
  const entry = store.get(email.toLowerCase());
  if (!entry) return true;
  // 如果有未过期验证码，不允许 60 秒内重复发送
  return (entry.expiresAt - 5 * 60 * 1000) + 60_000 < Date.now();
}
