import { describe, expect, it } from "vitest";
import { buildAdminMonitorMetrics } from "@/lib/adminMetrics";

describe("buildAdminMonitorMetrics", () => {
  it("计算管理员监控面板的核心指标和转化率", () => {
    const now = new Date("2026-06-27T12:00:00.000Z");

    const metrics = buildAdminMonitorMetrics({
      now,
      totalUsers: 120,
      totalPosts: 48,
      totalComments: 96,
      totalConversations: 18,
      newUsers7d: 14,
      newPosts7d: 21,
      newComments7d: 38,
      newConversations7d: 9,
      recentUsers: [
        { createdAt: new Date("2026-06-27T03:00:00.000Z") },
        { createdAt: new Date("2026-06-25T03:00:00.000Z") },
        { createdAt: new Date("2026-06-20T03:00:00.000Z") },
      ],
      boardPostCounts: [
        { name: "组队比赛", count: 12 },
        { name: "遇见同频", count: 8 },
      ],
    });

    expect(metrics.summary.visitors.value).toBe("120");
    expect(metrics.summary.conversion.value).toBe("57%");
    expect(metrics.summary.returning.value).toBe("67%");
    expect(metrics.summary.errors.value).toBe("待接入");
    expect(metrics.trend).toHaveLength(7);
    expect(metrics.hotPages[0]).toMatchObject({
      name: "组队比赛",
      views: 12,
    });
  });
});
