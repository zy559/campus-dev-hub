import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { encode } from "next-auth/jwt";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getRequestUser, issueAppToken } from "@/lib/wechatAuth";

type SessionTokenPayload = Record<string, unknown> & { id: string };

export const dynamic = "force-dynamic";

function sessionCookieName() {
  return process.env.NODE_ENV === "production" ? "__Secure-next-auth.session-token" : "next-auth.session-token";
}

function isBearerRequest(request: Request) {
  return (request.headers.get("authorization") || "").startsWith("Bearer ");
}

async function writeSessionCookie(tokenPayload: SessionTokenPayload, body: Record<string, unknown> = { success: true }) {
  const token = await encode({
    token: tokenPayload,
    secret: process.env.NEXTAUTH_SECRET || "",
  });

  const response = NextResponse.json(body);
  const isProd = process.env.NODE_ENV === "production";
  response.cookies.set(sessionCookieName(), token, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: 30 * 24 * 60 * 60,
  });
  return response;
}

export async function POST(request: Request) {
  try {
    const requestUser = await getRequestUser(request);

    if (!requestUser?.id) {
      return NextResponse.json({ error: "Please login first" }, { status: 401 });
    }

    if (requestUser.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { userId, username, query } = await request.json();
    const keyword = String(query || username || "").trim();
    const targetUser = await db.user.findFirst({
      where: userId
        ? { id: String(userId) }
        : {
            OR: [
              { id: keyword },
              { username: keyword },
              { email: keyword },
            ],
          },
      select: { id: true, username: true, email: true, avatar: true, bio: true, role: true },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (targetUser.id === requestUser.id) {
      return NextResponse.json({ error: "Cannot impersonate yourself" }, { status: 400 });
    }

    if (isBearerRequest(request)) {
      const token = await issueAppToken(targetUser);
      return NextResponse.json({
        token,
        user: {
          id: targetUser.id,
          username: targetUser.username,
          avatar: targetUser.avatar,
          bio: targetUser.bio,
          role: targetUser.role,
          impersonating: true,
          impersonatorId: requestUser.id,
          impersonatorName: requestUser.username,
        },
      });
    }

    return writeSessionCookie(
      {
        id: targetUser.id,
        sub: targetUser.id,
        username: targetUser.username,
        name: targetUser.username,
        email: targetUser.email,
        role: targetUser.role,
        impersonating: true,
        impersonatorId: requestUser.id,
        impersonatorName: requestUser.username,
        impersonatorRole: requestUser.role,
      },
      { success: true, username: targetUser.username }
    );
  } catch (error) {
    console.error("Impersonate error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    if (isBearerRequest(request)) {
      const requestUser = await getRequestUser(request);
      const impersonatorId = requestUser?.id ? null : null;
      return NextResponse.json({ error: "Please login again as admin", impersonatorId }, { status: 400 });
    }

    const session = await getServerSession(authOptions);

    if (!session?.user?.impersonating || !session.user.impersonatorId) {
      return NextResponse.json({ error: "Not impersonating" }, { status: 400 });
    }

    if (session.user.impersonatorRole !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const admin = await db.user.findUnique({
      where: { id: session.user.impersonatorId },
      select: { id: true, username: true, email: true, role: true },
    });

    if (!admin || admin.role !== "admin") {
      return NextResponse.json({ error: "Admin account not found" }, { status: 404 });
    }

    return writeSessionCookie({
      id: admin.id,
      sub: admin.id,
      username: admin.username,
      name: admin.username,
      email: admin.email,
      role: admin.role,
    });
  } catch (error) {
    console.error("Stop impersonation error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
