"use client";

import { useRef, useEffect, useState, useCallback } from "react";

interface ScrollCard {
  id: string;
  img?: string;
  icon: string;
  title: string;
  description: string;
  link?: string;
}

interface ScrollRowProps {
  cards: ScrollCard[];
  speed?: number;
}

// 替代 Unsplash 的纯色渐变 — 每种主题一张
const FALLBACK_GRADIENTS = [
  "from-blue-500 to-indigo-600",
  "from-emerald-500 to-teal-600",
  "from-violet-500 to-purple-600",
  "from-amber-500 to-orange-600",
  "from-cyan-500 to-blue-600",
  "from-rose-500 to-pink-600",
  "from-sky-500 to-indigo-500",
  "from-teal-500 to-emerald-500",
  "from-orange-400 to-red-500",
  "from-lime-500 to-green-600",
  "from-fuchsia-500 to-purple-600",
  "from-blue-400 to-cyan-500",
  "from-red-400 to-rose-500",
  "from-green-500 to-teal-500",
  "from-indigo-400 to-blue-500",
  "from-pink-400 to-rose-500",
];

export default function ScrollRow({ cards, speed = 30 }: ScrollRowProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [imgFailed, setImgFailed] = useState<Set<string>>(new Set());
  const [isTouching, setIsTouching] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const rafRef = useRef(0);

  const doubled = [...cards, ...cards];

  const markFailed = useCallback((cardId: string) => {
    setImgFailed((prev) => {
      if (prev.has(cardId)) return prev;
      const next = new Set(prev);
      next.add(cardId);
      return next;
    });
  }, []);

  // 自动滚动（驱动 scrollLeft）
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let lastTime = 0;

    const animate = (time: number) => {
      if (!lastTime) lastTime = time;
      const dt = Math.min(time - lastTime, 50);
      lastTime = time;

      // 用户正在触摸或悬停 → 暂停自动滚动
      if (!isTouching && !isHovering && container) {
        container.scrollLeft += (speed * dt) / 1000;

        // 无限循环：快到头时跳回一半（视觉上无缝，因为 doubled）
        const halfWidth = container.scrollWidth / 2;
        if (container.scrollLeft >= halfWidth) {
          container.scrollLeft -= halfWidth;
        }
        if (container.scrollLeft <= 0) {
          container.scrollLeft += halfWidth;
        }
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [speed, isTouching, isHovering]);

  return (
    <div
      ref={containerRef}
      className="overflow-x-auto scrollbar-hide py-2 -mx-6 px-6"
      style={{ scrollSnapType: "x mandatory", scrollBehavior: "auto" }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onTouchStart={() => setIsTouching(true)}
      onTouchEnd={() => {
        // 延迟恢复自动滚动，避免和惯性滚动打架
        setTimeout(() => setIsTouching(false), 800);
      }}
    >
      <div className="flex gap-4 sm:gap-5 w-max">
        {doubled.map((card, i) => {
          const gradient = FALLBACK_GRADIENTS[i % FALLBACK_GRADIENTS.length];
          const hasImg = card.img && !imgFailed.has(card.id);

          return (
            <a
              key={`${card.id}-${i}`}
              href={card.link || "#"}
              className="flex-shrink-0 w-[280px] sm:w-[320px] rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl active:scale-95 relative group"
              style={{ scrollSnapAlign: "start" }}
            >
              {/* 背景：图片或纯色渐变 */}
              {hasImg ? (
                <img
                  src={card.img}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  loading="lazy"
                  onError={() => markFailed(card.id)}
                />
              ) : (
                <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              <div className="relative z-10 p-6 flex flex-col justify-end h-[220px]">
                <div className="text-3xl mb-3 drop-shadow-md">{card.icon}</div>
                <h4 className="font-bold text-white text-lg mb-1.5 drop-shadow-sm">{card.title}</h4>
                <p className="text-white/80 text-sm leading-relaxed drop-shadow-sm">{card.description}</p>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
