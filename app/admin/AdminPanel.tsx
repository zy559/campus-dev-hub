"use client";

import Link from "next/link";
import { useState } from "react";
import type { AdminMonitorMetrics } from "@/lib/adminMetrics";

interface UserRow {
  id: string;
  username: string;
  email: string;
  role: string;
  warned: boolean;
  muted: boolean;
  bannedUntil: string | null;
  createdAt: string;
  postCount: number;
  commentCount: number;
}

interface ProfileCardRow {
  id: string;
  title: string;
  author: { username: string; email: string };
  createdAt: string;
}

interface AdminPanelProps {
  monitor: AdminMonitorMetrics;
  users: UserRow[];
  profileCards: ProfileCardRow[];
}

const STATUS_LABEL = {
  live: "实时",
  estimated: "估算",
  todo: "待接入",
} as const;

export default function AdminPanel({ monitor, users, profileCards }: AdminPanelProps) {
  const [search, setSearch] = useState("");
  const [list, setList] = useState(users);
  const [cards, setCards] = useState(profileCards);
  const [msg, setMsg] = useState("");

  const filtered = list.filter((user) => {
    const keyword = search.toLowerCase();
    return user.username.toLowerCase().includes(keyword) || user.email.toLowerCase().includes(keyword);
  });

  async function action(url: string, body: { userId: string } & Record<string, unknown>, okMsg: string) {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const data = await res.json();
      setMsg(data.error || "操作失败");
      return;
    }

    const data = await res.json();
    setMsg(okMsg);
    setList((prev) =>
      prev.map((user) =>
        user.id === body.userId
          ? {
              ...user,
              ...(data.muted !== undefined ? { muted: data.muted } : {}),
              ...(data.bannedUntil !== undefined ? { bannedUntil: data.bannedUntil } : {}),
              ...(data.warned !== undefined ? { warned: data.warned } : {}),
            }
          : user
      )
    );
  }

  async function deletePost(postId: string) {
    if (!confirm("确定删除这篇内容？")) return;
    const res = await fetch(`/api/admin/posts/${postId}`, { method: "DELETE" });
    if (res.ok) {
      setMsg("内容已删除");
      setCards((prev) => prev.filter((card) => card.id !== postId));
    } else {
      setMsg("删除失败");
    }
  }

  async function impersonate(user: UserRow) {
    if (!confirm(`确认以 ${user.username} 的身份进入系统？`)) return;
    const res = await fetch("/api/admin/impersonate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id }),
    });
    const data = await res.json();
    if (!res.ok) {
      setMsg(data.error || "模拟登录失败");
      return;
    }
    window.location.href = "/";
  }

  return (
    <div className="space-y-8">
      <MonitorOverview monitor={monitor} />

      <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-ink">资料卡管理</h2>
            <p className="mt-1 text-sm text-muted">管理员可以删除任何同学发布的资料卡。</p>
          </div>
          <span className="rounded-full bg-accent-subtle px-3 py-1 text-xs font-medium text-accent">{cards.length} 张</span>
        </div>
        <div className="space-y-2">
          {cards.length === 0 ? (
            <p className="rounded-xl bg-surface-alt p-4 text-sm text-muted">暂无资料卡。</p>
          ) : (
            cards.map((card) => (
              <div key={card.id} className="flex items-center justify-between gap-3 rounded-xl bg-surface-alt px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink">{card.title}</p>
                  <p className="mt-1 text-xs text-subtle">
                    {card.author.username} · {card.author.email} · {new Date(card.createdAt).toLocaleDateString("zh-CN")}
                  </p>
                </div>
                <button onClick={() => deletePost(card.id)} className="shrink-0 rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-700">
                  删除
                </button>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-ink">用户与内容治理</h2>
            <p className="mt-1 text-sm text-muted">处理警告、禁言、封禁、模拟登录和帖子删除。</p>
          </div>
          <div className="rounded-full bg-accent-subtle px-3 py-1 text-xs font-medium text-accent">
            {filtered.length} / {list.length} 位用户
          </div>
        </div>

        {msg && <div className="mb-4 rounded-xl bg-accent-subtle px-4 py-2 text-sm text-accent">{msg}</div>}

        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="搜索用户名或邮箱..."
          className="mb-5 block w-full rounded-xl border border-border bg-surface-alt px-4 py-2.5 text-sm text-ink outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
        />

        <div className="space-y-3">
          {filtered.map((user) => (
            <UserGovernanceCard key={user.id} user={user} action={action} deletePost={deletePost} impersonate={impersonate} />
          ))}
        </div>
      </section>
    </div>
  );
}

function MonitorOverview({ monitor }: { monitor: AdminMonitorMetrics }) {
  const cards = [
    monitor.summary.visitors,
    monitor.summary.hotPages,
    monitor.summary.conversion,
    monitor.summary.sources,
    monitor.summary.errors,
    monitor.summary.returning,
  ];

  return (
    <section className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <div key={card.label} className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-muted">{card.label}</p>
              <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${statusClass(card.status)}`}>
                {STATUS_LABEL[card.status]}
              </span>
            </div>
            <p className="mt-3 text-2xl font-bold text-ink">{card.value}</p>
            <p className="mt-2 text-xs leading-5 text-subtle">{card.helper}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.35fr_0.9fr]">
        <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-ink">7 天访问与动作趋势</h2>
              <p className="mt-1 text-sm text-muted">先用注册和互动数据模拟折线，后续可替换为真实埋点。</p>
            </div>
            <div className="flex gap-3 text-xs text-muted">
              <span className="inline-flex items-center gap-1"><i className="h-2 w-2 rounded-full bg-accent" />访客</span>
              <span className="inline-flex items-center gap-1"><i className="h-2 w-2 rounded-full bg-emerald-500" />动作</span>
            </div>
          </div>
          <TrendChart trend={monitor.trend} />
        </div>

        <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-ink">热门页面与停留</h2>
          <p className="mt-1 text-sm text-muted">用于判断同学真正关心哪些板块。</p>
          <div className="mt-4 space-y-3">
            {monitor.hotPages.map((page, index) => (
              <div key={page.name} className="rounded-xl bg-surface-alt p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">
                      {index + 1}. {page.name}
                    </p>
                    <p className="mt-1 text-xs text-subtle">{page.conversionHint}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-ink">{page.views}</p>
                    <p className="text-xs text-subtle">{page.avgStay}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function TrendChart({ trend }: { trend: AdminMonitorMetrics["trend"] }) {
  const width = 640;
  const height = 220;
  const padding = 28;
  const max = Math.max(1, ...trend.flatMap((item) => [item.visitors, item.actions]));
  const visitorPoints = toPolyline(trend.map((item) => item.visitors), max, width, height, padding);
  const actionPoints = toPolyline(trend.map((item) => item.actions), max, width, height, padding);

  return (
    <div className="overflow-hidden rounded-xl bg-surface-alt p-3">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-64 w-full" role="img" aria-label="访问与动作趋势折线图">
        {[0, 1, 2, 3].map((line) => {
          const y = padding + ((height - padding * 2) / 3) * line;
          return <line key={line} x1={padding} y1={y} x2={width - padding} y2={y} stroke="currentColor" className="text-border" strokeWidth="1" />;
        })}
        <polyline points={visitorPoints} fill="none" stroke="var(--accent)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        <polyline points={actionPoints} fill="none" stroke="rgb(16 185 129)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        {trend.map((item, index) => {
          const x = padding + ((width - padding * 2) / Math.max(1, trend.length - 1)) * index;
          return (
            <text key={item.label} x={x} y={height - 6} textAnchor="middle" className="fill-current text-[11px] text-subtle">
              {item.label}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

function UserGovernanceCard({
  user,
  action,
  deletePost,
  impersonate,
}: {
  user: UserRow;
  action: (url: string, body: { userId: string } & Record<string, unknown>, okMsg: string) => Promise<void>;
  deletePost: (id: string) => Promise<void>;
  impersonate: (user: UserRow) => Promise<void>;
}) {
  const isBanned = Boolean(user.bannedUntil && new Date(user.bannedUntil) > new Date());

  return (
    <div className={`rounded-2xl border border-border bg-surface-alt p-4 ${isBanned ? "ring-2 ring-red-400/40" : ""}`}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Link href={`/profile/${user.username}`} className="font-medium text-ink hover:text-accent">
              {user.username}
            </Link>
            {user.role === "admin" && <Badge tone="accent">管理员</Badge>}
            {user.warned && <Badge tone="yellow">已警告</Badge>}
            {user.muted && <Badge tone="orange">禁言</Badge>}
            {isBanned && <Badge tone="red">封禁至 {new Date(user.bannedUntil as string).toLocaleDateString("zh-CN")}</Badge>}
          </div>
          <p className="mt-1 text-xs text-subtle">
            {user.email} · {user.postCount} 帖 · {user.commentCount} 评 · {new Date(user.createdAt).toLocaleDateString("zh-CN")} 加入
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button onClick={() => impersonate(user)} className="rounded-full bg-teal-50 px-3 py-1 text-xs font-medium text-teal-700 transition hover:bg-teal-100">
            模拟登录
          </button>
          <button
            onClick={() => action("/api/admin/warn", { userId: user.id, warned: !user.warned }, user.warned ? "已取消警告" : "已警告")}
            className="rounded-full bg-yellow-50 px-3 py-1 text-xs font-medium text-yellow-700 transition hover:bg-yellow-100"
          >
            {user.warned ? "取消警告" : "警告"}
          </button>
          <button
            onClick={() => action("/api/admin/mute", { userId: user.id, muted: !user.muted }, user.muted ? "已解除禁言" : "已禁言")}
            className="rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-orange-700 transition hover:bg-orange-100"
          >
            {user.muted ? "解除禁言" : "禁言"}
          </button>
          <button
            onClick={() => {
              const days = prompt("封禁天数，输入 0 表示解封：");
              if (days !== null) {
                const parsed = Number.parseInt(days, 10) || 0;
                action("/api/admin/ban", { userId: user.id, days: parsed }, parsed > 0 ? `已封禁 ${parsed} 天` : "已解封");
              }
            }}
            className="rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-700 transition hover:bg-red-100"
          >
            {isBanned ? "调整封禁" : "封禁"}
          </button>
        </div>
      </div>

      {user.postCount > 0 && (
        <details className="mt-3">
          <summary className="cursor-pointer text-xs text-muted hover:text-accent">查看帖子 ({user.postCount})</summary>
          <UserPosts userId={user.id} onDelete={deletePost} />
        </details>
      )}
    </div>
  );
}

function UserPosts({ userId, onDelete }: { userId: string; onDelete: (id: string) => void }) {
  const [posts, setPosts] = useState<Array<{ id: string; title: string; createdAt: string; author: { id: string } }>>([]);
  const [loaded, setLoaded] = useState(false);

  async function load() {
    if (loaded) return;
    const res = await fetch("/api/posts?limit=50&includeCards=1");
    const data = await res.json();
    setPosts((data.posts || []).filter((post: { author: { id: string } }) => post.author.id === userId));
    setLoaded(true);
  }

  return (
    <div className="mt-3 max-h-48 space-y-2 overflow-y-auto" onClick={load}>
      {!loaded && <p className="cursor-pointer text-xs text-subtle">点击加载...</p>}
      {loaded && posts.length === 0 && <p className="text-xs text-subtle">暂无帖子</p>}
      {posts.map((post) => (
        <div key={post.id} className="flex items-center justify-between gap-3 rounded-lg bg-surface px-3 py-2 text-xs">
          <Link href={`/posts/${post.id}`} className="min-w-0 flex-1 truncate text-ink hover:text-accent">
            {post.title}
          </Link>
          <span className="text-subtle">{new Date(post.createdAt).toLocaleDateString("zh-CN")}</span>
          <button onClick={() => onDelete(post.id)} className="text-red-500 hover:text-red-700">
            删除
          </button>
        </div>
      ))}
    </div>
  );
}

function Badge({ tone, children }: { tone: "accent" | "yellow" | "orange" | "red"; children: React.ReactNode }) {
  const classes = {
    accent: "bg-accent-subtle text-accent",
    yellow: "bg-yellow-100 text-yellow-700",
    orange: "bg-orange-100 text-orange-700",
    red: "bg-red-100 text-red-700",
  };

  return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${classes[tone]}`}>{children}</span>;
}

function statusClass(status: "live" | "estimated" | "todo") {
  if (status === "live") return "bg-emerald-50 text-emerald-700";
  if (status === "estimated") return "bg-blue-50 text-blue-700";
  return "bg-slate-100 text-slate-500";
}

function toPolyline(values: number[], max: number, width: number, height: number, padding: number) {
  return values
    .map((value, index) => {
      const x = padding + ((width - padding * 2) / Math.max(1, values.length - 1)) * index;
      const y = height - padding - (value / max) * (height - padding * 2);
      return `${x},${y}`;
    })
    .join(" ");
}
