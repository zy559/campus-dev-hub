import { describe, expect, it } from "vitest";
import { getLocalPreviewUser } from "@/lib/localPreviewAuth";

describe("getLocalPreviewUser", () => {
  it("在开发环境允许本地预览管理员登录", () => {
    const user = getLocalPreviewUser({
      nodeEnv: "development",
      username: "admin",
      password: "admin123",
    });

    expect(user).toMatchObject({
      id: "local-preview-admin",
      name: "admin",
      role: "admin",
    });
  });

  it("生产环境不允许本地预览登录", () => {
    const user = getLocalPreviewUser({
      nodeEnv: "production",
      username: "admin",
      password: "admin123",
    });

    expect(user).toBeNull();
  });
});
