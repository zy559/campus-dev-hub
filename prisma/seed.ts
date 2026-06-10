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

async function main() {
  console.log("🌱 开始种子数据...");

  for (const name of DEFAULT_TAGS) {
    await prisma.tag.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  console.log(`✅ 创建了 ${DEFAULT_TAGS.length} 个标签`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
