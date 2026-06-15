import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DEFAULT_TAGS = [
  "前端",
  "后端",
  "算法",
  "AI/ML",
  "操作系统",
  "计算机网络",
  "数据库",
  "编程语言",
  "项目实战",
  "面试经验",
  "学习笔记",
  "求队友",
  "课程评价",
  "工具推荐",
  "水帖",
];

const USER_INTEREST_TAGS = [
  "打比赛",
  "学习",
  "创业",
  "项目实战",
  "刷题",
  "实习",
  "读研",
  "出国",
];

const BOARDS = [
  { name: "寻找比赛", description: "找队友、打比赛、组队信息", sortOrder: 0 },
  { name: "学习知识", description: "课程笔记、技术分享、学习资源", sortOrder: 1 },
  { name: "分享日常", description: "校园生活、日常趣事、心情分享", sortOrder: 2 },
  { name: "综合讨论", description: "其他话题讨论", sortOrder: 3 },
];

const DAILY_SUB_BOARDS = [
  { name: "🍜 美食推荐", description: "食堂探店、外卖测评、周边美食推荐", sortOrder: 0 },
  { name: "🏀 运动健身", description: "约球组队、跑步打卡、健身交流", sortOrder: 1 },
  { name: "🎮 游戏娱乐", description: "开黑组队、游戏攻略、赛事讨论", sortOrder: 2 },
  { name: "📸 摄影随拍", description: "校园风景、日常记录、手机摄影分享", sortOrder: 3 },
  { name: "🎬 影视音乐", description: "电影推荐、追番讨论、歌单分享", sortOrder: 4 },
  { name: "💬 心情杂谈", description: "吐槽专区、树洞、心情随笔", sortOrder: 5 },
  { name: "🎉 活动聚会", description: "社团活动、线下聚会、志愿者招募", sortOrder: 6 },
  { name: "🛒 二手好物", description: "闲置转卖、求购、好物推荐", sortOrder: 7 },
];

async function main() {
  console.log("🌱 开始种子数据...");

  // 帖子标签
  for (const name of DEFAULT_TAGS) {
    await prisma.tag.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
  console.log(`✅ 创建了 ${DEFAULT_TAGS.length} 个帖子标签`);

  // 用户兴趣标签
  for (const name of USER_INTEREST_TAGS) {
    await prisma.tag.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
  console.log(`✅ 创建了 ${USER_INTEREST_TAGS.length} 个用户兴趣标签`);

  // 主板块
  for (const board of BOARDS) {
    await prisma.board.upsert({
      where: { name: board.name },
      update: {},
      create: board,
    });
  }
  console.log(`✅ 创建了 ${BOARDS.length} 个主板块`);

  // 日常子板块 — 挂在「分享日常」下
  const dailyBoard = await prisma.board.findUnique({ where: { name: "分享日常" } });
  if (dailyBoard) {
    for (const sub of DAILY_SUB_BOARDS) {
      await prisma.board.upsert({
        where: { name: sub.name },
        update: { parentId: dailyBoard.id },
        create: { ...sub, parentId: dailyBoard.id },
      });
    }
    console.log(`✅ 创建了 ${DAILY_SUB_BOARDS.length} 个日常子板块`);
  } else {
    console.log("⚠️ 未找到「分享日常」板块，跳过子板块创建");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
