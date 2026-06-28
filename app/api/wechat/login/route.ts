import { NextResponse } from "next/server";
import {
  exchangeWechatCode,
  findOrCreateWechatUser,
  issueAppToken,
} from "@/lib/wechatAuth";

export async function POST(request: Request) {
  try {
    const { code } = await request.json();
    const cleanCode = String(code || "").trim();

    if (!cleanCode) {
      return NextResponse.json({ error: "缺少微信登录 code" }, { status: 400 });
    }

    const identity = await exchangeWechatCode(cleanCode);
    const user = await findOrCreateWechatUser(identity);
    const token = await issueAppToken(user);

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        avatar: user.avatar,
        bio: user.bio,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("[wechat-login] error:", error);
    const message = error instanceof Error ? error.message : "";
    if (message === "WECHAT_CONFIG_MISSING") {
      return NextResponse.json({ error: "微信登录环境变量未配置" }, { status: 500 });
    }
    if (message === "NEXTAUTH_SECRET_MISSING") {
      return NextResponse.json({ error: "登录密钥未配置" }, { status: 500 });
    }
    return NextResponse.json({ error: "微信登录失败" }, { status: 401 });
  }
}
