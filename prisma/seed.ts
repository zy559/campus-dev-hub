import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { ACTIVITY_SECTIONS } from "../lib/activitySections";
import { buildPostContentWithImages } from "../lib/postMedia";
import { buildProfileCardContent, type ProfileCardInput } from "../lib/profileCards";

const prisma = new PrismaClient();

const DEFAULT_PASSWORD = "Test123456";

const BASE_TAGS = [
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
  "水贴",
];

const LEGACY_BOARDS = [
  { name: "寻找比赛", description: "找队友、打比赛、组队信息", sortOrder: 0 },
  { name: "学习知识", description: "课程笔记、技术分享、学习资源", sortOrder: 1 },
  { name: "分享日常", description: "校园生活、日常趣事、心情分享", sortOrder: 2 },
  { name: "综合讨论", description: "其他话题讨论", sortOrder: 3 },
];

const YEAR_OPTIONS = ["大一", "大二", "大三", "大四"] as const;

const PROFILE_PHOTOS = [
  "https://ts1.tc.mm.bing.net/th/id/OIP-C.OFaxaBGqwj_TyYVxJ3DNMAHaHa?w=193&h=193&c=8&rs=1&qlt=90&o=6&dpr=1.7&pid=3.1&rm=2",
  "https://ts1.tc.mm.bing.net/th/id/OIP-C.OFaxaBGqwj_TyYVxJ3DNMAHaHa?w=193&h=193&c=8&rs=1&qlt=90&o=6&dpr=1.7&pid=3.1&rm=2",
  "https://ts1.tc.mm.bing.net/th/id/OIP-C.Z5VTFoniC3maHn8XZ-rN4gAAAA?w=193&h=193&c=8&rs=1&qlt=90&o=6&dpr=1.7&pid=3.1&rm=2",
  "https://ts1.tc.mm.bing.net/th/id/OIP-C.Z5VTFoniC3maHn8XZ-rN4gAAAA?w=193&h=193&c=8&rs=1&qlt=90&o=6&dpr=1.7&pid=3.1&rm=2",
  "https://ts1.tc.mm.bing.net/th/id/OIP-C.feiMlSAgm6nu8Q7Io3HJJAHaHS?w=193&h=191&c=8&rs=1&qlt=90&o=6&dpr=1.7&pid=3.1&rm=2",
  "https://ts1.tc.mm.bing.net/th/id/OIP-C.56YobZDz2Daz6_olk5_JGQAAAA?w=193&h=193&c=8&rs=1&qlt=90&o=6&dpr=1.7&pid=3.1&rm=2",
  "https://ts1.tc.mm.bing.net/th/id/OIP-C.3Jp8amy_hPwr64ftFOW3VgHaHa?w=193&h=193&c=8&rs=1&qlt=90&o=6&dpr=1.7&pid=3.1&rm=2",
  "https://ts1.tc.mm.bing.net/th/id/OIP-C.QrOiz_hJqlk0H76LGadKGgHaHa?w=193&h=193&c=8&rs=1&qlt=90&o=6&dpr=1.7&pid=3.1&rm=2",
  "https://tse2-mm.cn.bing.net/th/id/OIP-C.JmnbOMCwiCwAKi89izfpeQHaHa?w=197&h=197&c=7&r=0&o=7&dpr=1.7&pid=1.7&rm=3",
  "https://tse1-mm.cn.bing.net/th/id/OIP-C.f9cRfTzlnRzPAtV095IS0QHaHa?w=158&h=180&c=7&r=0&o=7&dpr=1.7&pid=1.7&rm=3",
];

const POST_IMAGES = [
  "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1492538368677-f6e0afe31dcc?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80",
];

interface SeedUser {
  username: string;
  gender: "男" | "女";
  year: (typeof YEAR_OPTIONS)[number];
  major: string;
  photo: string;
  needs: string[];
  interests: string[];
  intro: string;
}

const PROFILE_USERS: SeedUser[] = [
  {
    username: "林间代码",
    gender: "男",
    year: "大三",
    major: "软件工程",
    photo: PROFILE_PHOTOS[0],
    needs: ["比赛组队", "项目招募", "技术交流"],
    interests: ["前端", "跑步", "摄影"],
    intro: "平时写 React 和小程序比较多，想找能一起做校园工具的同学。希望别只停在想法，能每周推进一点点。",
  },
  {
    username: "月亮便利店",
    gender: "女",
    year: "大二",
    major: "数字媒体技术",
    photo: PROFILE_PHOTOS[1],
    needs: ["找搭子", "兴趣同好", "作品展示"],
    interests: ["摄影", "剪辑", "探店"],
    intro: "喜欢拍校园日常和做短视频，想认识审美在线、执行力也在线的朋友。周末可以一起扫街或者拍作品集。",
  },
  {
    username: "不熬夜的舟",
    gender: "男",
    year: "大一",
    major: "计算机科学与技术",
    photo: PROFILE_PHOTOS[2],
    needs: ["课程资料", "问答求助", "找搭子"],
    interests: ["C语言", "羽毛球", "英语"],
    intro: "刚开始适应大学节奏，想找一起自习和打球的人。本人不卷王，但希望每天都比昨天清楚一点。",
  },
  {
    username: "橘子海盐",
    gender: "女",
    year: "大四",
    major: "网络与新媒体",
    photo: PROFILE_PHOTOS[3],
    needs: ["简历项目", "经验复盘", "实习内推"],
    interests: ["运营", "写作", "咖啡"],
    intro: "正在准备秋招和作品集，可以交换简历修改、面试复盘。也欢迎低年级同学问实习准备。",
  },
  {
    username: "风里有栈",
    gender: "男",
    year: "大二",
    major: "物联网工程",
    photo: PROFILE_PHOTOS[4],
    needs: ["项目招募", "比赛组队", "技术笔记"],
    interests: ["硬件", "Python", "骑行"],
    intro: "想做一个校园空教室/设备借用的小项目，缺前端和产品同学。可以一起参加互联网+或挑战杯。",
  },
  {
    username: "小熊不摆烂",
    gender: "女",
    year: "大一",
    major: "英语",
    photo: PROFILE_PHOTOS[5],
    needs: ["找朋友", "运动约局", "美食推荐"],
    interests: ["口语", "瑜伽", "甜品"],
    intro: "想认识能一起吃饭、散步、练口语的朋友。社恐但会努力接话，熟了之后很能聊。",
  },
  {
    username: "凌晨两点半",
    gender: "男",
    year: "大四",
    major: "数据科学与大数据技术",
    photo: PROFILE_PHOTOS[6],
    needs: ["考研考公", "经验复盘", "问答求助"],
    interests: ["机器学习", "自习", "篮球"],
    intro: "考研党，想找稳定自习搭子，互相监督但不制造焦虑。也可以交流数学和专业课资料。",
  },
  {
    username: "南风知我意",
    gender: "女",
    year: "大三",
    major: "视觉传达设计",
    photo: PROFILE_PHOTOS[7],
    needs: ["作品展示", "项目招募", "兴趣同好"],
    interests: ["UI设计", "插画", "展览"],
    intro: "想找开发同学合作做一个完整产品 demo，我负责界面和视觉。也欢迎一起看展、互相改作品。",
  },
  {
    username: "今天也调试",
    gender: "男",
    year: "大二",
    major: "软件工程",
    photo: PROFILE_PHOTOS[8],
    needs: ["技术笔记", "比赛组队", "问答求助"],
    interests: ["后端", "数据库", "乒乓球"],
    intro: "Java 后端入门中，最近在学 Spring 和数据库。想找队友做一个能真正上线的小项目。",
  },
  {
    username: "一颗汽水糖",
    gender: "女",
    year: "大二",
    major: "市场营销",
    photo: PROFILE_PHOTOS[9],
    needs: ["活动讲座", "找搭子", "校园吐槽"],
    interests: ["策划", "音乐节", "手账"],
    intro: "喜欢做活动策划，也想认识不同专业的朋友。希望一起把校园活动做得更有意思一点。",
  },
  {
    username: "山河不晚",
    gender: "男",
    year: "大三",
    major: "电子信息工程",
    photo: PROFILE_PHOTOS[10],
    needs: ["比赛组队", "项目招募", "简历项目"],
    interests: ["嵌入式", "无人机", "健身"],
    intro: "准备做一个低成本巡线小车项目，缺算法和文档同学。认真做事，沟通直接，不画大饼。",
  },
  {
    username: "桃桃乌龙",
    gender: "女",
    year: "大一",
    major: "会计学",
    photo: PROFILE_PHOTOS[11],
    needs: ["课程资料", "找对象", "美食推荐"],
    interests: ["自习", "甜品", "电影"],
    intro: "想找一起自习、吃饭、看电影的人。希望从朋友慢慢认识，真诚一点就很好。",
  },
  {
    username: "海盐星球",
    gender: "男",
    year: "大二",
    major: "人工智能",
    photo: PROFILE_PHOTOS[12],
    needs: ["技术笔记", "问答求助", "博客文章"],
    interests: ["深度学习", "阅读", "桌游"],
    intro: "喜欢把学过的东西写成笔记，想找能互相讲题和分享论文的同学。也欢迎一起打桌游。",
  },
  {
    username: "夏天的回声",
    gender: "女",
    year: "大三",
    major: "心理学",
    photo: PROFILE_PHOTOS[13],
    needs: ["兴趣同好", "活动讲座", "经验复盘"],
    interests: ["心理学", "播客", "散步"],
    intro: "想组织一个轻量读书/播客讨论小组，不需要很学术，主要是认真听别人说话。",
  },
  {
    username: "北极星同学",
    gender: "男",
    year: "大四",
    major: "自动化",
    photo: PROFILE_PHOTOS[14],
    needs: ["实习内推", "简历项目", "经验复盘"],
    interests: ["控制算法", "面试", "羽毛球"],
    intro: "已经拿到一段实习，愿意分享投递和面试经验。也想找同学一起模拟面试。",
  },
  {
    username: "晚风邮差",
    gender: "女",
    year: "大二",
    major: "法学",
    photo: PROFILE_PHOTOS[15],
    needs: ["考研考公", "课程资料", "找朋友"],
    interests: ["辩论", "阅读", "慢跑"],
    intro: "法学专业，最近在准备竞赛和普通话。想找规律学习的朋友，也可以一起跑步放松。",
  },
  {
    username: "键盘小岛",
    gender: "男",
    year: "大一",
    major: "网络工程",
    photo: PROFILE_PHOTOS[16],
    needs: ["问答求助", "课程资料", "找搭子"],
    interests: ["Linux", "游戏", "吉他"],
    intro: "想找一起入门 Linux 和网络基础的同学，互相救命。晚上也可以一起练吉他或开黑。",
  },
  {
    username: "雾岛听雨",
    gender: "女",
    year: "大四",
    major: "汉语言文学",
    photo: PROFILE_PHOTOS[17],
    needs: ["博客文章", "作品展示", "经验复盘"],
    interests: ["写作", "摄影", "博物馆"],
    intro: "想把大学四年的写作和摄影整理成作品集。欢迎互相看稿、改标题、聊表达。",
  },
  {
    username: "纸飞机实验室",
    gender: "男",
    year: "大三",
    major: "机械设计制造及其自动化",
    photo: PROFILE_PHOTOS[18],
    needs: ["项目招募", "比赛组队", "二手闲置"],
    interests: ["3D打印", "建模", "排球"],
    intro: "实验室有一些 3D 打印经验，想找人做校园文创小产品。缺设计、运营和拍照同学。",
  },
  {
    username: "柠檬气泡",
    gender: "女",
    year: "大三",
    major: "环境设计",
    photo: PROFILE_PHOTOS[19],
    needs: ["找对象", "兴趣同好", "美食推荐"],
    interests: ["空间设计", "咖啡", "Citywalk"],
    intro: "喜欢逛街区、拍建筑、找小店。想认识生活节奏舒服的人，朋友或更进一步都顺其自然。",
  },
];

const POST_SEEDS = ACTIVITY_SECTIONS.flatMap((section, sectionIndex) =>
  [
    {
      tag: section.title,
      title: `${section.title}区先打个样：这个板块可以这样用`,
      content: `感觉${section.title}相关的信息以前太分散了，发在这里会清楚很多。大家可以把时间、地点、需要什么人写明白，后面找起来也方便。`,
      image: POST_IMAGES[sectionIndex % POST_IMAGES.length],
    },
    ...section.children.map((tag, childIndex) => ({
      tag,
      title: buildPostTitle(tag),
      content: buildPostContent(tag),
      image: (sectionIndex + childIndex) % 2 === 0 ? POST_IMAGES[(sectionIndex + childIndex) % POST_IMAGES.length] : "",
    })),
  ]
);

function buildPostTitle(tag: string) {
  const titles: Record<string, string> = {
    比赛组队: "蓝桥杯/小程序方向还缺 1 个前端队友",
    实习内推: "整理了一份实习投递表，想互相监督投递",
    活动讲座: "周三晚上的 AI 分享会有人一起去吗",
    项目招募: "想做校园空教室查询，缺产品和前端",
    课程资料: "数据结构复习资料我整理好了，可以互换",
    考研考公: "找早八自习搭子，图书馆二楼固定位置",
    技术笔记: "把 Git 常用命令整理成了一页纸",
    问答求助: "数据库实验卡在触发器这里了，有人懂吗",
    找对象: "认真认识一个人，从聊天和散步开始",
    找搭子: "想找健身/自习/吃饭搭子，别只收藏不行动",
    运动约局: "今晚操场慢跑 3 公里，有人一起吗",
    兴趣同好: "有没有喜欢拍照和剪 vlog 的同学",
    二手闲置: "出一个九成新机械键盘，宿舍自取",
    美食推荐: "北门新开的砂锅真的可以试试",
    校园吐槽: "希望大家占座能留个时间条",
    失物招领: "捡到一张校园卡，在三教一楼",
    作品展示: "做了一个校园活动海报，求建议",
    博客文章: "写了篇从 0 做小程序登录的记录",
    简历项目: "简历项目缺亮点？可以一起互改",
    经验复盘: "第一次参加比赛踩坑复盘，给后来人避雷",
  };
  return titles[tag] || `${tag}相关信息集中帖`;
}

function buildPostContent(tag: string) {
  const contents: Record<string, string> = {
    比赛组队: "目前两个人，一个负责后端，一个负责文档和答辩。希望再来一个会页面或小程序的同学，目标是把 demo 做完整，不只停在 PPT。",
    实习内推: "不是正式内推哈，主要是大家把岗位、截止时间、投递状态放到一个表里，互相提醒。想加入的可以评论专业和方向。",
    活动讲座: "主题是 AI 工具和学习效率，地点在图书馆报告厅。一个人去有点容易鸽，想找同学一起听完顺便讨论。",
    项目招募: "想做一个能查空教室、约自习、顺手反馈设备问题的小工具。先做 MVP，不搞大而全，欢迎有想法的同学一起。",
    课程资料: "资料是按章节整理的，包含重点题型和老师上课提到的易错点。希望交换操作系统或概率论资料。",
    考研考公: "时间大概是每天 8:00-11:30，互不打扰，主要是到点互相提醒。偶尔可以一起吃饭放松一下。",
    技术笔记: "很多同学第一次协作项目会卡在 Git，我整理了 clone、branch、commit、pull request 的最小流程，有需要我发评论区。",
    问答求助: "触发器能建出来，但插入数据后结果不对。我把 SQL 截图放下面了，愿意请一杯奶茶求指点。",
    找对象: "先说明一下：不急着确定关系，想认真认识。平时喜欢散步、电影和自习，希望对方真诚、稳定、有边界感。",
    找搭子: "主要想找能真的约出来的人，自习、健身、吃饭都行。本人不社牛，但不放鸽子。",
    运动约局: "配速很慢，主打出汗和坚持。地点操场入口，晚上 8 点开始，跑完可以一起拉伸。",
    兴趣同好: "最近想拍一个校园夜景短片，缺出镜/运镜/剪辑都可以。没有设备也没关系，手机就能拍。",
    二手闲置: "键盘是青轴，声音偏清脆，介意室友睡觉的慎入。价格可小刀，最好今晚或明天中午交易。",
    美食推荐: "点了番茄肥牛砂锅，汤底比预期好，米饭也够。缺点是饭点排队，建议错峰。",
    校园吐槽: "不是不让占座，但如果离开很久可以留个纸条写返回时间。大家都互相方便一点。",
    失物招领: "校园卡姓王，尾号 27。已经交到三教一楼值班室，失主带证件去领就行。",
    作品展示: "第一次尝试做偏清爽的校园活动海报，感觉标题层级还有点乱。欢迎从排版、配色、信息顺序上提建议。",
    博客文章: "记录了微信登录从 code 到后端换 openid，再到本地 token 存储的流程。写给和我一样刚开始做小程序的人。",
    简历项目: "我发现很多简历的问题不是项目少，而是写得像课程作业。想找几位同学互相改项目描述和量化结果。",
    经验复盘: "最大教训是太晚开始做可运行 demo，前期一直讨论方案。下次会先做最小闭环，再慢慢美化。",
  };
  return contents[tag] || "这个标签下先放一条样例内容，方便测试筛选、详情和评论流程。";
}

function emailFor(username: string) {
  return `seed_${encodeURIComponent(username).replace(/%/g, "").toLowerCase()}@weiluo.local`;
}

function seedId(prefix: string, value: string | number) {
  const normalized = String(value)
    .normalize("NFKD")
    .replace(/[^\w-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
  const fallback = Buffer.from(String(value)).toString("hex").slice(0, 16);
  return `${prefix}-${normalized || fallback}`;
}

async function upsertTag(name: string) {
  return prisma.tag.upsert({
    where: { name },
    update: {},
    create: { name },
  });
}

async function upsertBoard(name: string, description: string, sortOrder: number, parentId?: string) {
  return prisma.board.upsert({
    where: { name },
    update: { description, sortOrder, parentId },
    create: { name, description, sortOrder, parentId },
  });
}

async function upsertUser(user: SeedUser, passwordHash: string) {
  return prisma.user.upsert({
    where: { username: user.username },
    update: {
      avatar: user.photo,
      bio: `${user.year} · ${user.major} · ${user.gender}`,
      emailVerified: true,
    },
    create: {
      username: user.username,
      email: emailFor(user.username),
      password: passwordHash,
      avatar: user.photo,
      bio: `${user.year} · ${user.major} · ${user.gender}`,
      emailVerified: true,
    },
  });
}

async function replacePostTags(postId: string, tagNames: string[]) {
  await prisma.postTag.deleteMany({ where: { postId } });
  for (const name of Array.from(new Set(tagNames.filter(Boolean)))) {
    await prisma.postTag.create({
      data: {
        post: { connect: { id: postId } },
        tag: { connectOrCreate: { where: { name }, create: { name } } },
      },
    });
  }
}

async function upsertProfileCard(user: SeedUser, authorId: string) {
  const input: ProfileCardInput = {
    name: user.username,
    meta: `${user.year} · ${user.major}`,
    intro: user.intro,
    needs: user.needs,
    interests: user.interests,
    cover: user.photo,
  };
  const title = `Profile Card: ${user.username}`;
  const id = seedId("seed-card", user.username);
  const post = await prisma.post.upsert({
    where: { id },
    update: {
      title,
      content: buildProfileCardContent(input),
      authorId,
    },
    create: {
      id,
      title,
      content: buildProfileCardContent(input),
      authorId,
    },
  });

  await replacePostTags(post.id, ["Profile Card", ...user.needs, ...user.interests]);
}

async function upsertActivityPost(seed: (typeof POST_SEEDS)[number], authorId: string, index: number) {
  const title = seed.title;
  const content = buildPostContentWithImages(seed.content, seed.image ? [seed.image] : []);
  const post = await prisma.post.upsert({
    where: { id: seedId("seed-post", index) },
    update: {
      title,
      content,
      authorId,
    },
    create: {
      id: seedId("seed-post", index),
      title,
      content,
      authorId,
    },
  });

  await replacePostTags(post.id, [seed.tag]);
}

async function main() {
  console.log("开始填充围炉测试数据...");

  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);
  const activityTags = ACTIVITY_SECTIONS.flatMap((section) => [section.title, ...section.children]);
  const allTags = Array.from(new Set([...BASE_TAGS, ...activityTags, "Profile Card"]));

  for (const tag of allTags) {
    await upsertTag(tag);
  }
  console.log(`已创建/更新 ${allTags.length} 个标签`);

  for (const board of LEGACY_BOARDS) {
    await upsertBoard(board.name, board.description, board.sortOrder);
  }

  for (let sectionIndex = 0; sectionIndex < ACTIVITY_SECTIONS.length; sectionIndex += 1) {
    const section = ACTIVITY_SECTIONS[sectionIndex];
    const parent = await upsertBoard(section.title, section.desc, sectionIndex);
    for (let childIndex = 0; childIndex < section.children.length; childIndex += 1) {
      const child = section.children[childIndex];
      await upsertBoard(child, `${section.title} · ${child}`, childIndex, parent.id);
    }
  }
  console.log(`已创建/更新 ${ACTIVITY_SECTIONS.length} 个父栏目和 ${activityTags.length - ACTIVITY_SECTIONS.length} 个子栏目`);

  const users = [];
  for (const userSeed of PROFILE_USERS) {
    const user = await upsertUser(userSeed, passwordHash);
    users.push(user);
    await upsertProfileCard(userSeed, user.id);
  }
  console.log(`已创建/更新 ${PROFILE_USERS.length} 个虚拟资料卡，男女各 ${PROFILE_USERS.length / 2} 个`);

  for (let index = 0; index < POST_SEEDS.length; index += 1) {
    const postSeed = POST_SEEDS[index];
    const author = users[index % users.length];
    await upsertActivityPost(postSeed, author.id, index);
  }
  console.log(`已创建/更新 ${POST_SEEDS.length} 条动态，覆盖所有父栏目和子标签`);

  console.log(`完成。虚拟用户默认密码：${DEFAULT_PASSWORD}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
