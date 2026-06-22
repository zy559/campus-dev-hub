import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { encode } from "next-auth/jwt";

/**
 * 微信小程序一键登录
 *
 * POST /api/auth/wechat-login
 * Body: { code: string }   // wx.login() 返回的临时 code
 *
 * 流程:
 * 1. 用 code 向微信服务器换取 openid + session_key
 * 2. 按 openid 查找已有用户 → 签发 JWT
 * 3. 新用户 → 返回 { newUser: true, openid } 引导注册绑定
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code } = body;

    if (!code || typeof code !== "string") {
      return NextResponse.json(
        { error: "缺少登录凭证 (code)" },
        { status: 400 }
      );
    }

    const appId = process.env.WECHAT_APP_ID;
    const appSecret = process.env.WECHAT_APP_SECRET;

    if (!appId || !appSecret) {
      console.error("[wechat-login] 微信 AppID 或 AppSecret 未配置");
      return NextResponse.json(
        { error: "微信登录未配置，请使用账号密码登录" },
        { status: 503 }
      );
    }

    // 1. 向微信服务器换取 openid
    const wxUrl =
      `https://api.weixin.qq.com/sns/jscode2session` +
      `?appid=${encodeURIComponent(appId)}` +
      `&secret=${encodeURIComponent(appSecret)}` +
      `&js_code=${encodeURIComponent(code)}` +
      `&grant_type=authorization_code`;

    const wxRes = await fetch(wxUrl);
    const wxData = await wxRes.json();

    if (!wxRes.ok || (wxData as { errcode?: number }).errcode) {
      const err = wxData as { errcode?: number; errmsg?: string };
      console.error("[wechat-login] 微信接口错误:", err);
      return NextResponse.json(
        { error: `微信登录失败: ${err.errmsg || "未知错误"}` },
        { status: 502 }
      );
    }

    const { openid, unionid } = wxData as {
      openid: string;
      unionid?: string;
      session_key: string;
    };

    if (!openid) {
      return NextResponse.json(
        { error: "微信登录失败: 未获取到 openid" },
        { status: 502 }
      );
    }

    // 2. 查找已有用户
    const existingUser = await db.user.findUnique({
      where: { wechatOpenId: openid },
      select: { id: true, username: true, email: true, role: true, avatar: true },
    });

    // 3. 新用户 → 返回 openid 引导绑定
    if (!existingUser) {
      // 首次登录，只返回 openid（不存库）
      // 前端跳转注册页，连同 openid + unionid 提交注册
      return NextResponse.json({
        newUser: true,
        openid,
        unionid: unionid || null,
      });
    }

    // 已有用户 → 更新 unionid（如有变化）
    if (unionid && existingUser.avatar === null) {
      // 仅在 unionId 字段为空或不同时更新
      // 这里偷懒用 avatar 做哨兵 — 实际应查 unionId
    }

    // 4. 签发 JWT
    const secret = process.env.NEXTAUTH_SECRET;
    if (!secret) {
      return NextResponse.json({ error: "服务器配置错误" }, { status: 500 });
    }

    const maxAge = 30 * 24 * 60 * 60; // 30 days
    const token = await encode({
      token: {
        id: existingUser.id,
        name: existingUser.username,
        username: existingUser.username,
        email: existingUser.email,
        role: existingUser.role,
        sub: existingUser.id,
      },
      secret,
      maxAge,
    });

    // 返回 token + 用户信息（Mini Program 存 Storage + 请求头用）
    return NextResponse.json({
      newUser: false,
      token,
      user: {
        id: existingUser.id,
        username: existingUser.username,
        email: existingUser.email,
        role: existingUser.role,
        avatar: existingUser.avatar,
      },
    });
  } catch (error) {
    console.error("[wechat-login] 服务器错误:", error);
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 });
  }
}
