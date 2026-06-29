import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import {
  buildProfileCardContent,
  parseProfileCardPost,
} from "@/lib/profileCards";
import { PROFILE_CARD_MARKER } from "@/lib/activitySections";
import { getRequestUser } from "@/lib/wechatAuth";

const ProfileCardSchema = z.object({
  name: z.string().min(1).max(40),
  meta: z.string().max(80).optional(),
  intro: z.string().min(1).max(800),
  needs: z.array(z.string().min(1).max(24)).max(6).default([]),
  interests: z.array(z.string().min(1).max(24)).max(6).default([]),
  cover: z.string().max(500).optional(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const limit = Math.min(30, Math.max(1, parseInt(searchParams.get("limit") || "20")));

    const posts = await db.post.findMany({
      where: {
        ...(id ? { id } : {}),
        content: { startsWith: PROFILE_CARD_MARKER },
      },
      include: {
        author: { select: { id: true, username: true, avatar: true } },
      },
      orderBy: { createdAt: "desc" },
      take: id ? 1 : limit,
    });

    const cards = posts
      .map((post) => parseProfileCardPost(post))
      .filter((card): card is NonNullable<typeof card> => Boolean(card));

    if (id) {
      const card = cards[0];
      if (!card) return NextResponse.json({ error: "Profile card not found" }, { status: 404 });
      return NextResponse.json({ card });
    }

    return NextResponse.json({ cards });
  } catch (error) {
    console.error("Get profile cards error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const requestUser = await getRequestUser(request);
    if (!requestUser?.id) {
      return NextResponse.json({ error: "Please login first" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: requestUser.id },
      select: { muted: true },
    });
    if (user?.muted) {
      return NextResponse.json({ error: "Account muted" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = ProfileCardSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid profile card", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const tagNames = Array.from(
      new Set(["Profile Card", ...data.needs, ...data.interests].map((item) => item.trim()).filter(Boolean))
    ).slice(0, 8);

    const post = await db.post.create({
      data: {
        title: `Profile Card: ${data.name}`,
        content: buildProfileCardContent(data),
        authorId: requestUser.id,
        tags: {
          create: tagNames.map((name) => ({
            tag: { connectOrCreate: { where: { name }, create: { name } } },
          })),
        },
      },
      include: {
        author: { select: { id: true, username: true, avatar: true } },
      },
    });

    const card = parseProfileCardPost(post);
    return NextResponse.json({ card }, { status: 201 });
  } catch (error) {
    console.error("Create profile card error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const requestUser = await getRequestUser(request);
    if (!requestUser?.id) {
      return NextResponse.json({ error: "Please login first" }, { status: 401 });
    }

    const body = await request.json();
    const id = typeof body.id === "string" ? body.id : "";
    if (!id) return NextResponse.json({ error: "Missing profile card id" }, { status: 400 });

    const parsed = ProfileCardSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid profile card", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const existing = await db.post.findUnique({ where: { id } });
    if (!existing || !existing.content.startsWith(PROFILE_CARD_MARKER)) {
      return NextResponse.json({ error: "Profile card not found" }, { status: 404 });
    }
    if (existing.authorId !== requestUser.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const data = parsed.data;
    const post = await db.post.update({
      where: { id },
      data: {
        title: `Profile Card: ${data.name}`,
        content: buildProfileCardContent(data),
      },
      include: {
        author: { select: { id: true, username: true, avatar: true } },
      },
    });

    return NextResponse.json({ card: parseProfileCardPost(post) });
  } catch (error) {
    console.error("Update profile card error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const requestUser = await getRequestUser(request);
    if (!requestUser?.id) {
      return NextResponse.json({ error: "Please login first" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing profile card id" }, { status: 400 });

    const existing = await db.post.findUnique({ where: { id } });
    if (!existing || !existing.content.startsWith(PROFILE_CARD_MARKER)) {
      return NextResponse.json({ error: "Profile card not found" }, { status: 404 });
    }
    if (existing.authorId !== requestUser.id && requestUser.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await db.post.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete profile card error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
