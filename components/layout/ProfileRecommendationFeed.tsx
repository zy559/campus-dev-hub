"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export interface ProfileCardItem {
  id: string;
  authorId: string;
  username: string;
  name: string;
  meta: string;
  needs: string[];
  interests: string[];
  intro: string;
  images: string[];
  createdAt: string;
}

const fallbackGradients = [
  "from-white via-teal-50 to-sky-50",
  "from-white via-cyan-50 to-emerald-50",
  "from-white via-sky-50 to-indigo-50",
];

const LIKE_KEY = "campus-dev-hub-liked-profile-cards";

export default function ProfileRecommendationFeed({
  cards,
  isBrowsing,
  viewer,
}: {
  cards: ProfileCardItem[];
  isBrowsing: boolean;
  viewer?: { id: string; role: string };
}) {
  const router = useRouter();
  const [cardIndex, setCardIndex] = useState(0);
  const [imageIndex, setImageIndex] = useState(0);
  const [chatLoading, setChatLoading] = useState(false);
  const [likedIds, setLikedIds] = useState<string[]>([]);
  const card = cards[cardIndex % Math.max(cards.length, 1)];
  const image = card?.images[imageIndex];
  const isLiked = Boolean(card && likedIds.includes(card.id));
  const canManage = Boolean(card?.authorId && (viewer?.id === card.authorId || viewer?.role === "admin"));
  const opener = useMemo(() => {
    const interest = card?.interests.slice(0, 2).join("、") || "校园生活";
    return `你好，我看到你的资料卡，感觉我们都对${interest}感兴趣，可以认识一下吗？`;
  }, [card]);

  useEffect(() => {
    try {
      setLikedIds(JSON.parse(localStorage.getItem(LIKE_KEY) || "[]"));
    } catch {
      setLikedIds([]);
    }
  }, []);

  if (!card) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 pb-24 lg:pb-8">
        <section className="rounded-[1.5rem] bg-white/75 p-8 text-center shadow-sm ring-1 ring-white/70 backdrop-blur-xl">
          <p className="text-sm font-black text-teal-700">今日遇见</p>
          <h1 className="mt-2 text-3xl font-black text-slate-950">还没有资料卡</h1>
          <p className="mt-3 text-sm text-slate-500">发布第一张资料卡，让同学可以认识你、喜欢你、向你发起聊天。</p>
          <Link href="/posts/new?type=card" className="mt-6 inline-flex rounded-full bg-teal-600 px-5 py-2.5 text-sm font-black text-white">
            发布资料卡
          </Link>
        </section>
      </div>
    );
  }

  function saveLiked(next: string[]) {
    setLikedIds(next);
    localStorage.setItem(LIKE_KEY, JSON.stringify(next));
  }

  function nextCard() {
    setCardIndex((value) => (value + 1) % cards.length);
    setImageIndex(0);
  }

  function likeCard() {
    if (!isLiked) saveLiked([...likedIds, card.id]);
    router.push("/me#liked");
  }

  async function deleteCard() {
    if (!confirm("确认删除这张资料卡？")) return;
    const res = await fetch(`/api/posts/${card.id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.error || "删除失败");
      return;
    }
    router.refresh();
    nextCard();
  }

  async function startChat(anonymous = false) {
    const draft = anonymous ? "我想先匿名了解一下你的资料卡，可以聊聊吗？" : opener;
    if (!card.authorId) {
      router.push(`/messages?opener=${encodeURIComponent(draft)}`);
      return;
    }

    setChatLoading(true);
    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participantId: card.authorId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "发起聊天失败");
      router.push(`/messages/${data.id}?opener=${encodeURIComponent(draft)}${anonymous ? "&mode=private" : ""}`);
    } catch {
      alert("发起聊天失败，请先确认已经登录。");
    } finally {
      setChatLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-3 py-4 pb-40 sm:px-4 lg:pb-6">
      {isBrowsing && (
        <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-teal-100 bg-white/80 px-5 py-4 text-teal-900 shadow-sm backdrop-blur sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-medium">你正在以游客身份浏览。登录后可以发布资料卡、喜欢、聊天和匿名开口。</p>
          <Link href="/login" className="inline-flex justify-center rounded-full bg-teal-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-teal-500">
            立即登录
          </Link>
        </div>
      )}

      <section className="rounded-[1.5rem] bg-white/60 p-3 shadow-sm ring-1 ring-white/70 backdrop-blur-xl sm:p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-black text-teal-700">今日遇见</p>
            <h1 className="mt-1 text-3xl font-black tracking-normal text-slate-950">推荐</h1>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/posts/new?type=card" className="rounded-full bg-white/80 px-4 py-2 text-sm font-black text-slate-700 shadow-sm ring-1 ring-white/80">
              发资料卡
            </Link>
            <Link href="/activity" className="rounded-full bg-teal-600 px-4 py-2 text-sm font-black text-white shadow-sm">
              动态
            </Link>
          </div>
        </div>

        <div className="overflow-hidden rounded-[1.5rem] bg-white/80 shadow-xl ring-1 ring-white/80 backdrop-blur-xl">
          <div className={`relative min-h-[calc(100svh-15rem)] bg-gradient-to-br ${fallbackGradients[cardIndex % fallbackGradients.length]} p-4 sm:min-h-[560px] sm:p-6`}>
            <div className="absolute left-1/2 top-4 z-10 -translate-x-1/2 rounded-full bg-white/80 px-4 py-1.5 text-xs font-black text-teal-700 shadow-sm ring-1 ring-white/80 backdrop-blur">
              校园匹配
            </div>

            <div className="mt-10 grid gap-4 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
              <div>
                <div className="relative mx-auto aspect-[3/4] max-h-[46svh] overflow-hidden rounded-[1.25rem] bg-white shadow-lg ring-1 ring-white/80 sm:max-h-[520px]">
                  {image ? (
                    <img src={image} alt={`${card.name} 的资料卡图片`} className="h-full w-full object-cover" />
                  ) : (
                    <div className="relative h-full w-full bg-gradient-to-br from-white via-teal-50 to-sky-50">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_45%_24%,rgba(255,255,255,0.95),transparent_18%),radial-gradient(circle_at_55%_46%,rgba(20,184,166,0.12),transparent_18%),radial-gradient(circle_at_50%_76%,rgba(14,165,233,0.14),transparent_30%)]" />
                      <div className="absolute inset-x-0 bottom-10 text-center">
                        <p className="text-6xl font-black text-teal-600/20">{card.name.slice(0, 1)}</p>
                      </div>
                    </div>
                  )}
                </div>
                {card.images.length > 1 && (
                  <div className="mt-3 flex justify-center gap-2">
                    {card.images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setImageIndex(index)}
                        className={`h-2.5 rounded-full transition ${imageIndex === index ? "w-7 bg-teal-600" : "w-2.5 bg-white ring-1 ring-teal-100"}`}
                        aria-label={`切换第 ${index + 1} 张图片`}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-[1.25rem] bg-white/80 p-4 shadow-sm ring-1 ring-white/70 backdrop-blur sm:p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="truncate text-3xl font-black text-slate-950 sm:text-4xl">{card.name}</h2>
                    <p className="mt-2 inline-flex max-w-full rounded-full bg-slate-100/80 px-3 py-1 text-sm font-bold text-slate-600">
                      <span className="truncate">{card.meta}</span>
                    </p>
                  </div>
                  <div className="rounded-2xl bg-teal-50 px-3 py-2 text-center text-teal-700 ring-1 ring-teal-100">
                    <p className="text-xs font-bold">在线</p>
                    <p className="text-lg font-black">可聊</p>
                  </div>
                </div>

                {canManage && (
                  <div className="mt-4 flex gap-2">
                    <Link href={`/posts/new?type=card&edit=${card.id}`} className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-slate-700 ring-1 ring-slate-100">
                      编辑资料卡
                    </Link>
                    <button onClick={deleteCard} className="rounded-full bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600">
                      删除
                    </button>
                  </div>
                )}

                <InfoChips title="TA 想找" items={card.needs} strong />
                <InfoChips title="兴趣" items={card.interests} />

                <p className="mt-5 line-clamp-3 text-sm leading-7 text-slate-900 sm:line-clamp-none sm:text-base">“{card.intro}”</p>

                <div className="mt-6 hidden grid-cols-3 gap-2 sm:grid">
                  <ActionButtons nextCard={nextCard} likeCard={likeCard} startChat={() => startChat(false)} chatLoading={chatLoading} isLiked={isLiked} />
                </div>
                <button type="button" onClick={() => startChat(true)} className="mt-3 hidden w-full text-center text-sm font-bold text-teal-700 sm:block">
                  匿名开口
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="fixed inset-x-3 bottom-20 z-[55] grid grid-cols-3 gap-2 rounded-2xl bg-white/95 p-2 shadow-2xl ring-1 ring-slate-100 backdrop-blur sm:hidden">
        <ActionButtons nextCard={nextCard} likeCard={likeCard} startChat={() => startChat(false)} chatLoading={chatLoading} isLiked={isLiked} />
      </div>
    </div>
  );
}

function ActionButtons({
  nextCard,
  likeCard,
  startChat,
  chatLoading,
  isLiked,
}: {
  nextCard: () => void;
  likeCard: () => void;
  startChat: () => void;
  chatLoading: boolean;
  isLiked: boolean;
}) {
  return (
    <>
      <button onClick={nextCard} className="rounded-full border border-slate-200 bg-white py-3 text-sm font-black text-slate-500">
        跳过
      </button>
      <button onClick={likeCard} className="rounded-full bg-sky-500 py-3 text-sm font-black text-white">
        {isLiked ? "已喜欢" : "喜欢"}
      </button>
      <button onClick={startChat} disabled={chatLoading} className="rounded-full bg-slate-950 py-3 text-center text-sm font-black text-white disabled:opacity-60">
        {chatLoading ? "连接中" : "聊天"}
      </button>
    </>
  );
}

function InfoChips({ title, items, strong = false }: { title: string; items: string[]; strong?: boolean }) {
  if (items.length === 0) return null;

  return (
    <div className="mt-5">
      <p className="text-sm font-black text-slate-950">{title}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {items.map((item) => (
          <span
            key={item}
            className={`rounded-full px-3 py-1.5 text-sm font-black ${
              strong ? "bg-teal-100 text-teal-700" : "bg-white text-slate-600 ring-1 ring-slate-100"
            }`}
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
