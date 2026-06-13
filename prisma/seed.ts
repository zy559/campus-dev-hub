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

  // 板块
  for (const board of BOARDS) {
    await prisma.board.upsert({
      where: { name: board.name },
      update: {},
      create: board,
    });
  }
  console.log(`✅ 创建了 ${BOARDS.length} 个板块`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
