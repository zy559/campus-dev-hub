import { NextResponse } from "next/server";
import { PROFILE_CARD_MARKER } from "@/lib/activitySections";
import { db } from "@/lib/db";
import { parseProfileCardPost } from "@/lib/profileCards";
import { getRequestUser } from "@/lib/wechatAuth";

interface PostTagItem {
  tag: { id: string; name: string };
}

export const dynamic = "force-dynamic";

const normalPostWhere = {
  NOT: [
    { content: { startsWith: PROFILE_CARD_MARKER } },
    { content: { startsWith: "[资料卡]" } },
    { title: { startsWith: "资料卡：" } },
  ],
};

export async function GET(request: Request) {
  try {
    const requestUser = await getRequestUser(request);
    if (!requestUser?.id) {
      return NextResponse.json({ error: "Please login first" }, { status: 401 });
    }
    if (requestUser.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const [posts, cardPosts, usersCount] = await Promise.all([
      db.post.findMany({
        where: normalPostWhere,
        include: {
          author: { select: { id: true, username: true, avatar: true } },
          tags: { include: { tag: true } },
          _count: { select: { comments: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 80,
      }),
      db.post.findMany({
        where: { content: { startsWith: PROFILE_CARD_MARKER } },
        include: {
          author: { select: { id: true, username: true, avatar: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 80,
      }),
      db.user.count(),
    ]);

    return NextResponse.json({
      usersCount,
      posts: posts.map((post) => ({
        id: post.id,
        title: post.title,
        content: post.content,
        author: post.author,
        tags: post.tags.map((pt: PostTagItem) => pt.tag),
        commentCount: post._count.comments,
        createdAt: post.createdAt,
      })),
      profileCards: cardPosts
        .map((post) => parseProfileCardPost(post))
        .filter((card): card is NonNullable<typeof card> => Boolean(card)),
    });
  } catch (error) {
    console.error("Get mini admin data error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
