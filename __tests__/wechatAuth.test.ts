import { describe, expect, it, vi } from "vitest";
import {
  buildCode2SessionUrl,
  buildWechatLocalEmail,
  buildWechatUsername,
  resolveBearerTokenUser,
} from "@/lib/wechatAuth";

describe("wechat auth helpers", () => {
  it("builds the official code2Session url", () => {
    const url = buildCode2SessionUrl({
      appId: "wx-app",
      appSecret: "secret",
      code: "login-code",
    });

    expect(url.toString()).toBe(
      "https://api.weixin.qq.com/sns/jscode2session?appid=wx-app&secret=secret&js_code=login-code&grant_type=authorization_code"
    );
  });

  it("builds a deterministic internal email for openid", () => {
    expect(buildWechatLocalEmail("OPEN-ID")).toBe("wx_open-id@wechat.local");
  });

  it("builds a valid bounded username from openid", () => {
    expect(buildWechatUsername("abcdef1234567890")).toBe("微信用户7890");
  });

  it("hydrates bearer token role from the database", async () => {
    const findUnique = vi.fn().mockResolvedValue({
      id: "user-1",
      username: "admin",
      email: "admin@example.com",
      role: "admin",
    });

    const user = await resolveBearerTokenUser(
      {
        id: "user-1",
        username: "old-admin",
        email: "admin@example.com",
        role: "user",
      },
      { user: { findUnique } }
    );

    expect(user).toMatchObject({
      id: "user-1",
      username: "admin",
      role: "admin",
    });
  });
});
