import bcrypt from "bcryptjs";
import { decode, encode } from "next-auth/jwt";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export interface WechatCode2SessionInput {
  appId: string;
  appSecret: string;
  code: string;
}

export interface WechatCode2SessionResponse {
  openid?: string;
  unionid?: string;
  session_key?: string;
  errcode?: number;
  errmsg?: string;
}

export interface AppAuthUser {
  id: string;
  username: string;
  email?: string | null;
  role: string;
}

export function buildCode2SessionUrl({ appId, appSecret, code }: WechatCode2SessionInput) {
  const url = new URL("https://api.weixin.qq.com/sns/jscode2session");
  url.searchParams.set("appid", appId);
  url.searchParams.set("secret", appSecret);
  url.searchParams.set("js_code", code);
  url.searchParams.set("grant_type", "authorization_code");
  return url;
}

export function buildWechatLocalEmail(openid: string) {
  return `wx_${openid.toLowerCase()}@wechat.local`;
}

export function buildWechatUsername(openid: string) {
  return `微信用户${openid.slice(-4)}`;
}

function buildWechatUsernameCandidate(openid: string, attempt: number) {
  const base = buildWechatUsername(openid);
  return attempt === 0 ? base : `${base}_${attempt}`;
}

export async function exchangeWechatCode(code: string, fetcher: typeof fetch = fetch) {
  const appId = process.env.WECHAT_APP_ID;
  const appSecret = process.env.WECHAT_APP_SECRET;

  if (!appId || !appSecret) {
    throw new Error("WECHAT_CONFIG_MISSING");
  }

  const res = await fetcher(buildCode2SessionUrl({ appId, appSecret, code }));
  const data = (await res.json()) as WechatCode2SessionResponse;
  if (!res.ok || !data.openid || data.errcode) {
    throw new Error(data.errmsg || "WECHAT_CODE_EXCHANGE_FAILED");
  }
  return {
    appId,
    openid: data.openid,
    unionid: data.unionid,
  };
}

export async function findOrCreateWechatUser({
  appId,
  openid,
  unionid,
}: {
  appId: string;
  openid: string;
  unionid?: string;
}) {
  const existing = await db.wechatIdentity.findUnique({
    where: { appId_openid: { appId, openid } },
    include: { user: true },
  });

  if (existing) {
    if (unionid && existing.unionid !== unionid) {
      await db.wechatIdentity.update({
        where: { id: existing.id },
        data: { unionid },
      });
    }
    return existing.user;
  }

  const password = await bcrypt.hash(`wechat:${openid}:${crypto.randomUUID()}`, 12);
  const email = buildWechatLocalEmail(openid);

  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      const user = await db.user.create({
        data: {
          username: buildWechatUsernameCandidate(openid, attempt),
          email,
          password,
          emailVerified: true,
          wechatIdentities: {
            create: {
              appId,
              openid,
              unionid: unionid || null,
            },
          },
        },
      });

      return user;
    } catch (error) {
      if (attempt === 4) throw error;
    }
  }

  throw new Error("WECHAT_USER_CREATE_FAILED");
}

export async function issueAppToken(user: { id: string; username: string; email: string; role: string }) {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) throw new Error("NEXTAUTH_SECRET_MISSING");

  return encode({
    token: {
      id: user.id,
      sub: user.id,
      name: user.username,
      username: user.username,
      email: user.email,
      role: user.role,
    },
    secret,
    maxAge: 30 * 24 * 60 * 60,
  });
}

export async function getRequestUser(request: Request): Promise<AppAuthUser | null> {
  const session = await getServerSession(authOptions);
  if (session?.user?.id) {
    return {
      id: session.user.id,
      username: session.user.name || "",
      email: session.user.email,
      role: session.user.role || "user",
    };
  }

  const authHeader = request.headers.get("authorization") || "";
  const bearerToken = authHeader.startsWith("Bearer ") ? authHeader.slice("Bearer ".length).trim() : "";
  if (!bearerToken) return null;

  const token = await decode({
    token: bearerToken,
    secret: process.env.NEXTAUTH_SECRET || "",
  });

  if (!token?.id) return null;
  return {
    id: String(token.id),
    username: String(token.username || token.name || ""),
    email: typeof token.email === "string" ? token.email : null,
    role: String(token.role || "user"),
  };
}
