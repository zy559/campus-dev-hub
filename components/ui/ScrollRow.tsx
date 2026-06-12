"use client";

import { useRef, useEffect, useState } from "react";

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

export default function ScrollRow({ cards, speed = 30 }: ScrollRowProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const posRef = useRef(0);

  useEffect(() => {
    let rafId = 0;
    let lastTime = 0;

    const animate = (time: number) => {
      if (!lastTime) lastTime = time;
      const dt = Math.min(time - lastTime, 50);
      lastTime = time;

      if (!paused) {
        posRef.current -= (speed * dt) / 1000;
        const track = trackRef.current;
        if (track) {
          const halfWidth = track.scrollWidth / 2;
          if (posRef.current <= -halfWidth) posRef.current += halfWidth;
          if (posRef.current > 0) posRef.current -= halfWidth;
          track.style.transform = `translateX(${posRef.current}px)`;
        }
      }

      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [speed, paused]);

  const doubled = [...cards, ...cards];

  return (
    <div
      className="overflow-hidden py-2"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div ref={trackRef} className="flex gap-5 w-max">
        {doubled.map((card, i) => (
          <a
            key={`${card.id}-${i}`}
            href={card.link || "#"}
            className="flex-shrink-0 w-[280px] sm:w-[320px] rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl relative group"
          >
            {card.img ? (
              <img
                src={card.img}
                alt=""
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                loading="lazy"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-accent-subtle to-accent-soft" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-black/10" />
            <div className="relative z-10 p-6 flex flex-col justify-end h-[220px]">
              <div className="text-3xl mb-3 drop-shadow-md">{card.icon}</div>
              <h4 className="font-bold text-white text-lg mb-1.5 drop-shadow-sm">{card.title}</h4>
              <p className="text-white/80 text-sm leading-relaxed drop-shadow-sm">{card.description}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
