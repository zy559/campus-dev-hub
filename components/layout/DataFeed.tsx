import { db } from "@/lib/db";
import { PROFILE_CARD_MARKER } from "@/lib/activitySections";
import ProfileRecommendationFeed, { ProfileCardItem } from "./ProfileRecommendationFeed";

function extractImages(content: string) {
  return Array.from(content.matchAll(/!\[[^\]]*\]\(([^)]+)\)/g)).map((match) => match[1]);
}

function readField(content: string, label: string) {
  const line = content.split("\n").find((item) => item.startsWith(`${label}：`));
  return line?.replace(`${label}：`, "").trim() || "";
}

function readIntro(content: string) {
  return content
    .split("\n")
    .filter((line) => {
      const trimmed = line.trim();
      return (
        trimmed &&
        trimmed !== PROFILE_CARD_MARKER &&
        !trimmed.startsWith("昵称：") &&
        !trimmed.startsWith("学校：") &&
        !trimmed.startsWith("想找：") &&
        !trimmed.startsWith("兴趣：") &&
        !trimmed.startsWith("![")
      );
    })
    .join("\n")
    .trim();
}

async function getProfileCards(): Promise<ProfileCardItem[]> {
  const posts = await db.post.findMany({
    where: {
      OR: [
        { content: { startsWith: PROFILE_CARD_MARKER } },
        { content: { startsWith: "[资料卡]" } },
        { title: { startsWith: "资料卡｜" } },
      ],
    },
    include: {
      author: { select: { id: true, username: true, avatar: true } },
      tags: { include: { tag: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return posts.map((post) => {
    const needs = readField(post.content, "想找");
    const interests = readField(post.content, "兴趣");
    return {
      id: post.id,
      authorId: post.author.id,
      username: post.author.username,
      name: readField(post.content, "昵称") || post.title.replace("资料卡｜", "") || post.author.username,
      meta: readField(post.content, "学校") || "校园同学",
      needs: needs ? needs.split("、").filter(Boolean) : post.tags.map((item) => item.tag.name).slice(0, 3),
      interests: interests ? interests.split("、").filter(Boolean) : post.tags.map((item) => item.tag.name).slice(0, 4),
      intro: readIntro(post.content) || "这个同学暂时还没有填写更多介绍，可以先礼貌开口聊聊。",
      images: extractImages(post.content),
      createdAt: post.createdAt.toISOString(),
    };
  });
}

const fallbackCards: ProfileCardItem[] = [
  {
    id: "demo-1",
    authorId: "",
    username: "demo",
    name: "林同学",
    meta: "大三 · 计算机",
    needs: ["找比赛队友", "找自习搭子", "项目搭子"],
    interests: ["前端", "羽毛球", "摄影", "数学建模"],
    intro: "最近想做一个校园小项目，也在准备比赛。希望找到认真但不内耗的队友，一起把事情推进。",
    images: [],
    createdAt: new Date().toISOString(),
  },
  {
    id: "demo-2",
    authorId: "",
    username: "demo",
    name: "周同学",
    meta: "研一 · 经管",
    needs: ["找对象", "找朋友", "找饭搭子"],
    interests: ["电影", "美食", "跑步", "音乐"],
    intro: "生活圈比较简单，想认识能一起吃饭、看电影、聊学习和未来计划的人。",
    images: [],
    createdAt: new Date().toISOString(),
  },
];

export default async function DataFeed({
  isBrowsing,
}: {
  tag?: string;
  search: string;
  isBrowsing: boolean;
}) {
  const cards = await getProfileCards().catch(() => []);
  return <ProfileRecommendationFeed cards={cards.length > 0 ? cards : fallbackCards} isBrowsing={isBrowsing} />;
}
