import { db } from "@/lib/db";
import { PROFILE_CARD_MARKER } from "@/lib/activitySections";
import { parseProfileCardPost } from "@/lib/profileCards";
import ProfileRecommendationFeed, { ProfileCardItem } from "./ProfileRecommendationFeed";

async function getProfileCards(): Promise<ProfileCardItem[]> {
  const posts = await db.post.findMany({
    where: {
      OR: [
        { content: { startsWith: PROFILE_CARD_MARKER } },
        { content: { startsWith: "[资料卡]" } },
        { title: { startsWith: "资料卡：" } },
      ],
    },
    include: {
      author: { select: { id: true, username: true, avatar: true } },
      tags: { include: { tag: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return posts
    .map((post) => parseProfileCardPost(post))
    .filter((card): card is NonNullable<typeof card> => Boolean(card))
    .map((card) => ({
      id: card.id,
      authorId: card.author.id,
      username: card.author.username,
      name: card.name,
      meta: card.meta,
      needs: card.needs,
      interests: card.interests,
      intro: card.intro,
      images: card.cover ? [card.cover] : [],
      createdAt: card.createdAt,
    }));
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
  viewer,
}: {
  tag?: string;
  search: string;
  isBrowsing: boolean;
  viewer?: { id: string; role: string };
}) {
  const cards = await getProfileCards().catch(() => []);
  return (
    <ProfileRecommendationFeed
      cards={cards.length > 0 ? cards : fallbackCards}
      isBrowsing={isBrowsing}
      viewer={viewer}
    />
  );
}
