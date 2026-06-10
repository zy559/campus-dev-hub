import { describe, it, expect } from "vitest";
import {
  RegisterSchema,
  LoginSchema,
  PostSchema,
  CommentSchema,
} from "@/lib/validators";

describe("RegisterSchema", () => {
  it("接受合法的注册数据", () => {
    const result = RegisterSchema.safeParse({
      username: "testuser",
      email: "test@example.com",
      password: "123456",
    });
    expect(result.success).toBe(true);
  });

  it("拒绝过短的用户名", () => {
    const result = RegisterSchema.safeParse({
      username: "a",
      email: "test@example.com",
      password: "123456",
    });
    expect(result.success).toBe(false);
  });

  it("拒绝无效的邮箱", () => {
    const result = RegisterSchema.safeParse({
      username: "testuser",
      email: "not-an-email",
      password: "123456",
    });
    expect(result.success).toBe(false);
  });

  it("拒绝过短的密码", () => {
    const result = RegisterSchema.safeParse({
      username: "testuser",
      email: "test@example.com",
      password: "123",
    });
    expect(result.success).toBe(false);
  });
});

describe("LoginSchema", () => {
  it("接受合法的登录数据", () => {
    const result = LoginSchema.safeParse({
      email: "test@example.com",
      password: "mypassword",
    });
    expect(result.success).toBe(true);
  });

  it("拒绝空密码", () => {
    const result = LoginSchema.safeParse({
      email: "test@example.com",
      password: "",
    });
    expect(result.success).toBe(false);
  });
});

describe("PostSchema", () => {
  it("接受合法的帖子数据", () => {
    const result = PostSchema.safeParse({
      title: "测试帖子",
      content: "这是帖子内容",
      tagIds: ["tag-1", "tag-2"],
    });
    expect(result.success).toBe(true);
  });

  it("拒绝空标题", () => {
    const result = PostSchema.safeParse({
      title: "",
      content: "内容",
      tagIds: [],
    });
    expect(result.success).toBe(false);
  });

  it("拒绝空内容", () => {
    const result = PostSchema.safeParse({
      title: "标题",
      content: "",
      tagIds: [],
    });
    expect(result.success).toBe(false);
  });

  it("拒绝超过 5 个标签", () => {
    const result = PostSchema.safeParse({
      title: "标题",
      content: "内容",
      tagIds: ["1", "2", "3", "4", "5", "6"],
    });
    expect(result.success).toBe(false);
  });
});

describe("CommentSchema", () => {
  it("接受合法评论", () => {
    const result = CommentSchema.safeParse({
      content: "好帖子！",
    });
    expect(result.success).toBe(true);
  });

  it("拒绝空评论", () => {
    const result = CommentSchema.safeParse({
      content: "",
    });
    expect(result.success).toBe(false);
  });

  it("拒绝超过 2000 字的评论", () => {
    const result = CommentSchema.safeParse({
      content: "a".repeat(2001),
    });
    expect(result.success).toBe(false);
  });
});
