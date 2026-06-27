const contacts = [
  ["邮箱", "hello@11111w.ltd"],
  ["手机", "15631706151"],
  ["QQ", "3378815639"],
];

export default function AboutContact() {
  return (
    <section className="bg-slate-50 py-20 dark:bg-slate-900/40 sm:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="text-sm font-semibold text-blue-600 dark:text-amber-400">关于围炉</p>
            <h2 className="mt-3 text-3xl font-bold tracking-normal text-slate-950 dark:text-white sm:text-4xl">
              一个从校园真实需求出发的伙伴社区
            </h2>
            <div className="mt-6 space-y-4 text-base leading-7 text-slate-600 dark:text-slate-400">
              <p>
                围炉 · Campfire 面向学校学生，帮助大家找到志同道合的伙伴：一起参加比赛、做项目、刷题学习，也分享自己的经验和作品。
              </p>
              <p>
                我们希望它不像传统论坛那样松散，也不像陌生人交友软件那样只看头像。围炉更关心一个人正在做什么、擅长什么、想和谁一起成长。
              </p>
              <p>
                这里的每一篇博客、每一次组队、每个兴趣标签，都会逐渐组成你的校园名片。
              </p>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 dark:bg-slate-950 dark:ring-white/10 sm:p-8">
            <p className="text-sm font-semibold text-blue-600 dark:text-amber-400">保持联系</p>
            <h3 className="mt-3 text-2xl font-bold text-slate-950 dark:text-white">欢迎建议、合作和反馈</h3>
            <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-400">
              如果你希望围炉增加某个校园场景，或者发现体验问题，可以随时联系。
            </p>

            <div className="mt-8 space-y-4">
              {contacts.map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 px-4 py-3 dark:bg-white/[0.04]">
                  <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</span>
                  <span className="text-sm font-bold text-slate-950 dark:text-white">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
