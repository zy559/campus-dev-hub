import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import PostCard from "@/components/posts/PostCard";

afterEach(() => {
  cleanup();
});

const mockPost = {
  id: "post-1",
  title: "一篇测试帖子",
  content: "这是帖子的摘要内容",
  author: {
    id: "user-1",
    username: "testuser",
    avatar: null,
  },
  tags: [
    { id: "tag-1", name: "前端" },
    { id: "tag-2", name: "React" },
  ],
  commentCount: 5,
  createdAt: new Date("2026-06-10").toISOString(),
};

describe("PostCard", () => {
  it("渲染帖子标题", () => {
    render(<PostCard {...mockPost} />);
    expect(screen.getByText("一篇测试帖子")).toBeDefined();
  });

  it("渲染帖子摘要内容", () => {
    render(<PostCard {...mockPost} />);
    expect(screen.getByText("这是帖子的摘要内容")).toBeDefined();
  });

  it("渲染作者用户名", () => {
    render(<PostCard {...mockPost} />);
    expect(screen.getByText("testuser")).toBeDefined();
  });

  it("渲染所有标签", () => {
    render(<PostCard {...mockPost} />);
    expect(screen.getByText("前端")).toBeDefined();
    expect(screen.getByText("React")).toBeDefined();
  });

  it("渲染评论数量", () => {
    render(<PostCard {...mockPost} />);
    expect(screen.getByText("5 条评论")).toBeDefined();
  });

  it("标题链接指向帖子详情", () => {
    render(<PostCard {...mockPost} />);
    const link = screen.getByRole("link", { name: "一篇测试帖子" });
    expect(link.getAttribute("href")).toBe("/posts/post-1");
  });
});
