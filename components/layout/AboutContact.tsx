export default function AboutContact() {
  return (
    <section className="bg-white dark:bg-slate-950 border-t border-slate-200/60 dark:border-white/5">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-24 sm:py-32">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          {/* ====== 关于我们 ====== */}
          <div className="relative">
            <h2 className="text-base font-semibold text-blue-600 dark:text-amber-400">
              关于我们
            </h2>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              关于围炉
            </p>

            <div className="mt-8 space-y-5 text-base leading-7 text-slate-600 dark:text-slate-400">
              <p>
                围炉 · Campfire 是一个由计算机系学生创建、面向全校同学的校园技术社区。我们没有投资人，没有公司背景——只有一行代码、一个想法的出发点。
              </p>
              <p>
                我们的名字来源于一个简单的画面：一群人围坐在火炉旁，有人写代码，有人聊日常，有人找队友。技术不需要冰冷，交流不需要门槛。大学的魅力，不该被信息差稀释。
              </p>
              <p>
                在这里，你可以用 Markdown 写出漂亮的课程笔记，在「寻找比赛」板块找到 Hackathon 队友，在「分享日常」分区PO出今天食堂最好吃的一餐。每一个帖子，都是校园记忆的一部分。
              </p>
              <p>
                围炉不只是一个论坛，更是你的校园技术名片。从课程心得、面试总结到项目展示——你的每一次分享，既是在帮助自己整理知识，也是在为后来的同学留下一盏灯。
              </p>
            </div>

            {/* 署名 */}
            <div className="mt-8 border-t border-slate-200 dark:border-white/10 pt-6">
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-full bg-blue-600 dark:bg-amber-500 flex items-center justify-center text-white dark:text-slate-950 font-bold text-lg">
                  R
                </div>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">Ron</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">围炉创始人</p>
                </div>
              </div>
            </div>
          </div>

          {/* ====== 联系我们 ====== */}
          <div>
            <h2 className="text-base font-semibold text-blue-600 dark:text-amber-400">
              联系我们
            </h2>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              保持联系
            </p>
            <p className="mt-4 text-base text-slate-500 dark:text-slate-400">
              有任何问题、建议、合作意向，随时联系我们。围炉还在成长，你的每一条反馈我们都认真看。
            </p>

            {/* 联系方式卡片 */}
            <div className="mt-8 rounded-2xl bg-slate-50 dark:bg-slate-800/50 ring-1 ring-slate-200 dark:ring-white/10 p-6 sm:p-8 space-y-5">
              {/* 邮箱 */}
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 size-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-slate-400 dark:text-slate-500">邮箱</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                    hello@11111w.ltd
                  </p>
                </div>
              </div>

              <hr className="border-slate-200 dark:border-white/10" />

              {/* 手机 */}
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 size-10 rounded-xl bg-green-50 dark:bg-green-500/10 flex items-center justify-center text-green-600 dark:text-green-400">
                  <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-slate-400 dark:text-slate-500">手机</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    15631706151
                  </p>
                </div>
              </div>

              <hr className="border-slate-200 dark:border-white/10" />

              {/* QQ */}
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 size-10 rounded-xl bg-sky-50 dark:bg-sky-500/10 flex items-center justify-center text-sky-600 dark:text-sky-400">
                  <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 0 1-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8Z" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-slate-400 dark:text-slate-500">QQ</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    3378815639
                  </p>
                </div>
              </div>

              <hr className="border-slate-200 dark:border-white/10" />

              {/* 反馈 */}
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 size-10 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
                  <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-400 dark:text-slate-500">反馈</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    在站内发帖提建议，或直接私信管理员
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
