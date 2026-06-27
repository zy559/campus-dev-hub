export const PROFILE_CARD_MARKER = "[PROFILE_CARD]";

export const ACTIVITY_SECTIONS = [
  {
    title: "机会",
    desc: "比赛、实习、活动、项目",
    color: "bg-teal-50 text-teal-700 ring-teal-100",
    children: ["比赛组队", "实习内推", "活动讲座", "项目招募"],
  },
  {
    title: "学习",
    desc: "课程、考试、技术、问答",
    color: "bg-sky-50 text-sky-700 ring-sky-100",
    children: ["课程资料", "考研考公", "技术笔记", "问答求助"],
  },
  {
    title: "社交",
    desc: "对象、朋友、搭子、同好",
    color: "bg-cyan-50 text-cyan-700 ring-cyan-100",
    children: ["找对象", "找搭子", "运动约局", "兴趣同好"],
  },
  {
    title: "生活",
    desc: "二手、美食、吐槽、失物",
    color: "bg-amber-50 text-amber-700 ring-amber-100",
    children: ["二手闲置", "美食推荐", "校园吐槽", "失物招领"],
  },
  {
    title: "展示",
    desc: "作品、博客、项目、复盘",
    color: "bg-indigo-50 text-indigo-700 ring-indigo-100",
    children: ["作品展示", "博客文章", "简历项目", "经验复盘"],
  },
] as const;

export const ACTIVITY_TAGS = ACTIVITY_SECTIONS.flatMap((section) => [
  section.title,
  ...section.children,
]);

export function isProfileCardPost(post: { title: string; content: string }) {
  return (
    post.content.startsWith(PROFILE_CARD_MARKER) ||
    post.content.startsWith("[资料卡]") ||
    post.title.startsWith("资料卡｜")
  );
}
