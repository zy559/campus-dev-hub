import Link from "next/link";

export default function RightSidebar() {
  return (
    <aside className="w-[280px] flex-shrink-0 hidden xl:block pt-6 bg-surface-alt/30">
      <div className="sticky top-20 space-y-5 pr-6 pl-3">
        {/* 关于社区 */}
        <div className="rounded-xl p-5 bg-surface border border-border">
          <h3 className="text-base font-semibold text-ink mb-2">关于社区</h3>
          <p className="text-sm text-muted leading-relaxed">
            校园技术交流社区 — CS 同学的专属空间。分享知识、展示项目、找到队友。
          </p>
          <div className="flex gap-4 mt-3 text-sm text-subtle">
            <span>📝 帖子</span>
            <span>👥 同学</span>
            <span>🏫 校园</span>
          </div>
        </div>

        {/* 活动 / 新闻 */}
        <div className="rounded-xl p-5 bg-surface border border-border">
          <h3 className="text-base font-semibold text-ink mb-3">社区动态</h3>
          <ul className="space-y-3 text-sm text-muted">
            <li className="flex gap-2">
              <span className="text-accent flex-shrink-0">●</span>
              <span>欢迎新同学加入社区</span>
            </li>
            <li className="flex gap-2">
              <span className="text-accent flex-shrink-0">●</span>
              <span>「学习知识」板块已开放</span>
            </li>
            <li className="flex gap-2">
              <span className="text-accent flex-shrink-0">●</span>
              <span>Markdown 编辑器支持图片上传</span>
            </li>
          </ul>
        </div>

        {/* 广告位 */}
        <div className="rounded-xl p-5 bg-surface border border-border text-center">
          <p className="text-sm text-subtle mb-2">广告位</p>
          <div className="h-32 rounded-lg bg-surface-alt flex items-center justify-center border border-border">
            <span className="text-sm text-subtle">投放广告</span>
          </div>
          <Link href="/premium" className="block mt-3 text-sm text-accent hover:text-accent-hover transition-colors">
            了解会员 →
          </Link>
        </div>
      </div>
    </aside>
  );
}
