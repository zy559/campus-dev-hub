/**
 * Deterministic avatar color from username.
 * Same username always returns the same gradient — consistent visual identity.
 */
const AVATAR_PALETTE = [
  "oklch(0.66 0.22 45)",  // warm orange (brand)
  "oklch(0.58 0.18 240)", // blue
  "oklch(0.55 0.17 160)", // teal
  "oklch(0.56 0.20 320)", // magenta
  "oklch(0.52 0.18 80)",  // green
  "oklch(0.54 0.19 280)", // violet
  "oklch(0.60 0.20 20)",  // red-orange
  "oklch(0.50 0.16 200)", // cyan
];

export function avatarColor(username: string): string {
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash; // Convert to 32-bit int
  }
  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length];
}

/**
 * Relative time in Chinese.
 * "刚刚" / "3 分钟前" / "2 小时前" / "昨天" / "3 天前" / "6月10日"
 */
export function relativeTime(dateString: string): string {
  const now = Date.now();
  const then = new Date(dateString).getTime();
  const diffMs = now - then;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return "刚刚";
  if (diffMin < 60) return `${diffMin} 分钟前`;
  if (diffHr < 24) return `${diffHr} 小时前`;
  if (diffDay === 1) return "昨天";
  if (diffDay < 7) return `${diffDay} 天前`;
  if (diffDay < 30) return `${Math.floor(diffDay / 7)} 周前`;

  return new Date(dateString).toLocaleDateString("zh-CN", {
    month: "numeric",
    day: "numeric",
  });
}

/**
 * Format date for detail pages — full locale date.
 */
export function fullDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
